<template>
  <div
    :class="getClass() + ' bs-callout bs-callout-danger' + ' mb-1 p-1'"
    :name="'check' + data.Номенклатура.Наименование"
  >
    <table>
      <tr>
        <td>
          <div
            role="button"
            @click="
              () => {
                emit('tap', data);
              }
            "
          >
            <b>{{ data.Номенклатура.Артикул }}</b> {{ data.Номенклатура.Наименование }}
            <b style="white-space: nowrap">ПЛУ : {{ data.ПЛУ }}</b>
            <hr class="mt-1 mb-1" />
          </div>
          <div v-if="mode == 'НомХар' || mode == 'НомХарСер'">
            {{ data.Характеристика.Наименование }}
          </div>
          <div v-if="mode == 'НомХарСер'">{{ data.Серия.Наименование }}</div>
          <!-- <div>
            <b>ПЛУ : {{ data.ПЛУ }}</b>
          </div> -->
          <div>
            <b>к/к. {{ data.КоличествоКоробок }}</b>
          </div>
          <div>
            <b
              ><span> тек {{ Round(data.ТекущееКоличество, 3) }} кг </span>
              <span v-if="data.имКоличествоВПересчетеНаКг"
                >/ зак {{ Round(data.имКоличествоВПересчетеНаКг, 3) }} кг</span
              ></b
            >
          </div>
          <div>
            <b
              >тек {{ Round(data.ТекущееКоличествоВЕдиницахИзмерения, 3) }}
              {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }} / зак
              {{ Round(data.КоличествоУпаковок, 3) }}
              {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}</b
            >
          </div>
        </td>
        <td style="text-align: right; vertical-align: top">
          <div v-if="showProcent">
            <b>{{ data.ВПроцСоотношении }}%</b>
          </div>
          <!-- <div v-if="showProcent && isGroup">
          <b>{{ data.ВПроцСоотношении }}%</b>
        </div> -->
          <slot name="addButton"></slot>
        </td>
      </tr>
    </table>
  </div>
</template>
<script setup lang="ts">
import { RowKeyMode } from "@/functions/GetGroupScans";
import { IScaningGroup } from "@/interfaces/IScaning";
import { computed } from "vue";
import { Round } from "@/functions/GetCount";

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
