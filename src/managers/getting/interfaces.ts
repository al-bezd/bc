import { IWithCheckup } from "@/classes/HttpManager";
import { I1CObject, IDocument } from "@/interfaces/IDocument";

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

export interface IНоменклатура extends IDocument{

}

export interface IХарактеристика extends IDocument{

}

export interface IСерия extends IDocument{

}