<template>
  <div
    :class="data.Палетная + ' mb-1 p-1'"
    role="alert"
    :name="data.ID"
    :id="data.IDSec.toString()"
  >
    <table>
      <tr>
        <td>
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
            <b style="white-space: nowrap;">ПЛУ : {{ data.ПЛУ }}</b>
            <hr class="mt-1 mb-1" />
          </div>
          <div>
            {{ data.Характеристика.Наименование }}
          </div>
          <div>
            {{ data.Серия.Наименование }}
          </div>
          <!-- <div>
          <b>ПЛУ : {{ data.ПЛУ }}</b>
        </div> -->
          <div>
            <b>{{ Round(data.Количество, 3) }}</b> <b>кг</b> |
            <b
              ><span
                >{{ Round(data.КоличествоВЕдиницахИзмерения, 3) }}
                {{ data.ЕдиницаИзмерения }}</span
              ></b
            >
            | <b>{{ GetCountBox(data) }}</b> <b>кор</b>
          </div>
          <!-- <div>
          <b
            ><span
              >{{ Round(data.КоличествоВЕдиницахИзмерения, 3) }}
              {{ data.ЕдиницаИзмерения }}</span
            ></b
          >
        </div>
        <div>
          <b>{{ GetCountBox(data) }}</b> <b>кор</b>
        </div> -->
        </td>
        <td style="text-align: right; vertical-align: top">
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
        </td>
      </tr>
    </table>
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
