/* Возвращает количество по заданному параметру в переданной таблице */
export function GetCount(Таблица: any[], Параметр: string): number {
  let Количество = 0
  for (const i of Таблица) {
    Количество = Количество + Number(i[Параметр])
  }
  return Number(Количество.toFixed(2)) 
}