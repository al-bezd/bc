<template>
  <BootstrapModalWindow :seen="controller.seen.value">
    <span class="mb-3"
      >Коробок <b>{{ countThisArticul }}</b> Шт.</span
    >
    <div class="space">
      <div>
        <ScaningGroupItem
          v-for="item in controller.items.value"
          :key="item.IDSec"
          :data="item"
          @tap="
            () => {
              emit('tap', item);
            }
          "
        />
        <!--<div v-for="item in prodList" :key="item.IDSec">
              <scaning-tmp v-bind:item="item" obj="'getting_prod_check'"></scaning-tmp>
              </div>-->
      </div>
    </div>
    <div class="row">
      <button
        type="button"
        class="btn btn-primary btn-lg text-uppercase w-100"
        @click="close"
      >
        <b>НАЗАД</b>
      </button>
    </div>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
import { Ref, computed, ref } from "vue";
import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { GetCount } from "@/functions/GetCount";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";

interface IProps {
  controller: FilteredByArticulController;
  
}
const props = defineProps<IProps>()
const emit = defineEmits([ "delete", "tap"]);
const currentArticul: Ref<IScaning | null> = ref(null);

// const prodList = computed(() => {
//   return GettingManager.instance.currentScanings.value.filter((x) => {
//     return x.Номенклатура.Наименование == currentArticul.value;
//   });
// });

const countThisArticul = computed(() => {
  let Count = 0;
  if (currentArticul.value) {
    return GetCount(props.controller.items.value, "Грузоместа");
    //return items.value.reduce((sum, scan) => sum + scan.Грузоместа, 0);
    // for (const item of prodList.value) {
    //   Count += item.Грузоместа;
    // }
  }
  return Count;
});
function close() {
  //emit("update:seen", false);
  props.controller.close()
}

async function itemDelete(item: IScaning) {
  emit("delete", item);
}
</script>
