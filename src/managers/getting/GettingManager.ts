
import { BaseManager } from "@/classes/BaseManager";

import { HttpManager } from "@/classes/HttpManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { markRaw, Ref, ref, toRaw } from "vue";
import { IGettingProductionDocument } from "./interfaces";
import { IScaning } from "@/interfaces/IScaning";
import { DB2Manager } from "@/classes/DB2Manager";
import { IDocument } from "@/interfaces/IDocument";

export class GettingManager extends BaseManager {
  constructor() {
    super();
    GettingManager.instance = this;
  }

  static instance: GettingManager;

  protected currentDocumentKey = "GettingManager__currentDocument"
  protected currentScaningsKey = "GettingManager__currentScanings"

  //public documents: any[] = [];
  public currentScanings: Ref<IScaning[]> = ref(markRaw([]))
  public currentDocument: Ref<IGettingProductionDocument | null> = ref(null)

  static init() {
    new GettingManager()
  }

  load() {
    this.asyncLoad()
  }

  clear(){
    this.setCurrentDocument(null)
    this.clearCurrentScanings()
  }

  clearCurrentScanings(){
    this.setCurrentScanings(null)
  }

  async asyncLoad() {
    this.currentDocument.value = await DB2Manager.getData<IGettingProductionDocument>(this.currentDocumentKey) ?? null
    this.currentScanings.value = await DB2Manager.instance.getting!.getScanings()??[]
  }



  setCurrentDocument(val: IGettingProductionDocument|null): void {
    const key = this.currentDocumentKey
    if(val==null){
      this.currentDocument.value = null
      DB2Manager.removeData(key)
      return
    }
    this.currentDocument.value = val
    DB2Manager.setData(key, toRaw(val))
    this.emit('setCurrentDocument', [val])
  }

  setCurrentScanings(val: IScaning[]|null): void {
    const key = this.currentScaningsKey
    if(val==null){
      this.currentScanings.value = []
      DB2Manager.instance.getting?.clearScanings()
      DB2Manager.removeData(key)
      return
    }
    this.currentScanings.value = val
    DB2Manager.instance.getting!.setScanings(val.map(x=>toRaw(x)))
    this.emit('setCurrentScanings', [val])
  }

  addScaning(data:IScaning){
    this.currentScanings.value.unshift(data)
    //DB2Manager.instance.getting?.addScaning(data)
    //DB2Manager.setData(key, this.currentScanings.value.map(x=>toRaw(x)) )
    //const tmp = [this.currentScanings.value, data]
    //this.emit('addScaning', tmp)
    //console.log('addScaning', tmp)
  }

  async deleteScaning(data:IScaning) {
    for (const i of this.currentScanings.value) {
      if(i.IDSec === data.IDSec) {
        this.currentScanings.value.splice(this.currentScanings.value.indexOf(i), 1)
        break
      }
    }
    await DB2Manager.instance.getting!.deleteScaning(data)
    this.emit('deleteScaning', [this.currentScanings.value, data])
  }

  async getDocumentByBarcode(barcode: string): Promise<IGettingProductionDocument | null> {
    try {
      const response = await HttpManager.get('/execute', {
        get_doc_move: true,
        ID: barcode
      })
      if (response.success) {
        const data: IGettingProductionDocument = response.data
        if (!data.РезультатПроверки) {
          NotificationManager.swal(response.data.Текст)
          NotificationManager.instance.playError()
          return null
        }
        //this.setCurrentDocument(data)
        
        NotificationManager.instance.playGood()
        return data
        // DBManager.setData("prod_doc")
        // SetData('prod_doc', response.data)


      }
    } catch (error) {
      NotificationManager.swal(JSON.stringify(error))
    }
    return null
  }


 

  //Удаляем документ из списка документов пользователя
  async deleteDocumentById(id: string): Promise<boolean> {
    //await DB2Manager.instance.userDocuments!.delete(id)
    return true
  }

  async deleteDocument(doc:IDocument): Promise<boolean> {
    await DB2Manager.instance.userDocuments!.delete(doc)
    return true
  }
}
