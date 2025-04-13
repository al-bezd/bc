/* Возвращает количество по заданному параметру в переданной таблице */
export function GetCount(Таблица: any[], Параметр: string, КоличествоЗнаковПослеЗапятой = 3): number {
  let Количество = 0
  for (const i of Таблица) {
    Количество = Количество + Number(i[Параметр])
  }
  return Round(Количество, КоличествоЗнаковПослеЗапятой)
}

export function Round(value:number, countDigits=3) {
  return Number((value??0).toFixed(countDigits))
}