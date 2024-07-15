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
          <b>{{ data.Количество }}</b> <b>кг.</b>
        </div>
        <div>
          <b>{{ data.КоличествоВЕдиницахИзмерения }} </b>
          <b>{{ data.ЕдиницаИзмерения }}.</b>
        </div>
        <div>
          <b>{{ data.Грузоместа }}</b> <b>кор.</b>
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

interface IProps {
  data: IScaning;
}
defineProps<IProps>();
const emit = defineEmits(["delete", "tap"]);
//delete_scaning_quest_jquery({"id":String(${response.IDSec}),"free":${response.free}})
</script>
