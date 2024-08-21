import { Observable } from "@/classes/BaseManager";
import { GetGroupScans, RowKeyMode } from "@/functions/GetGroupScans";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { Ref, ref, toRaw } from "vue";

export type FilteredByArticulTypes = RowKeyMode | "Кор";


export class FilteredByArticulController extends Observable{
    constructor(originalItems: Ref<IScaning[] | IScaningGroup[]>, mode: Ref<FilteredByArticulTypes>,showProcent=false) {
        super()
        this.originalItems = originalItems
        this.mode = mode
        this.showProcent.value = showProcent
    }
    public seen = ref(false);
    public originalItems: Ref<IScaning[] | IScaningGroup[]> = ref([]);
    public items: Ref<IScaning[] | IScaningGroup[]> = ref([]);
  



    public scaning: IScaning | null = null
    public mode: Ref<FilteredByArticulTypes> = ref("НомХарСер")
    public showProcent = ref(false)
    


    show() {
        this.seen.value = true
    }

    close() {
        this.seen.value = false
    }

    refresh() {
        this.setMode(this.mode.value)
    }

    onAfterDelete(callback:()=>void){
        callback()
    }
    

    filter(scaning: IScaning, mode: FilteredByArticulTypes | null = null) {
        this.scaning = scaning
        if (mode == null) {
            mode = this.mode.value
        }
        let items = []

        if (mode == "Ном") {
            items = this.originalItems.value.filter(
                (x: IScaning) =>
                    x.Номенклатура.Ссылка.Ссылка === scaning.Номенклатура.Ссылка.Ссылка

            );

        }
        else {
            items = this.originalItems.value.filter(
                (x: IScaning) =>
                    x.Номенклатура.Ссылка.Ссылка === scaning.Номенклатура.Ссылка.Ссылка &&
                    x.Характеристика.Ссылка.Ссылка === scaning.Характеристика.Ссылка.Ссылка
            );

        }
        if(this.mode.value != "Кор"){
            this.items.value = GetGroupScans(
                items, mode as RowKeyMode
            )
            console.log(this.items.value.map(x=>toRaw(x)))
            return
        }
        
        this.items.value = items;
        //this.items.value = items;
         
        
    }



    setMode(value: FilteredByArticulTypes) {
        if (!this.scaning) {
            return
        }
        this.mode.value = value
        this.filter(this.scaning)
    }
}