
import { BaseManager } from "../../classes/BaseManager";
import { DBManager } from "../../classes/DBManager";
import { UserManager } from "../user/UserManager";
import { HttpManager } from "@/classes/HttpManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { Ref, ref, toRaw } from "vue";
import { IGettingProductionDocument } from "./interfaces";
import { IScaning } from "@/interfaces/IScaning";
import { MainManager } from "@/classes/MainManager";

export class GettingManager extends BaseManager {
  constructor() {
    super();
    GettingManager.instance = this;
  }

  static instance: GettingManager;

  protected currentDocumentKey = "GettingManager__currentDocument"
  protected currentScaningsKey = "GettingManager__currentScanings"

  public documents: any[] = [];
  public currentScanings: Ref<IScaning[]> = ref([])
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
    this.currentDocument.value = await DBManager.getData(this.currentDocumentKey) ?? null
    this.currentScanings.value = await DBManager.getData(this.currentScaningsKey) ?? []
    //console.log('this.currentDocument.value ', this.currentDocument.value)
  }



  setCurrentDocument(val: IGettingProductionDocument|null): void {
    const key = this.currentDocumentKey
    if(val==null){
      this.currentDocument.value = null
      DBManager.removeData(key)
      return
    }
    this.currentDocument.value = val
    DBManager.setData(key, toRaw(val))
    this.emit('setCurrentDocument', [val])
  }

  setCurrentScanings(val: IScaning[]|null): void {
    const key = this.currentScaningsKey
    if(val==null){
      this.currentScanings.value = []
      DBManager.removeData(key)
      return
    }
    this.currentScanings.value = val
    DBManager.setData(key, val.map(x=>toRaw(x)))
    this.emit('setCurrentScanings', [val])
  }

  addScaning(data:IScaning){
    const key = this.currentScaningsKey
    this.currentScanings.value.unshift(data)
    DBManager.setData(key, toRaw(this.currentScanings.value) )
    this.emit('addScaning', [this.currentScanings.value, data])
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
}
