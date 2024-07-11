import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
export type RowKeyMode = "НомХарСер"|"НомХар"
/// Возвращает key строки таблицы
export function getRowKey(row: IScaning, mode:RowKeyMode="НомХарСер") {

    const НоменклатураСсылка = row.Номенклатура.Ссылка.Ссылка;
    const ХарактеристикаСсылка = row.Характеристика.Ссылка.Ссылка;

    if(mode=="НомХар"){
        return НоменклатураСсылка + ХарактеристикаСсылка
    }
    
    const СерияСсылка = row.Серия.Наименование; //Используем наименование как ссылку потому что мы идентифицируем в приложении серию по наименованию
    const key = НоменклатураСсылка + ХарактеристикаСсылка + СерияСсылка;
    return key;
  }

export function GetGroupScans(
    scanings: IScaning[], mode:RowKeyMode="НомХарСер"
  ): IScaningGroup[] {
    const list: any = {};
    for (const item of scanings) {
      const key = getRowKey(item, mode);
  
      // eslint-disable-next-line no-prototype-builtins
      if (!list.hasOwnProperty(key)) {
        list[key] = Object.assign({} as IScaningGroup, item);
        list[key].key = key;
        list[key].cls = " alert alert-primary ";
        list[key].ВПроцСоотношении = 0;
        list[key].ТекущееКоличество = 0;
        list[key].ТекущееКоличествоВЕдиницахИзмерения = 0;
        list[key].КоличествоКоробок = 0;
  
        continue;
      }
      const dataItem: IScaningGroup = list[key];
      dataItem.Количество += item.Количество;
      dataItem.КоличествоВЕдиницахИзмерения += item.КоличествоВЕдиницахИзмерения;
      dataItem.КоличествоКоробок += item.Грузоместа;
      // ВПроцСоотношении = Math.round(
      //   (100 / i.КоличествоУпаковок) * i.ТекущееКоличествоВЕдиницахИзмерения
      // );
}
const result = [];
for (const key of Object.keys(list)) {
  result.unshift(list[key]);
}
return result;}