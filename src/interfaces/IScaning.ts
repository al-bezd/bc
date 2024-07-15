
import {  IНоменклатура, IСерия, IХарактеристика } from "./IDocument"

export interface IScaning{
    IDSec:number
    ID: string
    Номенклатура: IНоменклатура,
    Характеристика: IХарактеристика,
    Серия: IСерия,
    ПЛУ: string,
    Количество: number,
    КоличествоВЕдиницахИзмерения: number,
    ЕдиницаИзмерения: string,
    Артикул: string,
    Грузоместа: number,
    Палетная: string,
    ШтрихкодПродукции:string,
    bc: string,
    free:boolean
}

export interface IScaningGroup extends IScaning{
    ВПроцСоотношении:number
    ТекущееКоличество:number
    ТекущееКоличествоВЕдиницахИзмерения:number
    КоличествоКоробок:number
    имКоличествоВПересчетеНаКг:number
    КоличествоУпаковок:number
    cls:string
    key:string /// Ключ Ном+Хар+Серия
    
}