import { LocalStorageManager } from "../../classes/LocalStorageManager"
import { BaseManager } from "../../classes/BaseManager"
import { MainManager } from "../../classes/MainManager"
import { NotificationManager } from "../../classes/NotificationManager"
import { HttpManager } from "../../classes/HttpManager"
import { Ref, ref, toRaw } from "vue"
import { IDocument, IUser } from "@/interfaces/IDocument"
import { IShipmentDocument } from "../shipment/interfaces"
import { IGettingProductionDocument } from "../getting/interfaces"
import { DB2Manager } from "@/classes/DB2Manager"



export class UserManager extends BaseManager {
  static instance: UserManager
  //private baseName = 'user_docs'

  //public barcode:string|null = null
  public controlFutureDate = ref(false)
  public useLocalOrders = ref(false)
  public useLocalDb = ref(false)
  public user: Ref<IUser|null> = ref(null)

  constructor() {
    super()
    UserManager.instance = this
  }

  static init() {
    new UserManager()
  }

  load(){
    this.loadAsync()
  }

  async loadAsync(){
    const user = await DB2Manager.instance.local!.get<IUser>(MainManager.keys.user)
    if(user){
      this.user.value = user
    }
  }

  setUseLocalDb(value: boolean) {
    this.useLocalDb.value = value
    LocalStorageManager.set('useLocalDb', value)
  }

  setUseLocalOrders(value: boolean) {
    this.useLocalOrders.value = value
    LocalStorageManager.set('useLocalOrders', value)
  }

  setControlFutureDate(value: boolean) {
    this.controlFutureDate.value = value
    LocalStorageManager.set('controlFutureDate', value)
  }





  setUser(val: any) {
    this.user.value = val
    DB2Manager.instance.local!.set(MainManager.keys.user,toRaw(val))
    //DBManager.setData(MainManager.keys.user, toRaw(val)) // current_user
    this.emit('setUser', [this.user.value])
  }

  clearUser(){
    const oldValue = this.user.value
    this.user.value = null
    if(oldValue){
      DB2Manager.instance.local!.delete(MainManager.keys.user)
    }
    
    //DBManager.removeData(MainManager.keys.user) // current_user
    this.emit('clearUser', [oldValue])
  }

  // setBarcode(val:string){
  //   this.barcode = val
  //   this.emit('setBarcode',[val])
  // }

