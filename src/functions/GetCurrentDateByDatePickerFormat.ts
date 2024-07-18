export function getCurrentDateByDatePickerFormat(): string {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = getStrDayMonth(currentDate.getMonth() + 1);
    const currentDay = getStrDayMonth(currentDate.getDate());
    return `${currentYear - 2000}${currentMonth}${currentDay}`
}

export function getStrDayMonth(value: number): string {
    return value >= 10 ? "" + value : "0" + value;
}

/// Возвращает объект даты из строкового представления даты формата DataPicker
export function getCurrentDateFromDatePickerFormat(value: string): Date {
    // Предполагаем, что строка имеет формат "yymmdd"
    const year = parseInt(value.slice(0, 2), 10) + 2000; // добавляем 2000 к году, чтобы он был в диапазоне 2000-2099
    const month = parseInt(value.slice(2, 4), 10) - 1;  // месяцы в JavaScript начинаются с 0
    const day = parseInt(value.slice(4, 6), 10);
    const res = new Date(year, month, day)
    //console.log('orig date ',value,' new date ',res,' d ',day,' m ',month, ' y ',year)
    return res;
}