import { IScaning } from "./IScaning"

export interface I1CObject{
    Ссылка:string
    Наименование:string
}

export interface IDocument{
    Ссылка:IСсылка
    Наименование:string
    scanings:IScaning[]
}

export interface IСсылка extends I1CObject{
 
    Тип:string
    Вид:string
}

export interface IUser extends IDocument{
    
    ФИО:string
  }