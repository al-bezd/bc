import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { BaseManager } from "../../classes/BaseManager";

export class ShipmentManager extends BaseManager {
  static instance: ShipmentManager;

  constructor() {
    super()
    ShipmentManager.instance = this;
  }
  static init(){
    new ShipmentManager()
  }
  public mainOrder: any;
  public mainOrderName = "Основной склад не назначен";

  public barcode: string | null = null;

  load() {
    this.mainOrder = LocalStorageManager.get("main_order", true);
    if (this.mainOrder === null) {
      this.mainOrderName = "Основной склад не назначен";
    } else {
      this.mainOrderName = this.mainOrder.Наименование;
    }
  }

  afterScan(text: string): void {
    this.barcode = text;
    // load_doc.load_doc_bc = text;
    // load_doc.barcode = text;
    // load_doc.get_document_order();
  }

  getDocumentOrder(): void {
    console.log('getDocumentOrder')
  }
}
