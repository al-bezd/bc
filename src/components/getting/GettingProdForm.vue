<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <div class="row">
      <div class="col-12">
        <h5 class="text-muted">{{ docName }}</h5>
      </div>
      <!-- <div class="col-3">
        <h5>кол. {{ countScaning }}</h5>
        <h5>г/м. {{ boxCount }}</h5>
      </div> -->
    </div>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter"
      id="getting_prod_form_bc"
    />
    <SortWidget @tap="onSort" :scan-count="items.length" :box-count="boxCount" />

    <div class="space">
      <!--<div id="getting_prod_list"></div>-->
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
    <div class="navbar-fixed-bottom">
      <div class="col-12">
        <button
          class="btn btn-info btn-lg btn-block text-uppercase w-100 mb-3"
          @click="addManualScaning"
        >
          +
        </button>
        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning btn-lg text-uppercase fs-6"
            @click="closeWithConfirm"
          >
            <b>ЗАКРЫТЬ<br />ДОКУМЕНТ</b>
          </button>
          <button
            type="button"
            class="btn btn-primary btn-lg text-uppercase fs-6"
            @click="clearCurrentScanings"
          >
            <b>ОЧИСТИТЬ</b>
          </button>
          <button
            type="button"
            class="btn btn-success btn-lg text-uppercase fs-6"
            @click="goCheck()"
          >
            <b>ПРОВЕРИТЬ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Форма сканирования для приемки-->
  <FilteredByArticulScreen :controller="filteredByArticulController" />
</template>
<script setup lang="ts">
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import ScaningItem from "@/components/widgets/ScaningItem.vue";
import SortWidget from "@/components/widgets/SortWidget.vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { GetCount } from "@/functions/GetCount";
import { GettingManager } from "@/managers/getting/GettingManager";
import { computed, ref } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { ScaningController } from "@/controllers/ScaningController";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";

RoutingManager.instance.registry(RoutingManager.route.gettingProductionForm, show, close);
const scaningController: ScaningController = new ScaningController(
  GettingManager.instance
);
const filteredByArticulController = new FilteredByArticulController(
  GettingManager.instance.currentScanings,
  ref("НомХар")
);

const seen = ref(false);
const barcode = ref("");

const itPalet = ref(false);
const countScaning = computed(() => GettingManager.instance.currentScanings.value.length);
const docName = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});
const items = computed(() => {
  return GettingManager.instance.currentScanings.value;
});

const boxCount = computed(() =>
  GetCount(GettingManager.instance.currentScanings.value, "Грузоместа")
);

async function closeWithConfirm() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    GettingManager.instance.clear();
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionLoad);
  }
}
// Добавляем товар в ручном режиме
async function addManualScaning() {
  // HandAddItem.Show('prod_list')
  const result = await ScanerManager.showAddManualScaning();
  if (result) {
    onScan(result);
  }
}

function onSort(mode: OrderByType) {
  GettingManager.instance.currentScanings.value = GetListSortBy(
    GettingManager.instance.currentScanings.value,
    mode
  );
}

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

function goCheck() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionCheck);
}

function onEnter() {
  onScan(ScanerManager.instance.barcodeWrapper(barcode.value));
  barcode.value = "";
}

async function onScan(barcodeStr: string) {
  if (barcodeStr === "") {
    return false;
  }
  const scaning = await scaningController.getScaning(barcodeStr);
  if (!scaning) {
    return false;
  }
  if (checkScaningBeforeAdd(scaning)) {
    await GettingManager.instance.addScaning(scaning);
    scaningController.isValidScaning(
      scaning,
      GettingManager.instance.currentScanings.value
    );
    return true;
  }
  return false;
}

function checkScaningBeforeAdd(scan: IScaning): boolean {
  const prodDoc = GettingManager.instance.currentDocument.value!;
  const inOrder =
    prodDoc.Товары.filter(
      (item) =>
        scan.Номенклатура.Наименование == item.Номенклатура.Наименование &&
        scan.Характеристика.Наименование == item.Характеристика.Наименование
    ).length > 0
      ? true
      : false;

  const ЧтоЕсть = prodDoc.Товары.filter(
    (item) => scan.Номенклатура.Наименование == item.Номенклатура.Наименование
  );

  // in_order = in_order.length > 0 ? true : false

  if (!inOrder) {
    //
    let text = `Продукции \n\n ${scan.Номенклатура.Наименование} ${scan.Характеристика.Наименование} ПЛУ: ${scan.ПЛУ} \n\n нет в заказе`;
    if (ЧтоЕсть.length > 0) {
      text += `, нужна\n\n`;
      for (const i of ЧтоЕсть) {
        text += `${i.Номенклатура.Наименование} ${i.Характеристика.Наименование} ПЛУ: ${i.ПЛУ} \n\nили `;
      }
      text = text.substring(0, text.length - 3);
    } else {
      text;
    }
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
    GettingManager.instance.clearCurrentScanings();
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
    GettingManager.instance.deleteScaning(item);
  }
}
</script>
