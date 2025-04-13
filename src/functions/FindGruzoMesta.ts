import { NotificationManager } from "@/classes/NotificationManager";
export function IsBarcodePalet(barcode:string){
  try{
    if(barcode.length!=52 ){
      return false
    }
    const start = barcode.indexOf('91', barcode.length - 5);
    const end = barcode.indexOf('91', barcode.length - 5) + 5;
    if(start == -1 || end == -1){
      return false
    }
    return true;
  }catch(e){
    return false
  }
  
}
export function FindGM(barcode:string) {
    //str.indexOf
    //Первый метод — str.indexOf(substr, pos).
    //Он ищет подстроку substr в строке str, начиная с позиции pos,
    //и возвращает позицию, на которой располагается совпадение, либо -1 при отсутствии совпадений.
    try {
      const start = barcode.indexOf('91', barcode.length - 5);
      const end = barcode.indexOf('91', barcode.length - 5) + 5;
      if (start == -1 || end == -1) {
        throw "Штрих код не является палетной этикеткой (отсутствует идентификатор 91)";
      }
      return Number(barcode.slice(start + 2, end));
    } catch (e) {
      NotificationManager.swal(JSON.stringify(e));
      return 1;
    }
  }