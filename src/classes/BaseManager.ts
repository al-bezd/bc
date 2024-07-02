export class BaseManager{
    emit(state:string,data:any[]=[]){
        document.dispatchEvent(new CustomEvent(state,{detail:data}))
    }

    connect(state:string, listener: (this: Document, ev: any) => any){
        document.addEventListener(state, listener)
    }
}