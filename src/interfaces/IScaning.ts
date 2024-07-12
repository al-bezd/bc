export interface IScaning{
    IDSec:number
    ID: string
    Номенклатура: any,
    Характеристика: any,
    ПЛУ: string,
    Серия: any,
    Количество: number,
    КоличествоВЕдиницахИзмерения: number,
    ЕдиницаИзмерения: string,
    Артикул: string,
    Грузоместа: number,
    Палетная: string,
    bc: string
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
    
}