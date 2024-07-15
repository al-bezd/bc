import { GetGroupScans, RowKeyMode } from "@/functions/GetGroupScans";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { Ref, ref } from "vue";

export class FilteredByArticulController {
    constructor(originalItems: Ref<IScaning[] | IScaningGroup[]>, mode: Ref<RowKeyMode>,showProcent=false) {
        this.originalItems = originalItems
        this.mode = mode
        this.showProcent.value = showProcent
    }
    public seen = ref(false);
    public originalItems: Ref<IScaning[] | IScaningGroup[]> = ref([]);
    public items: Ref<IScaningGroup[]> = ref([]);
    public scaning: IScaning | null = null
    public mode: Ref<RowKeyMode> = ref("НомХарСер")
    public showProcent = ref(false)

    show() {
        this.seen.value = true
    }

    close() {
        this.seen.value = false
    }



    filter(scaning: IScaning, mode: RowKeyMode | null = null) {
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

        this.items.value = GetGroupScans(
            items, mode
        )
        //console.log('this.items.value ', this.items.value)
    }

    setMode(value: RowKeyMode) {
        if (!this.scaning) {
            return
        }
        this.mode.value = value
        this.filter(this.scaning)
    }
}