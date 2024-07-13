<template>
  <div
    :class="data.cls + ' bs-callout bs-callout-danger'"
    :name="'check' + data.Номенклатура.Наименование"
  >
    <div class="row">
      <div class="col-10">
        <div
          role="button"
          @click="
            () => {
              emit('tap', data.Номенклатура.Наименование);
            }
          "
        >
          <b>{{ data.Номенклатура.Артикул }}</b> {{ data.Номенклатура.Наименование }}
        </div>
        <div>{{ data.Характеристика.Наименование }}</div>
        <div v-if="mode == 'НомХарСер'">{{ data.Серия.Наименование }}</div>
        <div>
          <b>ПЛУ : {{ data.ПЛУ }}</b>
        </div>
        <div>
          <b>к/к. {{ data.КоличествоКоробок }}</b>
        </div>
        <div>
          <b
            >тек {{ data.ТекущееКоличество }} / зак
            {{ data.имКоличествоВПересчетеНаКг }} кг</b
          >
        </div>
        <div>
          <b
            >тек {{ data.ТекущееКоличествоВЕдиницахИзмерения }} / зак
            {{ data.КоличествоУпаковок }}
            {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}</b
          >
        </div>
      </div>
      <div class="col-2">
        <div v-if="showProcent">
          <b>{{ data.ВПроцСоотношении }}%</b>
        </div>
        <slot name="addButton"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RowKeyMode } from "@/functions/GetGroupScans";
import { IScaningGroup } from "@/interfaces/IScaning";

interface Props {
  data: IScaningGroup;
  mode: RowKeyMode;
  showProcent: boolean;
}

withDefaults(defineProps<Props>(), {
  mode: "НомХарСер",
  showProcent: true,
});
const emit = defineEmits(["tap"]);
</script>
