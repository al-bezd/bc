import { IScaning } from "./IScaning"

// минимальная единица 
 export interface IProperty{
    Ссылка:string
    Наименование:string
}
// ссылочный объект (документ, справочник)
export interface ILinkedObject{
    Ссылка:IСсылка
    Наименование:string
   
}


// Документ заказ клиента заказ на перемещение
export interface IDocument{
    Ссылка:IСсылка
    Наименование:string
    scanings:IScaning[]
}

export interface IСсылка extends IProperty{
 
    Тип:string
    Вид:string
}

export interface IUser extends IDocument{
    
    ФИО:string
  }

  export interface IНоменклатура extends ILinkedObject {
    ЕдиницаИзмерения:IProperty
    Артикул:string
    ВесЧислитель:number
}

export interface IХарактеристика extends ILinkedObject {
    ДополнительныеРеквизиты:IРеквизит[]
    рсТипКоробки:ILinkedObject
}

export interface IРеквизит extends ILinkedObject{
    Свойство:ILinkedObject
    Значение:any
}

export type IСерия = IProperty