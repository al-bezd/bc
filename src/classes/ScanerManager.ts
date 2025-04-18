import { ref } from "vue";
import { LocalStorageManager } from "./LocalStorageManager";
import { MainManager } from "./MainManager";
import { NotificationManager } from "./NotificationManager";
import { BaseManager, ILoadableManager } from "./BaseManager";
import { StringToBool } from "@/functions/StringToBoolean";
import { IScaning } from "@/interfaces/IScaning";
import { LogManager } from "./LogManager";



export class ScanerManager extends BaseManager implements ILoadableManager {
  static instance: ScanerManager;

  /// использовать буфер обмена при работе со сканером
  public useClipBoard = ref(true);

  /// кнопка которая будет нажиматься после сканирования настраивается со стороны сканера
  public scanKey = ref("F13");

  constructor() {
    super()
    ScanerManager.instance = this;
  }

  static init() {
    new ScanerManager()
  }

  load() {
    this.scanKey.value = LocalStorageManager.get('scanKey') ?? "F13"
    this.useClipBoard.value = StringToBool(LocalStorageManager.get('useClipBoard')) ?? true
  }

  // static async showAddManualScaningForm():Promise<string>{
  //   return new Promise((resolve,reject)=>{
  //     try{
  //       const callback = (result:string)=>{
  //         if(result){
  //           //NotificationManager.instance.disconnect('showAddManualScaningForm', [callback])
  //           resolve(result)

  //         }
  //       }
  //       NotificationManager.instance.emit('showAddManualScaningForm', [callback])
  //     }catch(e){
  //         reject(e)
  //     } 
  //   })
  // }

  /// Показываем форму добавления сканирования в ручном режиме, возвращает штрихкод
  static async showAddManualScaning(scaning: IScaning | null = null): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const callback = (result: string) => {
          if (result) {
            resolve(result)
          }
        }
        if (scaning) {
          NotificationManager.instance.emit('showAddManualScaningForm:object', [callback, scaning])
        } else {
          NotificationManager.instance.emit('showAddManualScaningForm', [callback])
        }

      } catch (e) {
        reject(e)
      }
    })
  }





  setScanKey(value: string) {
    this.scanKey.value = value
    LocalStorageManager.set('scanKey', value)
  }

  setUseClipBoard(value: boolean) {
    this.useClipBoard.value = value
    LocalStorageManager.set('useClipBoard', value)
  }

   extractNumbers(str:string) {
    return str.replace(/\D/g, ''); // \D соответствует нецифровым символам
  }

  /// Предварительная обработка шк
  barcodeWrapper(barcode: string) {
    //barcode = barcode.replace(/ /gi, "");
    barcode = this.extractNumbers(barcode);
    //self.barcode=""
    if (barcode.indexOf("-") >= 0) {
      const text_error = `В штрихкоде "${barcode}" присутствует недопустимый символ "-" `;
      NotificationManager.swal(text_error);
      //console.log(text_error);
      throw text_error;
    }
    return barcode.replace(/-/gi, "0");
  }

  afterScan(event: KeyboardEvent) {
    // console.log(
    //   "onScan до сервисной кнопки",
    //   event.key, this.scanKey.value,
    //   Boolean(MainManager.instance.cordova),
    //   JSON.stringify({ key: event.key, code: event.code, charCode: event.charCode, keyCode: event.keyCode })
    // )
    if (event.key === this.scanKey.value || event.code === this.scanKey.value) {
      const cordova = MainManager.instance.cordova;
      cordova.plugins.clipboard.paste((text: string) => {
        //console.log("onScan сервисная кнопка нажата", this.scanKey.value, text)
        if (text !== "") {
          //console.log("onScan",text)
          //console.log("onScan после сервисной кнопки")
          this.emit("onScan", [this.barcodeWrapper(text)])
        }
        cordova.plugins.clipboard.clear();
      });
    }
    //console.log("onScan после сервисной кнопки")
  }

  onScan(callback: (text: string) => void) {
    this.connect('onScan', (data) => { callback(data[0]) })
  }
}

document.addEventListener("keyup", (event) => {
  if (!ScanerManager.instance.useClipBoard.value) {
    return;
  }
  ScanerManager.instance.afterScan(event);
  //   if (event.key === ScanerManager.instance.scanKey) {
  //     if (form_select_user.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           form_select_user.barcode = text;
  //           form_select_user.get_user();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (load_doc.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           load_doc.load_doc_bc = text;
  //           load_doc.barcode = text;
  //           load_doc.get_document_order();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (getting_prod_load.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           getting_prod_load.barcode = text;
  //           getting_prod_load.get_document_order();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (HandAddItem.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           HandAddItem.ШК = text;
  //           HandAddItem.Scaning();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (form_doc.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           form_doc.barcode = text;
  //           form_doc.scaning();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (form_doc_free.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           form_doc_free.barcode = text;
  //           form_doc_free.scaning();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     } else if (getting_prod_form.seen) {
  //       cordova.plugins.clipboard.paste((text) => {
  //         if (text !== "") {
  //           getting_prod_form.barcode = text;
  //           getting_prod_form.scaning();
  //         }
  //         cordova.plugins.clipboard.clear();
  //       });
  //     }
  //     console.log(event);
  //   }
});
