<template>
  <div class="reft_modal" v-if="seen">
    <span class="mb-3"
      >Коробок <b>{{ countThisArticul }}</b> Шт.</span
    >
    <div class="space">
      <div>
        <ScaningGroupItem
          v-for="item in prodList"
          :key="item.IDSec"
          :data="item"
          @delete="itemDelete"
        />
        <!--<div v-for="item in prodList" :key="item.IDSec">
            <scaning-tmp v-bind:item="item" obj="'getting_prod_check'"></scaning-tmp>
            </div>-->
      </div>
    </div>
    <button
      type="button"
      class="btn btn-primary btn-lg text-uppercase w-100"
      @click="close"
    >
      <b>НАЗАД</b>
    </button>
  </div>
</template>
<script setup lang="ts">
import { Ref, computed, ref } from "vue";
import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import { IScaning } from "@/interfaces/IScaning";
import { GettingManager } from "@/managers/getting/GettingManager";
import { NotificationManager } from "@/classes/NotificationManager";
const seen = ref(false);
const currentArticul: Ref<IScaning | null> = ref(null);

const prodList = computed(() => {
  return GettingManager.instance.currentScanings.value.filter((x) => {
    return x.Номенклатура.Наименование == currentArticul.value;
  });
});
const countThisArticul = computed(() => {
  let Count = 0;
  if (currentArticul.value) {
    return prodList.value.reduce((sum, scan) => sum + scan.Грузоместа, 0);
    // for (const item of prodList.value) {
    //   Count += item.Грузоместа;
    // }
  }
  return Count;
});
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
    ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    GettingManager.instance.deleteScaning(item);
  }
}

GettingManager.instance.connect("openArticulScreen", (data) => {
  currentArticul.value = data[0];
  show();
});
</script>
