import { RowKeyMode } from "@/functions/GetGroupScans";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { Ref, ref } from "vue";

export class FilteredByArticulController {
    constructor(originalItems: Ref<IScaning[] | IScaningGroup[]>, mode: Ref<RowKeyMode>) {
        this.originalItems = originalItems
        this.mode = mode
    }
    public seen = ref(false);
    public originalItems: Ref<IScaning[] | IScaningGroup[]> = ref([]);
    public items: Ref<IScaning[] | IScaningGroup[]> = ref([]);
    public mode: Ref<RowKeyMode> = ref("НомХарСер")

    show() {
        this.seen.value = true
    }

    close() {
        this.seen.value = false
    }

    init(scaning: IScaning,mode:RowKeyMode|null=null) {
        if(mode==null){
            mode = this.mode.value
        }
        if (mode == "НомХар") {
            this.items.value = this.originalItems.value.filter(
                (x: IScaning) =>
                    x.Номенклатура.Ссылка.Ссылка === scaning.Номенклатура.Ссылка.Ссылка &&
                    x.Характеристика.Ссылка.Ссылка === scaning.Характеристика.Ссылка.Ссылка
            );
            return;
        }
        this.items.value = this.originalItems.value.filter(
            (x: IScaning) =>
                x.Номенклатура.Ссылка.Ссылка === scaning.Номенклатура.Ссылка.Ссылка &&
                x.Характеристика.Ссылка.Ссылка === scaning.Характеристика.Ссылка.Ссылка &&
                x.Серия.Ссылка === scaning.Серия.Ссылка
        );
    }
}