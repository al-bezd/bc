export function GetCountBox(data: any) {
    return Math.max(
      data.Грузоместа ?? 0,
      data.ТекущееКоличествоГрузомест ?? 0,
      data.КоличествоКоробок ?? 0
    );
  }