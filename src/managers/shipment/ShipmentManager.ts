import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { BaseManager } from "../../classes/BaseManager";
import { UserManager } from "../user/UserManager";
//import { DBManager } from "@/classes/DBManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { IDocument, IProperty, IНоменклатура, IХарактеристика } from "@/interfaces/IDocument";
import { IShipmentDocument } from "./interfaces";
import { Ref, ref, toRaw } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { HttpManager } from "@/classes/HttpManager";
import { MainManager } from "@/classes/MainManager";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { Date1C } from "@/functions/Date1C";
import { FindGM } from "@/functions/FindGruzoMesta";
import { ScaningController } from "@/controllers/ScaningController";
import { DB2Manager } from "@/classes/DB2Manager";

export class ShipmentManager extends BaseManager {
  static instance: ShipmentManager;

  protected currentDocumentKey = 'ShipmentManager__currentDoc'
  protected currentScaningsKey = 'ShipmentManager__currentScanings'

  constructor() {
    super();
    if (!ShipmentManager.instance) {
      ShipmentManager.instance = this;
    }
  }
  static init() {
    new ShipmentManager();
  }




  //public mainOrder: any;
  //public mainOrderName = "Основной склад не назначен";

  public currentDocument: Ref<IShipmentDocument | null> = ref(null)
  public currentScanings: Ref<IScaning[]> = ref([])

  load() {
    this.asyncLoad()
    // this.mainOrder = LocalStorageManager.get("main_order", true);
    // if (this.mainOrder === null) {
    //   this.mainOrderName = "Основной склад не назначен";
    // } else {
    //   this.mainOrderName = this.mainOrder.Наименование;
    // }
  }

  async asyncLoad() {
    this.currentDocument.value = await DB2Manager.getData<IShipmentDocument>(this.currentDocumentKey) ?? null
    //this.currentScanings.value = await DBManager.getData(this.currentScaningsKey) ?? []
    this.currentScanings.value = await DB2Manager.instance.shiping!.getScanings()??[]
  }

  async getDocumentFromLocalDBByBarcode(barcode: string): Promise<IShipmentDocument | null> {
    const res = await DB2Manager.instance.orders!.get(barcode)
    if (!res) {
      NotificationManager.swal(`Данный заказ не найден в хранилище,
        попробуйте загрузить заказы и снова отсканируйте лист сборки, или отключите поиск заказов в хранилище и отсканируйте заказ снова,
      но убедитесь что находитесь в зоне WiFi`, "error")
      return null
    }
    const document: IShipmentDocument = res as IShipmentDocument
    if ((document.рсТоварыДляЛимитов.length == 0) && (document.Ссылка.Вид === "ЗаказКлиента")) {
      NotificationManager.swal("Товары для лимитов не заполнены в " + document.Ссылка.Наименование)
      //load_doc.show()
      NotificationManager.instance.playError()
      return null

    } else {
      //SetData("current_doc", response.data)
      //setCurrentDoc(document)

      //load_doc.output_response(response.data)
      NotificationManager.instance.playGood()
      return document
    }

  }

  async getDocumentFromServerByBarcode(barcode: string): Promise<IShipmentDocument | null> {
    const result = await HttpManager.get('/get_order', {
      "ID": barcode
    })

    if (result.success) {
      const document: IShipmentDocument = result.data
      if (document.РезультатПроверки) {
        if ((document.рсТоварыДляЛимитов.length == 0) && (document.Ссылка.Вид === "ЗаказКлиента")) {
          NotificationManager.swal("Товары для лимитов не заполнены в " + document.Ссылка.Наименование)
          NotificationManager.instance.playError()
          //load_doc.show()
          return null;


        }
        //SetData("current_doc", response.data)
        //load_doc.output_response(response.data)
        //soundClick("resurse/GOOD.mp3")
        NotificationManager.instance.playGood()
        return document


      }
    }
    NotificationManager.error(JSON.stringify(result.error))
    return null



  }

  async initDocumentOrder(barcode: string): Promise<IShipmentDocument | null> {

    // qwe = this.documents.filter(i => i.ШК === barcode)
    // if (qwe.length > 0) {
    //   this.load_document(qwe[0].Ссылка.Ссылка)
    //   this.barcode = ""
    //   return
    // }
    let document: IShipmentDocument | null = null
    if (UserManager.instance.useLocalOrders.value) {
      document = await this.getDocumentFromLocalDBByBarcode(barcode)

    } else {
      document = await this.getDocumentFromServerByBarcode(barcode)
    }

    if (document) {
      this.setCurrentDocument(document!)
    }
    return document

  }

