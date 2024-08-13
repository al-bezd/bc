<template>
  <BootstrapModalWindow :seen="controller.seen.value">
    <ModelWidget
      :mode="controller.mode.value"
      :items="['Ном', 'НомХар', 'НомХарСер']"
      @tap="
        (value) => {
          controller.setMode(value);
        }
      "
    />

    <!--  -->
    <div class="space">
      <div>
        <ScaningItem
          v-for="item in controller.items.value"
          :key="item.IDSec"
          :data="item"
          :mode="controller.mode.value"
          :show-procent="controller.showProcent.value"
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
    <slot name="footer">
      <div class="row my-2">
        <div class="col">
          <span class="mb-3"
            >Количество <b>{{ count }}</b> Шт.</span
          >
        </div>
        <div class="col">
          <span class="mb-3"
            >Вес <b>{{ weight }}</b> Кг.</span
          >
        </div>
      </div>
    </slot>
    <div class="">
      <button
        type="button"
        class="btn btn-primary text-uppercase w-100"
        @click="controller.close"
      >
        <b>НАЗАД</b>
      </button>
    </div>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
import { computed } from "vue";
//import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import ScaningItem from "@/components/widgets/ScaningItem.vue";
import { IScaning } from "@/interfaces/IScaning";

import ModelWidget from "@/components/widgets/ModeWidget.vue";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { GetCount } from "@/functions/GetCount";

interface IProps {
  controller: FilteredByArticulController;
}
const props = defineProps<IProps>();
const emit = defineEmits(["delete", "tap"]);
//const currentArticul: Ref<IScaning | null> = ref(null);

// const prodList = computed(() => {
//   return GettingManager.instance.currentScanings.value.filter((x) => {
//     return x.Номенклатура.Наименование == currentArticul.value;
//   });
// });

const count = computed(() => {
  //let Count = 0;
  if (props.controller.scaning) {
    return props.controller.items.value.length;
  }
  return 0;
  //return Count;
});

const weight = computed(() => {
  //let Count = 0;
  if (props.controller.scaning) {
    return GetCount(props.controller.items.value, "Количество", 3);
  }
  return 0;
  //return Count;
});

async function itemDelete(item: IScaning) {
  emit("delete", item);
}
</script>
