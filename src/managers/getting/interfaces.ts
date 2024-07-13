import { IWithCheckup } from "@/classes/HttpManager";
import {  IDocument, IНоменклатура, IСерия, IХарактеристика } from "@/interfaces/IDocument";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";

/// Структура объекта строка таблицы Товары
export interface IGettingProductionProductItem extends IScaning {
    Номенклатура:IНоменклатура
    Характеристика:IХарактеристика
    Серия:IСерия
    ПЛУ:string
    Количество:number
    КоличествоВЕдиницахИзмерения:number
    Грузоместа:number
}
/// Структура объекта для экрана с итогами
export interface IGettingProductionProductTotalItem extends IScaningGroup {
    

    
    
    
    ВПроцСоотношении:number
    рсУИД:string
}


export interface IGettingProductionDocument extends IWithCheckup, IDocument{
    Товары:IGettingProductionProductItem[]
    оитКоличествоКоробок:number
    оитНомерПалета:string
    
}

