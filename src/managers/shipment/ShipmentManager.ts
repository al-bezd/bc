import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { BaseManager } from "../../classes/BaseManager";
import { UserManager } from "../user/UserManager";
import { DBManager } from "@/classes/DBManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { IDocument } from "@/interfaces/IDocument";
import { IShipmentDocument } from "./interfaces";
import { Ref, ref, toRaw } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { HttpManager } from "@/classes/HttpManager";

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


  public mainOrder: any;
  public mainOrderName = "Основной склад не назначен";

  public currentDocument:Ref<IShipmentDocument|null> = ref(null)
  public currentScanings:Ref<IScaning[]> = ref([])

  load() {
    this.mainOrder = LocalStorageManager.get("main_order", true);
    if (this.mainOrder === null) {
      this.mainOrderName = "Основной склад не назначен";
    } else {
      this.mainOrderName = this.mainOrder.Наименование;
    }
  }

  async getDocumentFromLocalDBByBarcode(barcode:string):Promise<IShipmentDocument|null>{
    const res = await DBManager.getFileAsync(barcode,'orders','orders')
    if(!res){
      NotificationManager.swal(`Данный заказ не найден в хранилище,
        попробуйте загрузить заказы и снова отсканируйте лист сборки, или отключите поиск заказов в хранилище и отсканируйте заказ снова,
      но убедитесь что находитесь в зоне WiFi`,"error")
      return null
    }
    const document:IShipmentDocument = res.data
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

  async getDocumentFromServerByBarcode(barcode:string):Promise<IShipmentDocument|null>{
    const result = await HttpManager.get('/get_order',{
      "ID": barcode
    })
     
    if(result.success){
      const document:IShipmentDocument = result.data
      if(document.РезультатПроверки){
        if((document.рсТоварыДляЛимитов.length == 0) && (document.Ссылка.Вид === "ЗаказКлиента")){
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
    NotificationManager.swal(JSON.stringify(result.error),'error')
    return null
        

    
  }

  async initDocumentOrder(barcode:string): Promise<IShipmentDocument|null> {

        // qwe = this.documents.filter(i => i.ШК === barcode)
        // if (qwe.length > 0) {
        //   this.load_document(qwe[0].Ссылка.Ссылка)
        //   this.barcode = ""
        //   return
        // }
        let document:IShipmentDocument | null = null
        if(UserManager.instance.useLocalOrders.value){
          document = await this.getDocumentFromLocalDBByBarcode(barcode)
          
        }else{
          document = await this.getDocumentFromServerByBarcode(barcode)
        }
        
        if(document){
          this.setCurrentDocument(document!)
        }
        return document
        
  }

   setCurrentDocument(value:IShipmentDocument|null){
    const key = this.currentDocumentKey
    if(value==null){
      this.currentDocument.value = null
      DBManager.removeData(key)
      return
    }
    this.currentDocument.value = value
    DBManager.setData(key,toRaw(value))
    this.emit('setCurrentDocument',[this.currentDocument.value])
  }

  setCurrentScanings(value:IScaning[]|null){
    const key = this.currentScaningsKey
    if(value==null){
      this.currentScanings.value.length = 0 
      DBManager.removeData(key)
      return
    }
    this.currentScanings.value = value
    DBManager.setData(key, value.map(x=>toRaw(x)))
    this.emit('setCurrentScanings', [value])
  }

  clear(){
    this.setCurrentDocument(null)
    this.clearCurrentScanings()
  }

  clearCurrentScanings(){
    this.setCurrentScanings(null)
  }

  //Удаляем документ из списка документов пользователя
  async deleteDocumentById(id: string): Promise<boolean> {
    const currentUser = UserManager.instance.user.value!.Ссылка.Ссылка;
    const files = await DBManager.getFileAsync(currentUser, 'user_docs', 'user_docs')
    if (files) {
      for (const i of files.data.docs) {
        if (i.Ссылка.Ссылка === id) {
          files.data.docs.splice(files.data.docs.indexOf(i), 1)
          DBManager.setFileAsync(files, 'user_docs', 'user_docs')
          return true;
        }
      }
    }
    return false
  }

  /// Получаем ЗаказыКлиентов за указанный период и с определенного склада
  async getOrdersFromServer(ДатаНачала:number, ДатаОкончания:number, Склад:string):Promise<IShipmentDocument[]|null> {
    indexedDB.deleteDatabase('orders')
    //SetContainers()
    const params = {
      get_orders: true,
      ДатаНачала: ДатаНачала,
      ДатаОкончания: ДатаОкончания,
      Склад: Склад
    }
   const response = await HttpManager.get('/execute', params)
   if(response.success){
      return response.data
   }
   return null;
      
  }


}