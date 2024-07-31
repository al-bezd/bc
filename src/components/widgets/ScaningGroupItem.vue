<template>
  <div
    :class="getClass() + ' bs-callout bs-callout-danger'"
    :name="'check' + data.Номенклатура.Наименование"
  >
    <div class="row">
      <div class="col-10">
        <div
          role="button"
          @click="
            () => {
              emit('tap', data);
            }
          "
        >
          <b>{{ data.Номенклатура.Артикул }}</b> {{ data.Номенклатура.Наименование }}
        </div>
        <div v-if="mode == 'НомХар' || mode == 'НомХарСер'">
          {{ data.Характеристика.Наименование }}
        </div>
        <div v-if="mode == 'НомХарСер'">{{ data.Серия.Наименование }}</div>
        <div>
          <b>ПЛУ : {{ data.ПЛУ }}</b>
        </div>
        <div>
          <b>к/к. {{ data.КоличествоКоробок }}</b>
        </div>
        <div>
          <b
            >тек {{ data.ТекущееКоличество }} кг / зак
            {{ data.имКоличествоВПересчетеНаКг }} кг</b
          >
        </div>
        <div>
          <b
            >тек {{ data.ТекущееКоличествоВЕдиницахИзмерения }}
            {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }} / зак
            {{ data.КоличествоУпаковок }}
            {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}</b
          >
        </div>
      </div>
      <div class="col-2">
        <div v-if="showProcent">
          <b>{{ data.ВПроцСоотношении }}%</b>
        </div>
        <!-- <div v-if="showProcent && isGroup">
          <b>{{ data.ВПроцСоотношении }}%</b>
        </div> -->
        <slot name="addButton"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { RowKeyMode } from "@/functions/GetGroupScans";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { computed } from "vue";

interface Props {
  data: IScaningGroup;
  mode: RowKeyMode;
  showProcent: boolean;
}

const isGroup = computed(() => isIScaningGroup(props.data));

const props = withDefaults(defineProps<Props>(), {
  mode: "НомХарСер",
  showProcent: true,
});
const emit = defineEmits(["tap"]);

function isIScaningGroup(obj: any): obj is IScaningGroup {
  return (
    obj &&
    typeof obj.ВПроцСоотношении === "number" &&
    typeof obj.КоличествоКоробок === "number" &&
    typeof obj.ТекущееКоличество === "number" &&
    typeof obj.имКоличествоВПересчетеНаКг === "number" &&
    typeof obj.ТекущееКоличествоВЕдиницахИзмерения === "number" &&
    typeof obj.КоличествоУпаковок === "number"
  );
  // Добавьте остальные проверки свойств и методов интерфейса
}

function getClass() {
  // if (isGroup.value) {
  //   return (props.data as IScaningGroup).cls;
  // }
  if (props.showProcent) {
    return (props.data as IScaningGroup).cls;
  }
  return "alert alert-info";
}
</script>
