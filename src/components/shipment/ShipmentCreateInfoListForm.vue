<template>
  <!-- Форма сканирования (без документа)-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Создание Инфо. листа</h4>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onScan(barcode)"
      id="form_doc_bc_free"
    />
    <div class="btn-group w-100 mb-3" role="group">
      <button class="btn btn-primary text-uppercase" @click="OrderBy('Артикул')">
        по Артикулу
      </button>
      <button class="btn btn-primary text-uppercase" @click="OrderBy('История')">
        по Истории
      </button>
      <button disabled class="btn btn-primary text-uppercase">
        Кол.кор {{ boxCount }}
      </button>
    </div>
    <div class="space">
      <ShipmentCreateInfoListItem
        v-for="item in items"
        :key="item.ID"
        :data="item"
        @delete="itemDelete"
      />
    </div>

    <div class="row">
      <div class="col-12">
        <button
          class="btn btn-info btn-lg btn-block mb-3 w-100"
          @click="addManualScaning"
        >
          +
        </button>
        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning btn-lg text-uppercase fs-6"
            @click="closeWithQuest()"
          >
            <b>ЗАКРЫТЬ</b>
          </button>
          <button
            type="button"
            class="btn btn-primary btn-lg text-uppercase fs-6"
            @click="clearWithQuest()"
          >
            <b>ОЧИСТИТЬ</b>
          </button>

          <button
            type="button"
            class="btn btn-success btn-lg text-uppercase fs-6"
            attr="check"
            @click="goToCheck()"
          >
            <b>ПРОВЕРИТЬ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Форма сканирования (без документа)-->
</template>
<script setup lang="ts">
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { computed, ref } from "vue";
import BootstrapSwitcher from "../widgets/BootstrapSwitcher.vue";
import { IScaning } from "@/interfaces/IScaning";
import { UserManager } from "@/managers/user/UserManager";
import { DBManager } from "@/classes/DBManager";
import { HttpManager } from "@/classes/HttpManager";
import { FindGM } from "@/functions/FindGruzoMesta";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { Date1C } from "@/functions/Date1C";
import ShipmentCreateInfoListItem from "@/components/shipment/widgets/ShipmentCreateInfoListItem.vue";
import { OrderBy as orderBy } from "@/functions/OrderBy";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentCreateInfoListForm,
  show,
  close
);

const seen = ref(false);
const itPalet = ref(false);
const barcode = ref("");
const items = ShipmentManager.instance.currentScanings;
const boxCount = computed(() => {
  return ShipmentManager.instance.currentScanings.value.reduce(
    (sum, scan) => sum + scan.Грузоместа,
    0
  );
});

function show() {
  seen.value = true;
}

function close() {
  seen.value = false;
}

async function createScaning(barcode: string): Promise<IScaning | null> {
  const Штрихкод = barcode.slice(2, 16);
  const Количество = Number(barcode.slice(20, 26)) / 1000;
  const ДатаПроизводства = barcode.slice(28, 34);
  const ГоденДо = barcode.slice(36, 42);

  const Структура = {
    Штрихкод: Штрихкод,
    Количество: Количество,
    ДатаПроизводства: ДатаПроизводства,
    ГоденДо: ГоденДо,
  };
  if (UserManager.instance.useLocalDb) {
    const barcodeFromDB = await DBManager.getFileAsync(
      Структура.Штрихкод,
      "barcodes",
      "barcodes"
    );
    if (barcodeFromDB) {
      barcodeFromDB.data.Штрихкод = Структура.Штрихкод;
      barcodeFromDB.data.bc = barcode;
      return CheckScaningFREE(
        barcodeFromDB.data,
        Структура.Количество,
        Структура.ДатаПроизводства,
        Структура.ГоденДо
      );
    } else {
      NotificationManager.swal("Продукция с таким штрих кодом не найдена");
      return null;
    }
  } else {
    const params = {
      barcode: barcode,
      free: true,
    };
    const response = await HttpManager.get("/scaning_barcode", params);
    if (response.success) {
      if (response.data.РезультатПроверки) {
        let СтруктураШК = { Ссылка: response.data, bc: Штрихкод };
        return CheckScaningFREE(СтруктураШК, Количество, ДатаПроизводства, ГоденДо);
      } else {
        NotificationManager.error(response.data.Текст);
        NotificationManager.instance.playError();
      }
      return null;
    }
    NotificationManager.error(String(response.error));
  }
  return null;
}

async function onScan(barcode: string) {
  if (barcode === "") {
    return;
  }
  const scaning = await createScaning(barcode);
  if (scaning) {
    await ShipmentManager.instance.addScaning(scaning);
    isValidScaning(scaning, ShipmentManager.instance.currentScanings.value);
  }
}

function isValidScaning(scaning: IScaning, scanings: IScaning[]) {
  if (scanings.length > 1) {
    if (scanings[1].bc === scaning.bc) {
      NotificationManager.instance.playRepeatArial();
      return;
    }
  }
  NotificationManager.instance.playGood();
}

function CheckScaningFREE(
  СтруктураШК: any,
  Количество: number,
  ДатаПроизводства: string,
  ГоденДо: string
): IScaning {
  const bc = СтруктураШК.bc;
  let Грузоместа = 1;
  let Палетная = "alert alert-info";

  if (itPalet.value == true) {
    Грузоместа = FindGM(СтруктураШК.bc);
    Палетная = "alert alert-warning";
  }
  let КоличествоВЕдиницахИзмерения = GetCountFromBarcode(
    СтруктураШК,
    Грузоместа,
    Количество
  );

  let response: IScaning = {
    ID: "",
    Номенклатура: СтруктураШК.Ссылка.Номенклатура,
    Характеристика: СтруктураШК.Ссылка.Характеристика,
    ПЛУ: СтруктураШК.Ссылка.ПЛУ === undefined ? "" : СтруктураШК.Ссылка.ПЛУ,
    Серия: {
      Наименование: Date1C(ДатаПроизводства, ГоденДо),
      Ссылка: `${ДатаПроизводства}${ГоденДо}`,
    },
    Количество: Количество,
    КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
    ЕдиницаИзмерения: СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
    Артикул: СтруктураШК.Ссылка.Номенклатура.Артикул,
    Грузоместа: Грузоместа,
    Палетная: Палетная,
    bc: bc,
    IDSec: Date.now(),
    free: true,
  };

  //self.scaningN += 1;

  return response;
  //response.scaningN = self.scaningN_free;
  //scaning_response_free.unshift(response);

  // SetData("scaningN_free", self.scaningN);
  // SetData("scaning_response_free", scaning_response_free);

  // $("#scaning_response_list_free").prepend(FillTemplate(response));
  // form_doc_free.count_scaning = scaning_response_free.length;
}

function goToCheck() {
  //check_doc_free.show(GetData('no_order_mode'))
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCreateInfoListCheck);
}

function clear() {
  ShipmentManager.instance.clear();
}

async function clearWithQuest() {
  const res = await NotificationManager.showConfirm(
    "Вы действительно хотите очистить сканирования"
  );
  if (res) {
    clear();
  }
}

function OrderBy(mode: string) {
  ShipmentManager.instance.currentScanings.value = orderBy(
    ShipmentManager.instance.currentScanings.value,
    mode
  );
}

async function closeWithQuest() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    //close()
    clear();

    RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
  }
}
///Добавлляем сканирование в ручную
async function addManualScaning() {
  const result = await ScanerManager.showAddManualScaningForm();

  if (result) {
    onScan(result);
  }
}

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
    ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    ShipmentManager.instance.deleteScaning(item);
  }
}
</script>
