import { MainManager } from "./MainManager";
import { NotificationManager } from "./NotificationManager";

export class ScanerManager {
  static instance: ScanerManager;

  constructor() {
    ScanerManager.instance = this;
  }
  /// использовать буфер обмена при работе со сканером
  public useClipBoard = true;

  /// кнопка которая будет нажиматься после сканирования настраивается со стороны сканера
  public scanKey = "";

  /// Предварительная обработка шк
  barcodeWrapper(barcode: string) {
    barcode = barcode.replace(/ /gi, "");
    //self.barcode=""
    if (barcode.indexOf("-") >= 0) {
      const text_error = `В штрихкоде "${barcode}" присутствует недопустимый символ "-" `;
      NotificationManager.swal(text_error);
      console.log(text_error);
      throw text_error;
    }
    return barcode.replace(/-/gi, "0");
  }

  afterScan(event: KeyboardEvent) {
    if (event.key === this.scanKey) {
      const cordova = MainManager.instance.cordova;
      cordova.plugins.clipboard.paste((text: string) => {
        if (text !== "") {
          document.dispatchEvent(
            new CustomEvent("afterScan", {
              detail: [this.barcodeWrapper(text)],
            })
          );
        }
        cordova.plugins.clipboard.clear();
      });
    }
  }
}

document.addEventListener("keyup", (event) => {
  if (!ScanerManager.instance.useClipBoard) {
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
