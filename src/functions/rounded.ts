export const  rounded = (number:any, param:any=undefined)=> {
    if (typeof (number) !== "number") {
      if (number === undefined) {
        number = 0
      } else {
        number = Number(number)
      }
    }
  
    if (param !== undefined) {
      return +number.toFixed(param)
    }
    return +number.toFixed(3)
  }