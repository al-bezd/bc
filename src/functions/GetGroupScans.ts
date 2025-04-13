import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { FillCount } from "./FillCount";
export type RowKeyMode = "НомХарСер"|"НомХар"|"Ном"
/// Возвращает key строки таблицы
export function getRowKey(row: IScaning, mode:RowKeyMode="НомХарСер") {

    const НоменклатураСсылка = row.Номенклатура.Ссылка.Ссылка;
    const ХарактеристикаСсылка = row.Характеристика.Ссылка.Ссылка;

    if(mode=="НомХар"){
        return НоменклатураСсылка + ХарактеристикаСсылка
    } else if(mode=="Ном"){
      return НоменклатураСсылка
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
      
      ///const dataItem: IScaningGroup = list[key];
      // eslint-disable-next-line no-prototype-builtins
      //const condition = !list.hasOwnProperty(key)
      const condition = !(key in list)
      if (condition) {
        
        list[key] = Object.assign({}, item);
        list[key].key = key;
        list[key].cls = " alert alert-primary ";
        list[key].ВПроцСоотношении = 0;

        list[key].Количество = 0;
        list[key].КоличествоВЕдиницахИзмерения = 0;
        list[key].Грузоместа = 0;

        list[key].ТекущееКоличество = 0;
        list[key].ТекущееКоличествоВЕдиницахИзмерения = 0;
        list[key].ТекущееКоличествоГрузомест = 0
        
        list[key].ЗаказанноеКоличество = 0
        list[key].ЗаказанноеКоличествоВЕдиницахИзмерения = 0
        list[key].ЗаказанноеКоличествоГрузомест = 0
        
        //list[key].КоличествоКоробок = 0;
        //list[key].КоличествоУпаковок = 0;
        
  
        //continue;
      }
      
      // list[key].ТекущееКоличество+=item.Количество??0
      // list[key].ТекущееКоличествоВЕдиницахИзмерения+=item.КоличествоВЕдиницахИзмерения??0
      // list[key].ТекущееКоличествоГрузомест+=item.Грузоместа??0
      //const t = (item as any)
      //console.log("item", item)
      FillCount(list[key], item)
      // if(list[key].Номенклатура.ЕдиницаИзмерения.Наименование == "шт") {
      //   //если штучная продукция то количество у нее не в кг а в ее ед изм а надо перевести в кг а вед изм заполнить ед изм
      //   list[key].КоличествоВЕдиницахИзмерения += item.Количество??0;
      //   list[key].Количество += item.Количество*list[key].Номенклатура.ВесЧислитель
      // }else{
      //   let КоличествоВЕдиницахИзмерения = item.КоличествоВЕдиницахИзмерения??0
      //   const Количество = item.Количество??0

      //   list[key].Количество += Количество
      //   КоличествоВЕдиницахИзмерения = КоличествоВЕдиницахИзмерения == 0 ? Количество : КоличествоВЕдиницахИзмерения
      //   list[key].КоличествоВЕдиницахИзмерения += КоличествоВЕдиницахИзмерения
      // }
      
      
      //list[key].КоличествоКоробок += t.КоличествоКоробок??0;
      //list[key].КоличествоУпаковок += t.КоличествоУпаковок??0
      //list[key].Грузоместа += item.Грузоместа??0;

      list[key].ЗаказанноеКоличество = list[key].ТекущееКоличество
      list[key].ЗаказанноеКоличествоВЕдиницахИзмерения = list[key].ТекущееКоличествоВЕдиницахИзмерения
      list[key].ЗаказанноеКоличествоГрузомест = list[key].ТекущееКоличествоГрузомест
      
      // ВПроцСоотношении = Math.round(
      //   (100 / i.КоличествоУпаковок) * i.ТекущееКоличествоВЕдиницахИзмерения
      // );
}
const result = [];
for (const key of Object.keys(list)) {
  result.unshift(list[key]);
}
return result;}