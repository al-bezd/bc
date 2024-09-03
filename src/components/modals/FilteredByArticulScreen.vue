<template>
  <BootstrapModalWindow :seen="controller.seen.value">
    <ModelWidget
      :mode="controller.mode.value"
      :items="['Кор', 'НомХар', 'НомХарСер']"
      @tap="
        (value) => {
          controller.setMode(value);
        }
      "
    />

    <!--  -->
    <div class="space">
      <div>
        <ListWidget key-field="IDSec" :list="controller.items.value">
          <template #default="{ item }">
            <ScaningItem
              :key="item.IDSec"
              :data="item"
              :mode="controller.mode.value"
              :show-procent="controller.showProcent.value"
              @tap="
                () => {
                  emit('tap', item);
                }
              "
              @delete="
                () => {
                  emit('delete', item);
                }
              "
            />
          </template>
        </ListWidget>

        <!--<div v-for="item in prodList" :key="item.IDSec">
              <scaning-tmp v-bind:item="item" obj="'getting_prod_check'"></scaning-tmp>
              </div>-->
      </div>
    </div>
    <slot name="footer">
      <table>
        <tr>
          <td>
            <span class="mb"
              >Количество <b>{{ count }}</b> Шт.</span
            >
          </td>
          <td>
            <span class="mb"
              >Вес <b>{{ weight }}</b> Кг.</span
            >
          </td>
        </tr>
      </table>
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

import ModelWidget from "@/components/widgets/ModeWidget.vue";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { GetCount } from "@/functions/GetCount";
import ListWidget from "@/components/widgets/ListWidget.vue";

interface IProps {
  controller: FilteredByArticulController;
}
const props = defineProps<IProps>();
const emit = defineEmits(["delete", "tap"]);

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
props.controller.connect("afterDelete", onAfterDelete);
function onAfterDelete() {
  if (props.controller.seen.value) {
    props.controller.refresh();
  }
}
</script>
