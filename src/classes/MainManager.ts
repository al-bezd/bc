import { LocalStorageManager } from "./LocalStorageManager";
import { BaseManager, ILoadableManager } from "./BaseManager";
//import { DBManager, IDBDataRecord } from "./DBManager";
import { NotificationManager } from "./NotificationManager";
import { ShipmentManager } from "../managers/shipment/ShipmentManager";
import { HttpManager } from "./HttpManager";
import { Ref, ref } from "vue";
import { IShipmentDocument } from "@/managers/shipment/interfaces";
import { IContainer, IStore } from "@/interfaces/IStore";
import { UserManager } from "@/managers/user/UserManager";
import { IGettingProductionDocument } from "@/managers/getting/interfaces";
import { IDocument } from "@/interfaces/IDocument";
import { DB2Manager, IBarcode } from "./DB2Manager";
import { IInfoList } from "@/interfaces/IInfoList";
import { ISohDocument } from "@/managers/soh/interfaces";

export class MainManager extends BaseManager implements ILoadableManager {
  static instance: MainManager;
  public cordova: any; /// Объект cordova

  static keys = {
    torgovieSeti: 'torgovieSeti',
    barcodes: 'barcodes',
    mainStore: 'mainStore',
    user: 'user',
    userDocument: 'userDocument',
    infoSheets: 'infoSheets',
    orders: "orders",
    containers: "containers",
    sohOrders:"sohOrders"
  }

  public local = {
    torgovieSeti: async (): Promise<any | null> => {
      //return DBManager.getData(MainManager.keys.torgovieSeti)
      return await DB2Manager.instance.torgovieSeti!.getAll()
    },
    mainStore: async (): Promise<any | null> => {
      //return DBManager.getData(MainManager.keys.mainStore)
      return await DB2Manager.instance.local!.get<IDocument>(MainManager.keys.mainStore)
    },
    shipmentDocs: async (): Promise<IShipmentDocument[]> => {
      return await UserManager.instance.getShipmentDocuments()
    },
    sohDocs: async (): Promise<ISohDocument[]> => {
      return await UserManager.instance.getSohDocuments()
    },
    gettingDocs: async (): Promise<IGettingProductionDocument[]> => {
      return await UserManager.instance.getGettingProdDocuments()
    },
    allUserDocs: async (): Promise<IDocument[] | null> => {
      //return UserManager.instance.getUserDocuments()
      
      return await DB2Manager.instance.userDocuments!.getAll()
    },
    infoSheets: async (): Promise<IInfoList[] | null> => {
      //return DBManager.getFilesAsync(MainManager.keys.infoSheets)
      return await DB2Manager.instance.infoSheets!.getAll()
    },
    infoSheet: async (id: string): Promise<IInfoList|null> => {
      return await DB2Manager.instance.infoSheets!.get(id)
    },
    orders: async (): Promise<IDocument[]> => {
      return await DB2Manager.instance.orders!.getAll()
    },
    containers: async (): Promise<IContainer[]> => {
      return await DB2Manager.instance.containers!.getAll()
    }


  }


  //public currentUser: any = null; /// Текущий пользователь 
  //public scanings: any[] = []; /// Сканирования 

  public mainStore: Ref<IStore | null> = ref(null); /// Основной склад

  constructor() {
    super();
    MainManager.instance = this;
  }

  static init(): void {
    (String.prototype as any).delSpaces = function () {
      return this.replace(/\s/g, "");
    };
    new MainManager();


  }

  static load: () => Promise<void> = async () => {
    /// сюда надо добавить код для загрузки

  }





  /// берем контейнеры из объекта пользователя
  initContainers() {
    // const data = this.currentUser === null ? [] : this.currentUser.containers
    // LocalStorageManager.set(
    //   "containers",
    //   data
    // );
  }

  /// Загружаем штрихкоды с сервера
  async uploadBarcodes(): Promise<void> {

    const t1 = Date.now();
    const params = { "get_barcods": "true" }
    const response = await HttpManager.get('/execute', params)
    if (response.success) {
      const t2 = ((Date.now() - t1) / 1000) / 60;
      console.log(`база загружена за ${t2.toFixed(2)} мин.`);
      NotificationManager.info(`База обновлена за ${t2.toFixed(2)} мин.`);
      await DB2Manager.instance.barcodes!.setAll(response.data)
      // const data:IDBDataRecord[] = response.data.map((x:any)=>{
      //   return {id:x.Наименование.delSpaces(), data:x}
      // })

      // await DBManager.WriteDataInDB(MainManager.keys.barcodes, data);

    }

  }



