import { IScaning } from "@/interfaces/IScaning"

export function GetListSortBy(list:IScaning[], mode:string) {
    if (mode === 'Articul') {
      list.sort( (a, b)=> {return Number(a.Артикул) - Number(b.Артикул)}) 
    }else if (mode === 'History') {
      list.sort( (a, b)=> {return a.IDSec - b.IDSec})
    }
    return list
  }
export function OrderBy(list:IScaning[],mode:string):IScaning[]{
    if (mode === 'Артикул') {
        return GetListSortBy(list, 'Articul')
        //scaning_response = GetListSortBy(scaning_response, 'Articul')
      }
      else if (mode === 'История') {
        return GetListSortBy(list, 'History')
        //scaning_response = GetListSortBy(scaning_response, 'History')
      }
      throw "mode не валиден"
      //SetData("scaning_response", scaning_response);
}