  /// Загружаем пользователя по ШК
  async uploadUser(id: string): Promise<boolean> {
    const params = {
      "ID": id// Заменяем все вхождения " " на ""
    }

    const response = await HttpManager.get('/get_user', params)
    if (response.success) {
      //LocalStorageManager.remove('scaningN') // Обнуляем счетчик сканирования у form_doc
      //LocalStorageManager.remove('scaningN_free')// Обнуляем счетчик сканирования у form_doc_free
      if (response.data.РезультатПроверки) {
        MainManager.instance.uploadBarcodes() //SetBarcods()// UPDATE BARCODE скачиваем все ШК с сервера 1С
        MainManager.instance.uploadTorgovieSeti() //SetTorgovieSeti() // Скачиваем все установленные к выбору Торговые сети (необходимо для создания информационного листа)
        MainManager.instance.uploadMainStore() // Загружаем инфу по основному складу
        this.setUser(response.data)
        //const baseName = 'user_docs'
        /// поиск в базе user_docs документов по данному пользователю
        const baseName = MainManager.keys.userDocument
        // const record = await DBManager.getFileAsync(this.user.value!.Ссылка.Ссылка, baseName, baseName)
        // if (record !== null) {
        //   await this.saveUserDocs([])
        // }
        NotificationManager.instance.playGood()
        return true

        /// поиск в базе user_docs документов по данному пользователю
        // DBManager.getFile(this.user.Ссылка.Ссылка, (record: any) => {
        //   if (record === -1) {// если не найден, то создать запись
        //     DBManager.setFile(
        //       {
        //         data: { docs: [] },
        //         id: this.user.Ссылка.Ссылка
        //       }, 'user_docs', 'user_docs')
        //   }
        // }, 'user_docs', 'user_docs')

        // form_select_user.go_button = true
        // form_menu.fio = response.data // заполняем ФИО на форме form_menu
        // form_menu.show() // открытие формы form_menu
        // soundClick("resurse/GOOD.mp3")
        


        //SetMainOrder() // Обновляем информацию по основному складу
        //SetData("current_user", response.data) // запись в локальное хранилище информации о текущем пользователе
        // getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> { // поиск в базе user_docs документов по данному пользователю
        //   if (res === -1) {// если не найден, то создать запись
        //     setFile(
        //       {
        //         data: { docs: [] },
        //         id: GetData('current_user', 'j').Ссылка.Ссылка
        //       }, 'user_docs', 'user_docs')
        //   }
        // }, 'user_docs', 'user_docs')
        // form_select_user.go_button = true
        // form_menu.fio = response.data // заполняем ФИО на форме form_menu
        // form_menu.show() // открытие формы form_menu
        // soundClick("resurse/GOOD.mp3") 
      } else {
        NotificationManager.swal(response.data.Текст) // показываем ошибку с сервера
        //this.emit('go', ['form_select_user'])
        //form_select_user.show() // показываем форму выбора пользователя
        NotificationManager.instance.playError()
        //soundClick("resurse/ERROR.mp3")

      }
    } else {
      NotificationManager.swal(response.data.Текст) // показываем ошибку с сервера
      //form_select_user.show() // показываем форму выбора пользователя
      //this.emit('go', ['form_select_user'])
      NotificationManager.instance.playError()
    }
    return false
    // axios.get(url_to_base + '/barcode2020/hs/barcode/get_user', // отправляем запрос на сервер , параметры ID шк пользователя 
    //   {
    //     params: {
    //       "ID": PodgotovitBarcode(this,this.barcode)// Заменяем все вхождения " " на ""
    //     }
    //   })
    //   .then( (response) =>{
    //     RemoveData('scaningN') // Обнуляем счетчик сканирования у form_doc
    //     RemoveData('scaningN_free')// Обнуляем счетчик сканирования у form_doc_free
    //     if (response.data.РезультатПроверки) {
    //       SetBarcods()// UPDATE BARCODE скачиваем все ШК с сервера 1С
    //       SetTorgovieSeti() // Скачиваем все установленные к выбору Торговые сети (необходимо для создания информационного листа)
    //       SetMainOrder() // Обновляем информацию по основному складу
    //       SetData("current_user", response.data) // запись в локальное хранилище информации о текущем пользователе
    //       getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> { // поиск в базе user_docs документов по данному пользователю
    //         if (res === -1) {// если не найден, то создать запись
    //           setFile(
    //             {
    //               data: { docs: [] },
    //               id: GetData('current_user', 'j').Ссылка.Ссылка
    //             }, 'user_docs', 'user_docs')
    //         }
    //       }, 'user_docs', 'user_docs')
    //       form_select_user.go_button = true
    //       form_menu.fio = response.data // заполняем ФИО на форме form_menu
    //       form_menu.show() // открытие формы form_menu
    //       soundClick("resurse/GOOD.mp3") 
    //     } else {
    //       swal(response.data.Текст) // показываем ошибку с сервера
    //       form_select_user.show() // показываем форму выбора пользователя
    //       soundClick("resurse/ERROR.mp3")
    //     }
    //   })
    //   .catch( (error)=> {
    //     swal(error)
    //     form_select_user.show()
    //     soundClick("resurse/ERROR.mp3")
    //   })
    //this.barcode = "" // очищаем поле ШК на форме авторизации пользователя
    //this.setBarcode("")
  }

  async getUserDocuments():Promise<IDocument[]>{
    if(this.user.value){
      return (await MainManager.instance.local.allUserDocs())??[]
      //const baseName = MainManager.keys.userDocument
      //const docs = await DBManager.getFileAsync(this.user.value!.Ссылка.Ссылка, baseName, baseName)
    //return docs?.data.docs
    }
    return []
    
  }

  async saveUserDocs(docs:IDocument[]){
    if(this.user.value){
     // const baseName = MainManager.keys.userDocument
     // const tmpData = toRaw({ data: { docs: docs.map((x:IDocument)=> toRaw(x)) }, id: this.user.value!.Ссылка.Ссылка })
      const result = await DB2Manager.instance.userDocuments!.setAll(docs.map((x:IDocument)=> toRaw(x)))
      return result
    }
    return false
    
  }
  /// Получаем сохраненные документы ДвижениеПродукцииИМатериалов
  async getGettingProdDocuments():Promise<IGettingProductionDocument[]>{
    const res = await this.getUserDocuments()
    const documents = []
    if(res){
      const dosc:IDocument[]=res
      for(const doc of dosc){
        if(doc.Ссылка.Вид==="ДвижениеПродукцииИМатериалов"){
          documents.unshift(doc)
        }
      }
    }
    return documents as IGettingProductionDocument[]
  }
  
  /// Получаем сохраненные(документы пользователя) документы ЗаказКлиента
  async getShipmentDocuments():Promise<IShipmentDocument[]>{
    const res = await this.getUserDocuments()
    const documents:IShipmentDocument[] = []
    if(res){
      const dosc:IDocument[]=res
      for(const doc of dosc){
        if(doc.Ссылка.Вид==="ЗаказКлиента"){
          documents.unshift(doc as IShipmentDocument)
        }
      }
    }
    return documents
  }



}