<template>
  <BootstrapModalWindow :seen="seen">
    <h6 v-if="!much">Введите штрихкод продукции</h6>

    <h6 v-else style="font-weight: bold">
      {{ Артикул }} {{ Номенклатура }} {{ Характеристика }} ПЛУ: {{ ПЛУ }}
    </h6>

    <input
      v-if="!much"
      type="text"
      class="form-control bc_input mb-1"
      placeholder="Введите штрихкод"
      v-model="ШК"
      @keyup.enter="onEnter"
      id="getting_prod_bc"
    />

    <div class="space">
      <div v-if="much" class="row">
        <div class="col-6">
          <label for="datab" class="control-label">Дата производства</label>
          <DatePicker id="datab" v-model:date="ДатаПроизводства" />
          <!-- <input type="date" class="form-control" id="datab" v-model="ДатаПроизводства" /> -->
        </div>
        <div class="col-6">
          <label for="datae" class="control-label">Годен до</label>
          <DatePicker id="datae" v-model:date="ГоденДо" />
          <!-- <input type="date" class="form-control" id="datae" v-model="ГоденДо" /> -->
        </div>
        <div class="col-6">
          <label for="Количество" class="control-label">Вес на коробке</label>
          <input
            type="number"
            step="0.001"
            class="form-control"
            id="Количество"
            v-model="Количество"
          />
        </div>
        <div class="col-6">
          <label for="ЕдиницаИзмерения" class="control-label">Единица измерения</label>
          <input
            type="text"
            class="form-control"
            id="ЕдиницаИзмерения"
            v-model="ЕдиницаИзмерения"
            readonly
            disabled
          />
        </div>
        <div class="col-12">
          <label for="КоличествоВЕдиницахИзмерения" class="control-label"
            >Количество в единицах измерения</label
          >
          <div class="input-group">
            <input
              type="number"
              step="1"
              v-if="ЕдиницаИзмерения === 'шт'"
              class="form-control"
              id="КоличествоВЕдиницахИзмерения"
              v-model="КоличествоВЕдиницахИзмерения"
            />
            <input
              type="number"
              step="0.001"
              v-if="ЕдиницаИзмерения !== 'шт'"
              class="form-control"
              id="КоличествоВЕдиницахИзмерения"
              v-model="КоличествоВЕдиницахИзмерения"
            />
            <div
              class="input-group-text"
              @click="КоличествоВЕдиницахИзмерения = Количество.toString()"
            >
              КП
            </div>
          </div>
        </div>
        <div class="form-group" v-if="false">
          <label for="Грузоместа" class="control-label">Количество коробок</label>
          <input
            type="number"
            class="form-control"
            id="Грузоместа"
            v-model="Грузоместа"
          />
        </div>
      </div>
    </div>

    <div class="btn-group w-100" role="group">
      <button type="button" class="btn btn-primary text-uppercase fs-6" @click="cancel">
        <b>Отмена</b>
      </button>
      <button
        v-if="much"
        type="button"
        class="btn btn-success text-uppercase fs-6"
        @click="accept"
      >
        <b>Сохранить</b>
      </button>
    </div>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
//import { DBManager } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { IScaning } from "@/interfaces/IScaning";
import { Ref, ref } from "vue";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import DatePicker from "@/components/widgets/DatePicker.vue";
import { getCurrentDateByDatePickerFormat } from "@/functions/GetCurrentDateByDatePickerFormat";
import { DB2Manager, IBarcode } from "@/classes/DB2Manager";

const seen = ref(false);
const much = ref(false);
const ШК = ref("");
const ШтрихкодПродукции = ref("");

const currentDate = getCurrentDateByDatePickerFormat();

const Номенклатура = ref("");
const Характеристика = ref("");
const Артикул = ref("");
const ПЛУ = ref("");

const ДатаПроизводства = ref(currentDate);
const ГоденДо = ref(currentDate);
const Количество = ref(0);
const ЕдиницаИзмерения = ref("шт");
const КоличествоВЕдиницахИзмерения = ref("0");
const Грузоместа = ref(0);

let callback: (state: string | null) => void;

ScanerManager.instance.connect("showAddManualScaningForm", (data) => {
  callback = data[0];
  show();
});

