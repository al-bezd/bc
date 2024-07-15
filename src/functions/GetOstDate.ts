import {  IНоменклатура, IХарактеристика } from "@/interfaces/IDocument";

export function formatDate(date:Date) {

    let dd:number|string = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    let mm:number|string = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
  
    let yy:number|string = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;
  
    return dd + '.' + mm + '.' + yy;
  }
  
  export function GetOstDate(table:any[], Номенклатура:IНоменклатура, Характеристика:IХарактеристика) {
    return table.filter(item => item.Номенклатура.Ссылка.Ссылка == Номенклатура.Ссылка.Ссылка && item.Характеристика.Ссылка.Ссылка == Характеристика.Ссылка.Ссылка)[0].ОстаточныйСрокГодности
  }