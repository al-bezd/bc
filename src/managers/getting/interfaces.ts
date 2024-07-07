import { IWithCheckup } from "@/classes/HttpManager";
import {  IDocument } from "@/interfaces/IDocument";

export interface IGettingProductionProductItem {
    Номенклатура:IНоменклатура
    Характеристика:IХарактеристика
    Серия:IСерия
    ПЛУ:string
    Количество:number
    КоличествоВЕдиницахИзмерения:number
    Грузоместа:number
}


export interface IGettingProductionDocument extends IWithCheckup, IDocument{
    Товары:IGettingProductionProductItem[]
    оитКоличествоКоробок:number
    оитНомерПалета:string
}

export type IНоменклатура = IDocument

export type IХарактеристика = IDocument

export type IСерия = IDocument