  setCurrentDocument(value: IShipmentDocument | null) {
    const key = this.currentDocumentKey
    if (value == null) {
      this.currentDocument.value = null
      DB2Manager.removeData(key)
      return
    }
    this.currentDocument.value = value
    DB2Manager.setData(key, toRaw(value))
    this.emit('setCurrentDocument', [this.currentDocument.value])
  }

  setCurrentScanings(value: IScaning[] | null) {
    const key = this.currentScaningsKey
    //console.log('setCurrentScanings ',value)
    if (value == null) {
      this.currentScanings.value.length = 0
      DB2Manager.instance.shiping!.clearScanings()
      //DBManager.removeData(key)
      return
    }
    this.currentScanings.value = value
    //DBManager.setData(key, value.map(x => toRaw(x)))
    DB2Manager.instance.shiping!.setScanings(value.map(x => toRaw(x)))
    //DB2Manager.instance.setScanings(this,value.map(x => toRaw(x)))
    this.emit('setCurrentScanings', [value])
    
  }

  clear() {
    this.setCurrentDocument(null)
    this.clearCurrentScanings()
  }

  clearCurrentScanings() {
    this.setCurrentScanings(null)
  }

  addScaning(scaning: IScaning) {
    const key = this.currentScaningsKey
    this.currentScanings.value.unshift(scaning)
    //const dataForWriteInDB = this.currentScanings.value.map(x=> toRaw(x))
    //DBManager.setData(key, dataForWriteInDB)
    //DB2Manager.instance.addScaning(this,toRaw(scaning))
    DB2Manager.instance.shiping!.addScaning(toRaw(scaning))
    const tmp = [this.currentScanings.value, scaning]
    this.emit('addScaning', tmp)
    //console.log('addScaning', tmp, dataForWriteInDB)
  }

  async deleteScaning(scaning: IScaning) {
    const key = this.currentScaningsKey

    for (const i of this.currentScanings.value) {
      if (i.IDSec === scaning.IDSec) {
        this.currentScanings.value.splice(this.currentScanings.value.indexOf(i), 1)
        break
      }
    }
    //const dataForWriteInDB = this.currentScanings.value.map(x=> toRaw(x))
    this.emit('deleteScaning', [this.currentScanings.value, scaning])
    //const res = await DBManager.setData(key, dataForWriteInDB)
    //DB2Manager.instance.deleteScaning(this,scaning)
    DB2Manager.instance.shiping!.deleteScaning(scaning)
    //console.log("deleteScaning RES",res)
    
    //console.log('deleteScaning', dataForWriteInDB)
  }

  //Удаляем документ из списка документов пользователя
  async deleteDocument(doc: IDocument): Promise<boolean> {

    await DB2Manager.instance.userDocuments!.delete(doc)
    return true
    // const baseName = MainManager.keys.userDocument
    // const currentUser = UserManager.instance.user.value!.Ссылка.Ссылка;
    // const files = await DBManager.getFileAsync(currentUser, baseName, baseName)
    // if (files) {
    //   for (const i of files.data.docs) {
    //     if (i.Ссылка.Ссылка === id) {
    //       files.data.docs.splice(files.data.docs.indexOf(i), 1)
    //       DBManager.setFileAsync(files, baseName, baseName)
    //       return true;
    //     }
    //   }
    // }
    // return false
  }
  /// Получаем инфу по таре с сервера и записываем ее в БД и в текущего юзера
  async initContainers(){
    const httpRes = await HttpManager.get("/execute",{ 'get_containers': true })
    if(!httpRes.success){
      NotificationManager.error(httpRes.error)
    }
      //DBManager.setData(MainManager.keys.containers, httpRes.data)
      //DB2Manager.instance.setContainers(httpRes.data)
      DB2Manager.instance.containers!.setAll(httpRes.data)
      const curUser =  UserManager.instance.user.value
      if(curUser){
        curUser.containers = httpRes.data
        UserManager.instance.setUser(curUser)
      }
        
    
      
    
  }

  /// Получаем ЗаказыКлиентов за указанный период и с определенного склада
  async getOrdersFromServer(ДатаНачала: number, ДатаОкончания: number, Склад: string): Promise<IShipmentDocument[] | null> {
    //indexedDB.deleteDatabase('orders')
    //SetContainers()
    
    this.initContainers()
    const params = {
      get_orders: true,
      ДатаНачала: ДатаНачала,
      ДатаОкончания: ДатаОкончания,
      Склад: Склад
    }
    const response = await HttpManager.get('/execute', params)
    if (response.success) {
      return response.data
    }
    return null;

  }

  


}
