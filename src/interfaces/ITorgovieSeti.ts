import { ILinkedObject } from "./IDocument"

export interface ITorgovieSeti extends ILinkedObject{
    ИмяПредопределенныхДанных:string
    Код:string
    Наименование:string
    ПометкаУдаления:boolean
    Предопределенный:boolean
    РезультатПроверки:boolean
    Сеть:ILinkedObject
   


}