  /// Вызывается при старте страницы
  load(): void {
    this.loadAsync()
  }

  async loadAsync() {
    const mainStoreTmp = await DB2Manager.instance.local!.get<IStore>(MainManager.keys.mainStore)

    if (mainStoreTmp) {
      this.mainStore.value = mainStoreTmp
    }


    //this.currentUser = LocalStorageManager.get("current_user", true);
    //this.initContainers();
    //this.scanings = LocalStorageManager.get("scaning_response", true) ?? [];
    //ShipmentManager.instance.load();


  }

  /// Скачиваем все установленные к выбору Торговые сети (необходимо для создания информационного листа)
  async uploadTorgovieSeti(): Promise<void> {
    const params = {
      "get_torgovie_seti": "true",
    };
    const response = await HttpManager.get("/execute", params);
    if (response.success) {
      await DB2Manager.instance.torgovieSeti!.setAll(response.data)
      //await DBManager.setData(MainManager.keys.torgovieSeti, response.data)
      // DBManager.setFile(
      //   { id: Date.now().toString(), data: resposne.data },
      //   "torgovie_seti",
      //   "torgovie_seti"
      // );

      //setFile({ id: Date.now(), data: response.data }, 'torgovie_seti', 'torgovie_seti')
      NotificationManager.success(`Информация по торговым сетям загружена`);
      this.emit("SetTorgovieSeti", [response.data]);
      // check_doc_free.torgovie_seti = response.data
      // torgovie_seti = response.data
      // check_doc_free.torgovie_seti = torgovie_seti
    } else {
      console.log("SetTorgovieSeti ", response.error);
      NotificationManager.error("Ошибка при загрузке торговых сетей");
    }
    // axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
    //   .then((response) => {
    //     //indexedDB.deleteDatabase('torgovie_seti')
    //     indexedDB.deleteDatabase('torgovie_seti')
    //     check_doc_free.torgovie_seti = response.data
    //     setFile({ id: Date.now(), data: response.data }, 'torgovie_seti', 'torgovie_seti')
    //     swal(`Информация по торговым сетям загружена`)
    //     torgovie_seti = response.data
    //     check_doc_free.torgovie_seti = torgovie_seti

    //   })
    //   .catch(error => {
    //     console.log('SetTorgovieSeti ', error)
    //     swal('Ошибка при загрузке торговых сетей')
    //   })
  }

  setMainStore(val: IStore) {
    this.mainStore.value = val
    DB2Manager.instance.local!.set(MainManager.keys.mainStore, val)
    this.emit('setmainStore', [this.mainStore])
  }

  async uploadMainStore() {

    const params = {
      execute_text: "ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());"
    }
    // В строке выше мы передаем закодированный метод на языке 1С который возвращает нам основной склад птицефабрики
    //ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());
    const response = await HttpManager.get('/execute', params)
    if (response.success) {
      this.setMainStore(response.data)

      // ОсновнойСклад = response.data.Наименование
      // check_doc_free.selected_sklad = ОсновнойСклад
      // check_doc_free.sklad[0]       = ОсновнойСклад
      // load_doc.add_orders.Склад     = ОсновнойСклад
    } else {
      console.log(response.error)
      NotificationManager.error("Произошла ошибка в методе uploadMainStore в классе MainManager")
    }
    // axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
    // .then((response) =>{
    //   SetData("main_order",response.data) 
    //   ОсновнойСклад = response.data.Наименование
    //   check_doc_free.selected_sklad = ОсновнойСклад
    //   check_doc_free.sklad[0]       = ОсновнойСклад
    //   load_doc.add_orders.Склад     = ОсновнойСклад

    // })
    // .catch(error=>{
    //   console.log(error)
    //   swal("Произошла ошибка в методе SetMainOrder")
    // })

  }



  /// Получаем инфо листы с сервера за период и склад
  async getInfoList(ДатаНачала: number, ДатаОкончания: number, Склад: string) {

    //indexedDB.deleteDatabase('info_lists')
    const params = {
      get_info_list: true,
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




