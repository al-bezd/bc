import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { BaseManager } from "../../classes/BaseManager";
import { UserManager } from "../user/UserManager";
import { DBManager } from "@/classes/DBManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { IProperty } from "@/interfaces/IDocument";
import { IShipmentDocument } from "./interfaces";
import { Ref, ref, toRaw } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { HttpManager } from "@/classes/HttpManager";
import { MainManager } from "@/classes/MainManager";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { Date1C } from "@/functions/Date1C";
import { FindGM } from "@/functions/FindGruzoMesta";

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

  public currentDocument:Ref<IShipmentDocument|null> = ref(null)
  public currentScanings:Ref<IScaning[]> = ref([])

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
    this.currentDocument.value = await DBManager.getData(this.currentDocumentKey) ?? null
    this.currentScanings.value = await DBManager.getData(this.currentScaningsKey) ?? []
    //console.log('this.currentDocument.value ', this.currentDocument.value)
  }

  async getDocumentFromLocalDBByBarcode(barcode:string):Promise<IShipmentDocument|null>{
    const res = await DBManager.getFileAsync(barcode,MainManager.keys.orders,MainManager.keys.orders)
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
    NotificationManager.error(JSON.stringify(result.error))
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

  addScaning(scaning:IScaning){
    const key = this.currentScaningsKey
    this.currentScanings.value.unshift(scaning)
    DBManager.setData(key, toRaw(this.currentScanings.value) )
    this.emit('addScaning', [this.currentScanings.value, scaning])
  }

  deleteScaning(data:IScaning) {
    const key = this.currentScaningsKey

    for (const i of this.currentScanings.value) {
      if(i.IDSec === data.IDSec) {
        this.currentScanings.value.splice(this.currentScanings.value.indexOf(i), 1)
        break
      }
    }
    
    DBManager.setData(key, toRaw(this.currentScanings.value) )
    this.emit('deleteScaning', [this.currentScanings.value, data])
  }

  //Удаляем документ из списка документов пользователя
  async deleteDocumentById(id: string): Promise<boolean> {
    const baseName = MainManager.keys.userDocument
    const currentUser = UserManager.instance.user.value!.Ссылка.Ссылка;
    const files = await DBManager.getFileAsync(currentUser, baseName, baseName)
    if (files) {
      for (const i of files.data.docs) {
        if (i.Ссылка.Ссылка === id) {
          files.data.docs.splice(files.data.docs.indexOf(i), 1)
          DBManager.setFileAsync(files, baseName, baseName)
          return true;
        }
      }
    }
    return false
  }

  /// Получаем ЗаказыКлиентов за указанный период и с определенного склада
  async getOrdersFromServer(ДатаНачала:number, ДатаОкончания:number, Склад:string):Promise<IShipmentDocument[]|null> {
    //indexedDB.deleteDatabase('orders')
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

  /// получаем новое сканирование по переданному штрихкоду
  async getScaning(barcode: string,itPalet=false): Promise<IScaning | null> {
    const barcodeValue = barcode;
  
    const Штрихкод = barcodeValue.slice(2, 16);
    const Количество = Number(barcodeValue.slice(20, 26)) / 1000;
    const ДатаПроизводства = barcodeValue.slice(28, 34);
    const ГоденДо = barcodeValue.slice(36, 42);
  
    const Структура = {
      Штрихкод: Штрихкод,
      Количество: Количество,
      ДатаПроизводства: ДатаПроизводства,
      ГоденДо: ГоденДо,
      bc: barcode,
    };
  
    if (UserManager.instance.useLocalDb) {
      const barcodeFromDB = await DBManager.getFileAsync(
        Структура.Штрихкод,
        MainManager.keys.barcodes,
        MainManager.keys.barcodes
      );
      if (barcodeFromDB) {
        barcodeFromDB.data.Штрихкод = Структура.Штрихкод;
        barcodeFromDB.data.bc = barcodeValue;
        return this.createScaning(
          barcodeFromDB.data,
          Структура.Количество,
          Структура.ДатаПроизводства,
          Структура.ГоденДо,itPalet
        );
      } else {
        NotificationManager.swal("Продукция с таким штрих кодом не найдена");
        return null;
      }
    } else {
      const loadDoc = this.currentDocument.value!;
      const params = {
        barcode: barcodeValue,
        Наименование: loadDoc.Наименование,
        Тип: loadDoc.Ссылка.Тип,
        Вид: loadDoc.Ссылка.Вид,
        Ссылка: loadDoc.Ссылка.Ссылка,
      };
      const httpResult = await HttpManager.get("/scaning_barcode", params);
      if (httpResult.success) {
        if (httpResult.data.РезультатПроверки) {
          const СтруктураШК = { Ссылка: httpResult.data };
          return this.createScaning(СтруктураШК, Количество, ДатаПроизводства, ГоденДо,itPalet);
        } else {
          NotificationManager.swal(httpResult.data.Текст);
          //this.show()
          //soundClick("resurse/ERROR.mp3")
          NotificationManager.instance.playError();
        }
      } else {
        NotificationManager.swal(JSON.stringify(httpResult.error));
        //this.show()
      }
    }
    return null;
  }

   createScaning(
    СтруктураШК: any,
    Количество: number,
    ДатаПроизводства: string,
    ГоденДо: string,
    itPalet=false
  ): IScaning | null {
    const bc = СтруктураШК.bc;
    let Грузоместа = 1;
    let Палетная = "alert alert-info";
    const prodDoc: IShipmentDocument = this.currentDocument.value!;
  
    //text = ''
  
    const Серия: IProperty = {
      Наименование: Date1C(ДатаПроизводства, ГоденДо),
      Ссылка: `${ДатаПроизводства}${ГоденДо}`,
    };
    // const ЕдИзмСтр = СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование;
  
    // const curNomStr = `${СтруктураШК.Ссылка.Номенклатура.Наименование}\n${СтруктураШК.Ссылка.Характеристика.Наименование}\n${Серия.Наименование}`;
  
    if (itPalet == true) {
      Грузоместа = FindGM(bc);
      Палетная = "alert alert-warning";
      
    }
    //debugger
    //this.prod_doc = GetData('prod_doc', 'j')
  
    const inOrder =
      prodDoc.Товары.filter(
        (item) =>
          СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование &&
          СтруктураШК.Ссылка.Характеристика.Наименование == item.Характеристика.Наименование
      ).length > 0
        ? true
        : false;
  
    const ЧтоЕсть = prodDoc.Товары.filter(
      (item) =>
        СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование
    );
  
    // in_order = in_order.length > 0 ? true : false
  
    if (!inOrder) {
      //
      let text = `Продукции \n\n ${СтруктураШК.Ссылка.Номенклатура.Наименование} ${СтруктураШК.Ссылка.Характеристика.Наименование} ПЛУ: ${СтруктураШК.Ссылка.ПЛУ} \n\n нет в заказе`;
      if (ЧтоЕсть.length > 0) {
        text += `, нужна\n\n`;
        for (const i of ЧтоЕсть) {
          text += `${i.Номенклатура.Наименование} ${i.Характеристика.Наименование} ПЛУ: ${i.ПЛУ} \n\nили `;
        }
        text = text.substring(0, text.length - 3);
      } else {
        text;
      }
      NotificationManager.swal(text);
      NotificationManager.instance.playError();
      return null;
    }
  
    const КоличествоВЕдиницахИзмерения = GetCountFromBarcode(
      СтруктураШК,
      Грузоместа,
      Количество
    );
  
    console.log("КоличествоВЕдиницахИзмерения ", КоличествоВЕдиницахИзмерения);
  
    const response = {
      IDSec: Date.now(),
      ID: "",
      Номенклатура: СтруктураШК.Ссылка.Номенклатура,
      Характеристика: СтруктураШК.Ссылка.Характеристика,
      ПЛУ: СтруктураШК.Ссылка.ПЛУ === undefined ? "" : СтруктураШК.Ссылка.ПЛУ,
      Серия: Серия,
      Количество: Количество,
      КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
      ЕдиницаИзмерения: СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
      Артикул: СтруктураШК.Ссылка.Номенклатура.Артикул,
      Грузоместа: Грузоместа,
      Палетная: Палетная,
      bc: bc,
      free: false,
    };
    return response;
  }

  /// Проверка валидности сканирования, по типу что бы рядом друг с другом не было идентичных сканирований
 isValidScaning(scaning: IScaning, scanings: IScaning[]):void {
  if (scanings.length > 1) {
    if (scanings[1].bc === scaning.bc) {
      NotificationManager.instance.playRepeatArial();
      return;
    }
  }
  NotificationManager.instance.playGood();
}


}
