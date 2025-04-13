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
          <table class="w-100" style="table-layout: fixed; width: 100%">
            <tr>
              <td><b>к/к.</b></td>
              <td>
                <span v-if="showOrder && data.ЗаказанноеКоличествоГрузомест">{{
                  data.ЗаказанноеКоличествоГрузомест
                }}</span>
              </td>
              <td>{{ data.ТекущееКоличествоГрузомест }}</td>
            </tr>
            <tr>
              <td><b>кг</b></td>
              <td>
                <span v-if="showOrder && data.ЗаказанноеКоличество">{{
                  Round(data.ЗаказанноеКоличество, 3)
                }}</span>
              </td>
              <td>
                {{ Round(data.ТекущееКоличество, 3) }}
              </td>
            </tr>
            <tr v-if="'кг' != data.Номенклатура.ЕдиницаИзмерения.Наименование">
              <td>
                <b>{{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}</b>
              </td>
              <td>
                <span v-if="showOrder && data.ЗаказанноеКоличествоВЕдиницахИзмерения">{{
                  Round(data.ЗаказанноеКоличествоВЕдиницахИзмерения, 3)
                }}</span>
              </td>
              <td>
                {{ Round(data.ТекущееКоличествоВЕдиницахИзмерения, 3) }}
              </td>
            </tr>
          </table>
          <!-- <div>
            <b>к/к. {{ data.КоличествоКоробок }}</b>
          </div>
          <div>
            <b
              ><span> В КГ {{ Round(data.ТекущееКоличество, 3) }} кг </span>
              <span v-if="data.имКоличествоВПересчетеНаКг"
                >/ зак {{ Round(data.имКоличествоВПересчетеНаКг, 3) }} кг</span
              ></b
            >
          </div>
          <div>
            <b
              >В ЕД. ИЗМ {{ Round(data.ТекущееКоличествоВЕдиницахИзмерения, 3) }}
              {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}
              <span v-if="data.имКоличествоВПересчетеНаКг"
                >/ зак
                {{ Round(data.КоличествоУпаковок, 3) }}
                {{ data.Номенклатура.ЕдиницаИзмерения.Наименование }}</span
              ></b
            >
          </div> -->
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
//import { computed } from "vue";
import { Round } from "@/functions/GetCount";

interface Props {
  data: IScaningGroup;
  mode: RowKeyMode;
  showProcent: boolean;
  showOrder: boolean;
}

//const isGroup = computed(() => isIScaningGroup(props.data));

const props = withDefaults(defineProps<Props>(), {
  mode: "НомХарСер",
  showProcent: true,
  showOrder: true,
});
const emit = defineEmits(["tap"]);

// function isIScaningGroup(obj: any): obj is IScaningGroup {
//   return (
//     obj &&
//     typeof obj.ВПроцСоотношении === "number" &&
//     typeof obj.КоличествоКоробок === "number" &&
//     typeof obj.ТекущееКоличество === "number" &&
//     typeof obj.имКоличествоВПересчетеНаКг === "number" &&
//     typeof obj.ТекущееКоличествоВЕдиницахИзмерения === "number" &&
//     typeof obj.КоличествоУпаковок === "number"
//   );
//   // Добавьте остальные проверки свойств и методов интерфейса
// }

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
