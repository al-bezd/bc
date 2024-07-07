export interface I1CObject{
    Ссылка:string
    Наименование:string
}

export interface IDocument{
    Ссылка:IСсылка
    Наименование:string
}

export interface IСсылка extends I1CObject{
 
    Тип:string
    Вид:string
}