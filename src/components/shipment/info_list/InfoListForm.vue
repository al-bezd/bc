<template>
  <!-- Форма сканирования (без документа)-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>{{ pageTitle }}</h4>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter()"
      id="form_doc_bc_free"
    />
    <SortWidget :box-count="boxCount" :scan-count="items.length" @tap="onSort" />

    <div class="space">
      <ScaningItem
        v-for="item in items"
        :key="item.ID"
        :data="item"
        @delete="itemDelete"
        @tap="
          () => {
            filteredByArticulController.filter(item);
            filteredByArticulController.show();
          }
        "
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
            class="btn btn-warning text-uppercase fs-6"
            @click="closeWithQuest()"
          >
            <b>ЗАКРЫТЬ</b>
          </button>
          <button
            type="button"
            class="btn btn-primary text-uppercase fs-6"
            @click="clearWithQuest()"
          >
            <b>ОЧИСТИТЬ</b>
          </button>

          <button
            type="button"
            class="btn btn-success text-uppercase fs-6"
            attr="check"
            @click="goToCheck()"
          >
            <b>ПРОВЕРИТЬ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <FilteredByArticulScreen :controller="filteredByArticulController" />
  <!-- Форма сканирования (без документа)-->
</template>
<script setup lang="ts">
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { computed, ref } from "vue";
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import { IScaning } from "@/interfaces/IScaning";
import ScaningItem from "@/components/widgets/ScaningItem.vue";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import SortWidget from "@/components/widgets/SortWidget.vue";
import { ScaningController } from "@/controllers/ScaningController";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentCreateInfoListForm,
  show,
  close
);
const scaningController: ScaningController = new ScaningController(
  ShipmentManager.instance,
  true
);

const filteredByArticulController: FilteredByArticulController = new FilteredByArticulController(
  ShipmentManager.instance.currentScanings,
  ref("НомХар")
);

const pageTitle = ref("Создание Инфо. листа");
const seen = ref(false);
const itPalet = ref(false);
const barcode = ref("");
const items = ShipmentManager.instance.currentScanings;

/// Валидаторы сканирования
const validators: ((scan: IScaning) => boolean)[] = [isPaletScan];

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

async function onEnter() {
  const resScan = await onScan(barcode.value);
  if (resScan) {
    barcode.value = "";
  }
}

async function onScan(barcodeStr: string) {
  if (barcodeStr === "") {
    return false;
  }
  const scaning = await scaningController.getScaning(barcodeStr, itPalet.value);
  if (!scaning) {
    return false;
  }
  /// Проверяем сканирование на бизнес условие
  for (const validator of validators) {
    const condition = await validator(scaning);
    if (!condition) {
      return false;
    }
  }

  if (itPalet.value) {
    itPalet.value = false;
  }
  await ShipmentManager.instance.addScaning(scaning);
  scaningController.isValidScaning(
    scaning,
    ShipmentManager.instance.currentScanings.value
  );
  return true;
}

/// уведомляем пользователя если он случайно отсканировал палетную этикетку
function isPaletScan(scan: IScaning): boolean {
  if (!itPalet.value && scan.itPalet) {
    NotificationManager.swal(
      `Данное сканирование является сканированием палетной этикетки`
    );
    NotificationManager.instance.playError();
  }
  return true;
}

function goToCheck() {
  //check_doc_free.show(GetData('no_order_mode'))
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCreateInfoListCheck);
}

function clear() {
  ShipmentManager.instance.clear();
  ShipmentManager.instance.emit("InfoListClear");
}

async function clearWithQuest() {
  const res = await NotificationManager.showConfirm(
    "Вы действительно хотите очистить сканирования"
  );
  if (res) {
    clear();
  }
}

function onSort(mode: OrderByType) {
  ShipmentManager.instance.currentScanings.value = GetListSortBy(
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
  const result = await ScanerManager.showAddManualScaning();

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
