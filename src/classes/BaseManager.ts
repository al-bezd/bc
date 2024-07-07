export class BaseManager{

    

    /// Метод загрузки объекта, вызывается когда страница была перезагружена
    load(){
        //
    }

    emit(state:string,data:any[]=[]){
        document.dispatchEvent(new CustomEvent(state,{detail:data}))
    }

    connect(state:string, listener: (data: any[]) => void){
        //document.addEventListener(state, listener)
        function eventWrapper(this:Document, event:any){
            listener(event.detail)
        }
        document.addEventListener(state, eventWrapper)
    }
}