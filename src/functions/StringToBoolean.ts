export function StringToBool(val:string|null){
    if(val==='true'){
      return true
    } else if(val==='false'){
      return false
    } else if (val===null){
      return null
    }
  }