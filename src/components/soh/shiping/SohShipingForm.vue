<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h6 class="text-muted">СОХ Отгрузка: {{ docName }}: Форма</h6>

    <!-- <div class="row">
      <div class="col">
        <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />
      </div>
      <div class="col">
        <BootstrapSwitcher label="Инфо. лист" v-model:value="itInfoList" />
      </div>
    </div> -->

    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter"
      id="form_bc"
    />
    <SortWidget @tap="onSort" :scan-count="items.length" :box-count="boxCount" />

    <div class="space">
      <ScaningItem
        v-for="item in items"
        :key="item.ID"
        :data="item"
        @delete="itemDelete"
        @tap="filterByArticul(item)"
      />
    </div>
    <div class="row">
      <div class="col-12">
        <AddManualScaningButton @tap="addManualScaning" />

        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning text-uppercase fs-6"
            @click="closeWithConfirm"
          >
            <b>ЗАКРЫТЬ<br />ДОКУМЕНТ</b>
          </button>
          <button
            type="button"
            class="btn btn-primary text-uppercase fs-6"
            @click="clearCurrentScanings"
          >
            <b>ОЧИСТИТЬ</b>
          </button>
          <button
            type="button"
            class="btn btn-success text-uppercase fs-6"
            @click="goCheck()"
          >
            <b>ПРОВЕРИТЬ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <FilteredByArticulScreen :controller="filteredByArticulController" />
  <!-- Форма сканирования для приемки-->
</template>
<script setup lang="ts">
import AddManualScaningButton from "@/components/widgets/AddManualScaningButton.vue";
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import SortWidget from "@/components/widgets/SortWidget.vue";
import ScaningItem from "@/components/widgets/ScaningItem.vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { GetCount } from "@/functions/GetCount";
import { computed, Ref, ref, toRaw } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import { MainManager } from "@/classes/MainManager";
import { ScaningController } from "@/controllers/ScaningController";
import { RowKeyMode } from "@/functions/GetGroupScans";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { SohShipmentManager } from "@/managers/soh/SohShipmentManager";
import { ISohDocument } from "@/managers/soh/interfaces";
const currentManager = computed(() => SohShipmentManager.instance);
RoutingManager.instance.registry(RoutingManager.route.sohShipmentForm, show, close);

const scaningController: ScaningController = new ScaningController(currentManager.value);

const filteredByArticulController = new FilteredByArticulController(
  currentManager.value.currentScanings,
  ref("НомХарСер")
);

const items = currentManager.value.currentScanings;

const seen = ref(false);
const barcode = ref("");

const itPalet = ref(false);
const itInfoList = ref(false);

const docName = computed(() => {
  if (currentManager.value.currentDocument.value) {
    return currentManager.value.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});

const boxCount = computed(() =>
  GetCount(currentManager.value.currentScanings.value, "Грузоместа")
);

async function closeWithConfirm() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    currentManager.value.clear();
    RoutingManager.instance.pushName(RoutingManager.route.sohShipmentLoad);
  }
}

async function addManualScaning() {
  // HandAddItem.Show('prod_list')
  const result = await ScanerManager.showAddManualScaning();
  if (result) {
    onScan(result);
    barcode.value = "";
  }
}

function onSort(mode: OrderByType) {
  currentManager.value.currentScanings.value = GetListSortBy(
    currentManager.value.currentScanings.value,
    mode
  );
}

function filterByArticul(scaning: IScaning, mode: RowKeyMode = "НомХарСер") {
  filteredByArticulController.filter(scaning, mode);
  filteredByArticulController.show();
}

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

function goCheck() {
  RoutingManager.instance.pushName(RoutingManager.route.sohShipmentCheck);
}

function onEnter() {
  onScan(ScanerManager.instance.barcodeWrapper(barcode.value));
  barcode.value = "";
}

const validators = [isValidScaning];

async function onScan(barcode: string) {
  if (itInfoList.value) {
    itInfoList.value = false;
    const res = await MainManager.instance.local.infoSheet(barcode);
    if (!res) {
      NotificationManager.swal("Информационный лист не найден");
      return;
    }
    /// Загружаем сканирования из инфо листа
    /// ПРОВЕРКА НА ВАЛИДНОСТЬ ДАННЫХ В ТАКОМ СЛУЧАЕ НЕ ДЕЛАЕТСЯ!!!
    const oldScanings = currentManager.value.currentScanings.value.map((x) => toRaw(x));
    currentManager.value.setCurrentScanings([...res.data, ...oldScanings]);
    return;
  }

  const scan = await scaningController.getScaning(barcode, itPalet.value);
  if (scan) {
    /// Проверяем сканирование на бизнес условие
    for (const validator of validators) {
      const condition = await validator(scan);
      if (!condition) {
        return;
      }
    }

    if (itPalet.value) {
      itPalet.value = false;
    }

    currentManager.value.addScaning(scan);
    scaningController.isValidScaning(scan, currentManager.value.currentScanings.value);

    return;
  }
  NotificationManager.swal("Продукция с таким штрих кодом не найдена");
}

/// Проверяем сканирование перед добавлением в список сканирований
function isValidScaning(scan: IScaning): boolean {
  const prodDoc: ISohDocument = currentManager.value.currentDocument.value!;
  const inOrder =
    prodDoc.Товары.filter(
      (item) =>
        scan.Номенклатура.Наименование == item.Номенклатура.Наименование &&
        scan.Характеристика.Наименование == item.Характеристика.Наименование &&
        scan.Серия.Наименование == item.Серия.Наименование
    ).length > 0
      ? true
      : false;

  if (!inOrder) {
    //
    let text = `Продукции \n\n ${scan.Номенклатура.Наименование} ${scan.Характеристика.Наименование} ${scan.Серия.Наименование} ПЛУ: ${scan.ПЛУ} \n\n нет в заказе`;

    NotificationManager.swal(text);
    NotificationManager.instance.playError();
    return false;
  }
  return true;
}

async function clearCurrentScanings() {
  const result = await NotificationManager.showConfirm(
    "Вы действительно хотите удалить все текущие сканирования?"
  );
  if (result) {
    currentManager.value.clearCurrentScanings();
  }
}

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onScan(barcode.value);
  barcode.value = "";
});

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
      ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    currentManager.value.deleteScaning(item);
  }
}
</script>
