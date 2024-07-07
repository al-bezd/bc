export function Date1C(date1:string, date2:string):string {
    const d1 = date1.slice(4, 6);
    const m1 = date1.slice(2, 4);
    const y1 = date1.slice(0, 2);
    const d2 = date2.slice(4, 6);
    const m2 = date2.slice(2, 4);
    const y2 = date2.slice(0, 2);
    return `от ${d1}.${m1}.${y1} до ${d2}.${m2}.${y2}`;
  } 