ScanerManager.instance.connect("showAddManualScaningForm:object", (data) => {
  const scaning: IScaning = data[1];
  //console.log("scaning ", scaning);

  Номенклатура.value = scaning.Номенклатура.Наименование;
  Характеристика.value = scaning.Характеристика.Наименование;
  ЕдиницаИзмерения.value = scaning.Номенклатура.ЕдиницаИзмерения.Наименование;
  Артикул.value = scaning.Артикул;
  Грузоместа.value = 1;
  //Палетная.value = "row alert alert-info"
  if (!scaning.ШтрихкодПродукции) {
    throw "ШтрихкодПродукции не заполнен";
  }
  ШтрихкодПродукции.value = scaning.ШтрихкодПродукции;

  ПЛУ.value = scaning.ПЛУ;
  if (ЕдиницаИзмерения.value === "шт") {
    КоличествоВЕдиницахИзмерения.value = scaning.КоличествоВЕдиницахИзмерения.toFixed(2);
  }
  much.value = true;

  callback = data[0];
  show();
});

function show() {
  seen.value = true;
}

function close() {
  clear();
  seen.value = false;
}

async function onEnter() {
  //barcodeHasEntered.value = true;
  ШтрихкодПродукции.value = ШК.value.slice(2, 16);
  const dbResponse: IBarcode | undefined = await DB2Manager.instance.barcodes!.get(
    ШтрихкодПродукции.value
  );
  if (!dbResponse) {
    NotificationManager.swal("Продукция с таким штрих кодом не найдена");
    ШК.value = "";
    return;
  }
  //СтруктураШК.value = dbResponse.data;
  much.value = true; // Если true то скрывает элементы на форме
  Номенклатура.value = dbResponse.Ссылка.Номенклатура.Наименование;
  Характеристика.value = dbResponse.Ссылка.Характеристика.Наименование;
  Артикул.value = dbResponse.Ссылка.Номенклатура.Артикул;
  ЕдиницаИзмерения.value = dbResponse.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование;
  ПЛУ.value = dbResponse.Ссылка.ПЛУ;
  //Объект.value = dbResponse.data.Ссылка;
}

function clear() {
  much.value = false; // Если true то скрывает элементы на форме
  Номенклатура.value = "";
  Характеристика.value = "";
  Артикул.value = "";
  ЕдиницаИзмерения.value = "";
  ПЛУ.value = "";
  //Объект.value           = ""
  ШК.value = "";
  ДатаПроизводства.value = currentDate;
  ГоденДо.value = currentDate;
  Количество.value = 0;
  КоличествоВЕдиницахИзмерения.value = "";
  Грузоместа.value = 0;
  ЕдиницаИзмерения.value = "";
}

function cancel() {
  callback(null);
  close();
}

function accept() {
  if (Количество.value <= 0) {
    NotificationManager.error("Вес не может быть равен 0 или меньше");
    return;
  } else if (КоличествоВЕдиницахИзмерения.value === "") {
    NotificationManager.error("КоличествоВЕдиницахИзмерения должно быть заполнено");
  }
  //ДатаПроизводства.value = ДатаПроизводства.value.replace(/-/gi, "").slice(2, 8); // Подгоняем дату под формат ШК
  //ГоденДо.value = ГоденДо.value.replace(/-/gi, "").slice(2, 8); // Подгоняем дату под формат ШК

  if (("" + КоличествоВЕдиницахИзмерения.value).length === 1) {
    КоличествоВЕдиницахИзмерения.value = "00" + КоличествоВЕдиницахИзмерения.value;
  } else if (("" + КоличествоВЕдиницахИзмерения.value).length === 2) {
    КоличествоВЕдиницахИзмерения.value = "0" + КоличествоВЕдиницахИзмерения.value;
  }

  //if((""+Грузоместа).length === 1){
  //  Грузоместа = "00"+Грузоместа
  //}else if((""+Грузоместа).length === 2){
  //  Грузоместа = "0"+Грузоместа
  //}

  var Кол = (Количество.value / 100).toFixed(5).replace(".", "").replace(",", "");

  const КастомныйШК = `01${ШтрихкодПродукции.value}3103${Кол}11${
    ДатаПроизводства.value
  }17${ГоденДо.value}10${"001"}37${КоличествоВЕдиницахИзмерения.value}91001`;

  callback(КастомныйШК);
  close();
  //СтруктураШК;
  //   if (form === "form_doc") {
  //     form_doc.barcode = КастомныйШК;
  //     form_doc.scaning();
  //   }
  //   if (form === "form_doc_free") {
  //     form_doc_free.barcode = КастомныйШК;
  //     form_doc_free.scaning();
  //   }
  //   if (form === "prod_list") {
  //     getting_prod_form.barcode = КастомныйШК;
  //     getting_prod_form.scaning();
  //   }
}
</script>
import { getCurrentDateByDatePickerFormat } from
"@/functions/GetCurrentDateByDatePickerFormat";
