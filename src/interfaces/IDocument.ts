import { IScaning } from "./IScaning"
import { IТара } from "./IStore"

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
    containers:IТара[]
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

export interface IСерия extends IProperty {
    ДатаПроизводства:string
    ГоденДо:string
}