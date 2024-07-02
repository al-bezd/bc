export class LocalStorageManager{
    static init(){
        //
    }
    static get(key: string, isJson=false){
        if(isJson){
            try{
                return JSON.parse(localStorage.getItem(key) as string)
            }catch(e){
                console.error(e)
                return null;
            }
            
        }
        return localStorage.getItem(key)
    }

    static set(key:string, value:any){
        if (typeof (value) !== typeof ("")) {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value);
          }
    }

    static remove(key:string){
        localStorage.removeItem(key)
    }
}