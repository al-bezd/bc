import { IScaning } from "./IScaning"
import { IStore } from "./IStore"
import { ITorgovieSeti } from "./ITorgovieSeti"

export interface IInfoList{
    ШК:string
    data:IScaning[],
    ВесПоддона:number,
    НомерПоддона:string,
    Сеть:ITorgovieSeti,
    Склад:IStore
}