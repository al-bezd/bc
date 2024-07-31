import { BaseManager } from "@/classes/BaseManager";
import { DB2Manager, IScaningStoreController } from "@/classes/DB2Manager";
import { IScaning } from "@/interfaces/IScaning";
import { ISohDocument } from "./interfaces";
import { Ref, ref, toRaw } from "vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { HttpManager } from "@/classes/HttpManager";
import { IStore } from "@/interfaces/IStore";
import { IDocument } from "@/interfaces/IDocument";
import { UserManager } from "../user/UserManager";

export class SohShipmentManager extends BaseManager {
  public static instance: SohShipmentManager

  protected currentDocumentKey = "SohShipmentManager__currentDocument"
  protected currentScaningsKey = "SohShipmentManager__currentScanings"
  protected storesKey = "SohShipmentManager__stores"

  protected ВидДокумента = "ОтгрузкаТоваровСХранения"

  //public documents: any[] = [];
  public currentScanings: Ref<IScaning[]> = ref([])
  public currentDocument: Ref<ISohDocument | null> = ref(null)

  public stores:IStore[]=[];

  get dbController(): IScaningStoreController | null {
    return DB2Manager.instance.soh_shiping
  }

  constructor() {
    super();
    SohShipmentManager.instance = this;
  }

  static init() {
    new SohShipmentManager();
  }

  async load() {
    this.currentDocument.value = await DB2Manager.getData<ISohDocument>(this.currentDocumentKey) ?? null
    this.currentScanings.value = await this.dbController!.getScanings() ?? []
    //this.stores = await DB2Manager.getData<IStore[]>(this.storesKey)??[]
  }




  clear() {
    this.setCurrentDocument(null)
    this.clearCurrentScanings()
  }

  clearCurrentScanings() {
    this.setCurrentScanings(null)
  }





  setCurrentDocument(val: ISohDocument | null): void {
    const key = this.currentDocumentKey
    if (val == null) {
      this.currentDocument.value = null
      DB2Manager.removeData(key)
      return
    }
    this.currentDocument.value = val
    DB2Manager.setData(key, toRaw(val))
    this.emit('setCurrentDocument', [val])
  }

  setCurrentScanings(val: IScaning[] | null): void {
    const key = this.currentScaningsKey
    if (val == null) {
      this.currentScanings.value = []
      DB2Manager.removeData(key)
      return
    }
    this.currentScanings.value = val
    this.dbController!.setScanings(val.map(x => toRaw(x)))
    this.emit('setCurrentScanings', [val])
  }

  addScaning(data: IScaning) {
    this.currentScanings.value.unshift(data)
    this.dbController?.addScaning(data)
    //DB2Manager.setData(key, this.currentScanings.value.map(x=>toRaw(x)) )
    const tmp = [this.currentScanings.value, data]
    this.emit('addScaning', tmp)
    //console.log('addScaning', tmp)
  }

  deleteScaning(data: IScaning) {
    for (const i of this.currentScanings.value) {
      if (i.IDSec === data.IDSec) {
        this.currentScanings.value.splice(this.currentScanings.value.indexOf(i), 1)
        break
      }
    }
    this.dbController!.deleteScaning(data)
    this.emit('deleteScaning', [this.currentScanings.value, data])
  }


  async getDocumentFromLocalDBByBarcode(barcode: string): Promise<ISohDocument | null> {
    const res = await DB2Manager.instance.orders!.get(barcode)
    if (!res) {
      NotificationManager.swal(`Данный заказ не найден в хранилище,
        попробуйте загрузить заказы и снова отсканируйте лист сборки, или отключите поиск заказов в хранилище и отсканируйте заказ снова,
      но убедитесь что находитесь в зоне WiFi`, "error")
      return null
    }
    const document: ISohDocument = res as ISohDocument
    NotificationManager.instance.playGood()
    return document

  }

  async getDocumentFromServerByBarcode(barcode: string): Promise<ISohDocument | null> {
    const result = await HttpManager.get('/get_order', {
      "ID": barcode,
      "Тип":"Документы",
      "Вид":this.ВидДокумента
    })

    if (result.success) {
      const document: ISohDocument = result.data
      if (document.РезультатПроверки) {
        NotificationManager.instance.playGood()
        return document



      }
    }
    NotificationManager.error(JSON.stringify(result.error))
    return null



  }

  async deleteDocument(doc:ISohDocument): Promise<boolean> {
    await DB2Manager.instance.userDocuments!.delete(doc)
    return true
  }

  /// Получаем ЗаказыКлиентов за указанный период и с определенного склада
  async getOrdersFromServer(ДатаНачала: number, ДатаОкончания: number, Склад: string): Promise<ISohDocument[] | null> {
    const params = {
      get_soh_orders: true,
      ДатаНачала: ДатаНачала,
      ДатаОкончания: ДатаОкончания,
      //Склад: Склад
    }
    const response = await HttpManager.get('/execute', params)
    if (response.success) {
      return response.data
    }
    return null;

  }

  /// Получаем список складов для СОХ с сервера
  async getSohStores():Promise<IStore[]>{
    const params = {
      get_orders_soh_orders: true,
    }
    const response = await HttpManager.get('/execute', params)
    if (response.success) {
      return response.data
    }
    return [];
    
  }

  /// Получаем сохраненные(документы пользователя) документы ОтгрузкаТоваровСХранения
  async getSavedDocuments():Promise<ISohDocument[]>{
    const res = await UserManager.instance.getUserDocuments()
    const documents:ISohDocument[] = []
    if(res){
      const dosc:IDocument[]=res
      for(const doc of dosc){
        if(doc.Ссылка.Вид===this.ВидДокумента){
          documents.unshift(doc as ISohDocument)
        }
      }
    }
    return documents
  }
}