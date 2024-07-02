import { LocalStorageManager } from "./LocalStorageManager";
import { BaseManager } from "./BaseManager";
import { DBManager } from "./DBManager";
import { NotificationManager } from "./NotificationManager";
import { ShipmentManager } from "../managers/shippment/ShipmentManager";

export class MainManager extends BaseManager {
  static instance: MainManager;
  public cordova: any; /// Объект cordova

  public currentOption: string | null = null; /// Текущее активированное окно
  public currentUser: any = null; /// Текущий пользователь 
  public scanings: any[] = []; /// Сканирования 

  public mainStore: string | null = null; /// Основной склад

  constructor() {
    super();
    MainManager.instance = this;
  }

  static init(): void {
    new MainManager();
  }

  /// берем контейнеры из объекта пользователя
  initContainers() {
    const data = this.currentUser === null ? [] : this.currentUser.containers
    LocalStorageManager.set(
      "containers",
      data
    );
  }

  /// Загружаем штрихкоды с сервера
  async uploadBarcodes():Promise<void>{
    //status_bar.msgs.push("ИДЕТ ЗАГРУЗКА ДАННЫХ!");
    this.emit('uploadBarcodes:start')
    const t1 = Date.now();
    const params = { 'get_barcods': true }
    const response = await HttpManager.get('execute', params)
    if(response.success){
        const t2 = ((Date.now() - t1) / 1000) / 60;
        console.log(`база загружена за ${t2.toFixed(2)} мин.`);
        //status_bar.msgs = [];
        NotificationManager.swal(`База обновлена за ${t2.toFixed(2)} мин.`);
        DBManager.WriteDataInDB(response.data);
    }
    this.emit('uploadBarcodes:end')
  }

    

  /// Вызывается при старте страницы
  load(): void {
    this.currentOption = LocalStorageManager.get("current_option");
    this.currentUser = LocalStorageManager.get("current_user", true);
    this.initContainers();
    this.scanings = LocalStorageManager.get("scaning_response", true) ?? [];
    ShipmentManager.instance.load();

    if (this.currentOption) {
      this.emit("showWindow", [this.currentOption]);
    }
  }

  /// Скачиваем все установленные к выбору Торговые сети (необходимо для создания информационного листа)
  async uploadTorgovieSeti(): Promise<void> {
    const params = {
      get_torgovie_seti: true,
    };
    const resposne = await HttpManager.get("execute", { params: params });
    if (resposne.success) {
      DBManager.deleteDatabase("torgovie_seti");
      DBManager.setFile(
        { id: Date.now(), data: resposne.data },
        "1c",//"torgovie_seti",
        "torgovie_seti"
      );

      //setFile({ id: Date.now(), data: response.data }, 'torgovie_seti', 'torgovie_seti')
      NotificationManager.swal(`Информация по торговым сетям загружена`);
      this.emit("SetTorgovieSeti", [resposne.data]);
      // check_doc_free.torgovie_seti = response.data
      // torgovie_seti = response.data
      // check_doc_free.torgovie_seti = torgovie_seti
    } else {
      console.log("SetTorgovieSeti ", resposne.error);
      NotificationManager.swal("Ошибка при загрузке торговых сетей");
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

  setMainStore(val:string){
    this.mainStore = val
    LocalStorageManager.set("mainStore", this.mainStore) 
    this.emit('setmainStore',[this.mainStore])
  }

  async uploadMainStore(){
    
        const params={
          execute_text:"ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());"
        }
        // В строке выше мы передаем закодированный метод на языке 1С который возвращает нам основной склад птицефабрики
        //ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());
        const response = await HttpManager.get('execute',{ params: params })
        if(response.success){
            this.setMainStore(response.data)
            
            // ОсновнойСклад = response.data.Наименование
            // check_doc_free.selected_sklad = ОсновнойСклад
            // check_doc_free.sklad[0]       = ОсновнойСклад
            // load_doc.add_orders.Склад     = ОсновнойСклад
        }else{
            console.log(response.error)
            NotificationManager.swal("Произошла ошибка в методе uploadMainStore в классе MainManager")
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
}




