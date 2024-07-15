import { IScaning } from "@/interfaces/IScaning"

export type OrderByType = "Артикул"|"История"

export function GetListSortBy(list:IScaning[], mode:OrderByType) {
    if (mode === 'Артикул') {
      list.sort( (a, b)=> {
        // > - по возрастанию
        if (a.Артикул > b.Артикул) {
          return -1;
        }
        if (a.Артикул < b.Артикул) {
          return 1;
        }
        return 0;
      }) 
    }else if (mode === 'История') {
      list.sort( (a, b)=> {
        //return a.IDSec - b.IDSec
        if (a.IDSec > b.IDSec) {
          return -1;
        }
        if (a.IDSec < b.IDSec) {
          return 1;
        }
        return 0;
      })
    }
    return list
  }
  
