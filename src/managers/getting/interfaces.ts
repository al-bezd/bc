import { IWithCheckup } from "@/classes/HttpManager";
import {  IDocument } from "@/interfaces/IDocument";
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
    

    ТекущееКоличество:number
    ТекущееКоличествоВЕдиницахИзмерения:number
    КоличествоКоробок:number
    КоличествоУпаковок:number
    имКоличествоВПересчетеНаКг:number
    cls:string /// Класс для отображения цвета плашки
    key:string /// Ключ Ном+Хар+Серия
    ВПроцСоотношении:number
    рсУИД:string
}


export interface IGettingProductionDocument extends IWithCheckup, IDocument{
    Товары:IGettingProductionProductItem[]
    оитКоличествоКоробок:number
    оитНомерПалета:string
    
}

export interface IНоменклатура extends IDocument {
    ЕдиницаИзмерения:IDocument
    Артикул:string
}

export type IХарактеристика = IDocument

export type IСерия = IDocument