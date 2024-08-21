<template>
  <div :class="data.Палетная" role="alert" :name="data.ID" :id="data.IDSec.toString()">
    <div class="row">
      <div class="col-10">
        <div
          role="button"
          :class="'articul' + data.Артикул"
          @click="
            () => {
              emit('tap', data);
            }
          "
        >
          <b>{{ data.Номенклатура.Артикул }}</b> {{ data.Номенклатура.Наименование }}
        </div>
        <div>
          {{ data.Характеристика.Наименование }}
        </div>
        <div>
          {{ data.Серия.Наименование }}
        </div>
        <div>
          <b>ПЛУ : {{ data.ПЛУ }}</b>
        </div>
        <div>
          <b>{{ Round(data.Количество, 3) }}</b> <b>кг</b>
        </div>
        <div>
          <b
            ><span
              >{{ Round(data.КоличествоВЕдиницахИзмерения, 3) }}
              {{ data.ЕдиницаИзмерения }}</span
            ></b
          >
        </div>
        <div>
          <b>{{ GetCountBox(data) }}</b> <b>кор</b>
        </div>
      </div>
      <div class="col-2">
        <button
          type="button"
          class="btn btn-danger"
          @click="
            () => {
              emit('delete', data);
            }
          "
        >
          Х
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IScaning } from "@/interfaces/IScaning";
import { Round } from "@/functions/GetCount";

interface IProps {
  data: IScaning;
}
defineProps<IProps>();
const emit = defineEmits(["delete", "tap"]);

function GetCountBox(data: any) {
  return Math.max(
    data.Грузоместа ?? 0,
    data.ТекущееКоличествоГрузомест ?? 0,
    data.КоличествоКоробок ?? 0
  );
}
</script>
