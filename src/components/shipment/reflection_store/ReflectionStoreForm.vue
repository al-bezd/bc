<template>
  <!-- Форма сканирования (без документа)-->
  <div class="reft_screen_form p-1" v-if="seen">
    <h6>{{ pageTitle }}</h6>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />

    <div class="input-group mb-2">
      <input
        type="text"
        class="form-control bc_input mb-1"
        placeholder="Введите штрихкод"
        v-model="barcode"
        @keyup.enter="onEnter()"
        id="form_doc_bc_free"
      />
      <div class="input-group-prepend">
        <button class="btn btn-info text-uppercase w-100 mb-1" @click="addManualScaning">
          +
        </button>
      </div>
    </div>
    <SortWidget :box-count="boxCount" :scan-count="listForRender.length" @tap="onSort" />

    <div v-if="isScaningAdded" class="space">
      <ListWidget key-field="IDSec" :list="listForRender">
        <template #default="{ item }">
          <ScaningItem
            :key="item.IDSec"
            :data="item"
            @delete="itemDelete"
            @tap="
              () => {
                filteredByArticulController.filter(item);
                filteredByArticulController.show();
              }
            "
          />
        </template>
      </ListWidget>
    </div>
    <div v-else class="space">
      Данные обрабатываются для отображения, продолжайте скаинрование
    </div>

    <div class="row">
      <div class="col-12">
        <!-- <AddManualScaningButton @tap="addManualScaning" /> -->

        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning text-uppercase fs-6"
            @click="closeWithQuest()"
          >
            <b>ЗАКР</b>
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
            <b>ПРОВ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <FilteredByArticulScreen
    :controller="filteredByArticulController"
    @delete="itemDelete"
  />
  <!-- Форма сканирования (без документа)-->
</template>
<script setup lang="ts">
import AddManualScaningButton from "@/components/widgets/AddManualScaningButton.vue";
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { computed, Ref, ref, toRaw } from "vue";
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import { IScaning } from "@/interfaces/IScaning";
import ScaningItem from "@/components/widgets/ScaningItem.vue";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import SortWidget from "@/components/widgets/SortWidget.vue";
import { ScaningController } from "@/controllers/ScaningController";
import { GetCount } from "@/functions/GetCount";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { DB2Manager } from "@/classes/DB2Manager";
import { MainManager } from "@/classes/MainManager";
//import { v4 } from "uuid";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentReflectionStoreForm,
  show,
  close
);
ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onEnter();
  barcode.value = "";
});
const scaningController: ScaningController = new ScaningController(
  ShipmentManager.instance,
  true
);

let timerId = -1;
const isScaningAdded = ref(false);
const listForRender: Ref<IScaning[]> = ref([]);

const filteredByArticulController = new FilteredByArticulController(
  listForRender,
  ref("НомХар")
);
const pageTitle = ref("Отражение остатков");
const seen = ref(false);
const itPalet = ref(false);
const barcode = ref("");

const boxCount = computed(() => {
  return GetCount(listForRender.value, "Грузоместа");
});

///Костыль для обновления скрола по нормальному список элементов не обновляется увы
//const scrollUpdater = ref(v4());

function show() {
  seen.value = true;
  listForRender.value = [...ShipmentManager.instance.currentScanings.value];
  startRenderList();
}

function close() {
  seen.value = false;
}

async function onEnter() {
  const resScan = await onScan(ScanerManager.instance.barcodeWrapper(barcode.value));
  startRenderList();
  if (resScan) {
    barcode.value = "";
  }
}

async function onScan(barcodeStr: string) {
  isScaningAdded.value = false;
  if (barcodeStr === "") {
    return false;
  }
  const scaning = await scaningController.getScaning(barcodeStr, itPalet.value);

  if (scaning) {
    scaning.free = true;

    await ShipmentManager.instance.addScaning(scaning);
    //$refs.scroller.refresh()
    //scrollUpdater.value = v4();
    scaningController.isValidScaning(
      scaning,
      ShipmentManager.instance.currentScanings.value
    );
    scaningController.isWrongPaletScan(scaning, itPalet.value);
    // if (itPalet.value) {
    //   itPalet.value = false;
    // }

    return true;
  }
  return false;
}

function goToCheck() {
  //check_doc_free.show(GetData('no_order_mode'))
  RoutingManager.instance.pushName(RoutingManager.route.shipmentReflectionStoreCheck);
}

function clear() {
  ShipmentManager.instance.clear();
  ShipmentManager.instance.emit("ReflectionStoreClear");
  startRenderList();
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
  listForRender.value = GetListSortBy(listForRender.value, mode);
}

async function closeWithQuest() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    clear();
    close();

    RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
  }
}
///Добавлляем сканирование в ручную
async function addManualScaning() {
  const result = await ScanerManager.showAddManualScaning();

  if (result) {
    onScan(result).then(() => startRenderList());
  }
}

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
      ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    ShipmentManager.instance.deleteScaning(item).then(() => {
      //scrollUpdater.value = v4();
      startRenderList(() => {
        filteredByArticulController.emit("afterDelete");
      });
    });
  }
}

function startRenderList(afterUpdateCallBack: (() => void) | undefined = undefined) {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    isScaningAdded.value = true;
    listForRender.value = [...ShipmentManager.instance.currentScanings.value];
    DB2Manager.instance.shiping!.putScanings(listForRender.value.map((x) => toRaw(x)));
    if (afterUpdateCallBack) {
      afterUpdateCallBack();
    }
  }, MainManager.instance.scaningSpeed.value);
}
</script>
