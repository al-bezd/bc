<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-3" v-if="seen">
    <h5 class="text-muted">{{ docName }}</h5>

    <div class="row">
      <div class="col">
        <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />
      </div>
      <div class="col">
        <BootstrapSwitcher label="Инфо. лист" v-model:value="itInfoList" />
      </div>
    </div>

    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter"
      id="form_bc"
    />
    <SortWidget @tap="onSort" :scan-count="listForRender.length" :box-count="boxCount" />

    <div class="space">
      <ListWidget key-field="IDSec" :list="listForRender">
        <template #default="{ item }">
          <ScaningItem
            :key="item.IDSec"
            :data="item"
            @delete="itemDelete"
            @tap="filterByArticul(item)"
          />
        </template>
      </ListWidget>
      <!-- <DynamicScroller
        :key="listForRender.length"
        class="scroller"
        :min-item-size="240"
        :items="listForRender"
        key-field="IDSec"
      >
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
            :key="item.IDSec"
            :item="item"
            :active="active"
            :size-dependencies="[
              item.Номенклатура.Наименование,
              item.Характеристика.Наименование,
              item.Серия.Наименование,
            ]"
            :data-index="index"
          >
            <ScaningItem
              :key="item.IDSec"
              :data="item"
              @delete="itemDelete"
              @tap="filterByArticul(item)"
            />
            <div style="min-height: 1px"></div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller> -->
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
            <b>ЗАКР<br />ДОК</b>
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
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import { MainManager } from "@/classes/MainManager";
import { IShipmentDocument } from "@/managers/shipment/interfaces";
import { ScaningController } from "@/controllers/ScaningController";
import { RowKeyMode } from "@/functions/GetGroupScans";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import { UserManager } from "@/managers/user/UserManager";
import { formatDate, GetOstDate } from "@/functions/GetOstDate";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { DB2Manager } from "@/classes/DB2Manager";

RoutingManager.instance.registry(RoutingManager.route.shipmentForm, show, close);
let timerId = -1;
let scaningSpeed = 500;
const listForRender: Ref<IScaning[]> = ref([]);

const scaningController: ScaningController = new ScaningController(
  ShipmentManager.instance
);

const filteredByArticulController = new FilteredByArticulController(
  listForRender,
  ref("НомХар")
);

const seen = ref(false);
const barcode = ref("");

const itPalet = ref(false);
const itInfoList = ref(false);

const docName = computed(() => {
  if (ShipmentManager.instance.currentDocument.value) {
    return ShipmentManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});

const boxCount = computed(() => GetCount(listForRender.value, "Грузоместа"));

async function closeWithConfirm() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    ShipmentManager.instance.clear();
    startRenderList();
    RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
  }
}

async function addManualScaning() {
  // HandAddItem.Show('prod_list')
  const result = await ScanerManager.showAddManualScaning();
  if (result) {
    onScan(result).then(() => startRenderList());
    barcode.value = "";
  }
}

function onSort(mode: OrderByType) {
  listForRender.value = GetListSortBy(listForRender.value, mode);
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
  startRenderList();
}

function goCheck() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCheck);
}

function onEnter() {
  onScan(ScanerManager.instance.barcodeWrapper(barcode.value)).then(() =>
    startRenderList()
  );
  barcode.value = "";
}

const validators = [isValidScaning, isValidFutureProduct, isValidOstSrokGodnosti];

async function onScan(barcode: string) {
  if (itInfoList.value) {
    //itInfoList.value = false;
    const res = await MainManager.instance.local.infoSheet(barcode);
    if (!res) {
      NotificationManager.swal("Информационный лист не найден");
      return;
    }
    /// Загружаем сканирования из инфо листа
    /// ПРОВЕРКА НА ВАЛИДНОСТЬ ДАННЫХ В ТАКОМ СЛУЧАЕ НЕ ДЕЛАЕТСЯ!!!
    const oldScanings = ShipmentManager.instance.currentScanings.value.map((x) =>
      toRaw(x)
    );
    ShipmentManager.instance.setCurrentScanings([...res.data, ...oldScanings]);

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

    ShipmentManager.instance.addScaning(scan);

    scaningController.isValidScaning(
      scan,
      ShipmentManager.instance.currentScanings.value
    );
    scaningController.isWrongPaletScan(scan, itPalet.value);
    if (itPalet.value) {
      itPalet.value = false;
    }
    return;
  }
  NotificationManager.swal("Продукция с таким штрих кодом не найдена");
}

/// Проверяем сканирование перед добавлением в список сканирований
function isValidScaning(scan: IScaning): boolean {
  const prodDoc: IShipmentDocument = ShipmentManager.instance.currentDocument.value!;
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

/// Проверка продукции из будущего
function isValidFutureProduct(scan: IScaning): boolean {
  if (UserManager.instance.controlFutureDate.value) {
    const date = new Date();
    const bdate = new Date(
      Number("20" + scan.Серия.ДатаПроизводства.slice(0, 2)),
      Number(scan.Серия.ДатаПроизводства.slice(2, 4)) - 1,
      Number(scan.Серия.ДатаПроизводства.slice(4, 6))
    );
    if (bdate > date) {
      const future_date = bdate.toLocaleDateString();
      const current_date = date.toLocaleDateString();
      NotificationManager.error(
        `Текущая дата ${current_date},\n дата производства на коробке ${future_date} коробка из будущего \nСКАНИРОВАНИЕ НЕ ДОБАВЛЕНО`
      );

      return false;
    }
  }
  return true;
}

/// Проверка остаточного срока годности
async function isValidOstSrokGodnosti(scan: IScaning): Promise<boolean> {
  const curDoc = ShipmentManager.instance.currentDocument.value!;
  const date = new Date("1970.01.01");
  date.setSeconds(GetOstDate(curDoc.Товары, scan.Номенклатура, scan.Характеристика));
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  const condition =
    new Date(
      `20${scan.Серия.ДатаПроизводства.slice(0, 2)}.${scan.Серия.ДатаПроизводства.slice(
        2,
        4
      )}.${scan.Серия.ДатаПроизводства.slice(4, 6)}`
    ) <= date;

  if (condition) {
    const quest = `Нарушение остаточного срока годности, отгрузить не позднее ${formatDate(
      date
    )} вы точно хотите отгрузить данную продукцию?`;
    const answer = await NotificationManager.showConfirm(quest);
    return answer;
  }
  return true;
}

async function clearCurrentScanings() {
  const result = await NotificationManager.showConfirm(
    "Вы действительно хотите удалить все текущие сканирования?"
  );
  if (result) {
    ShipmentManager.instance.clearCurrentScanings();
    startRenderList();
  }
}

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onScan(barcode.value).then(() => startRenderList());
  barcode.value = "";
});

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
      ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    ShipmentManager.instance.deleteScaning(item).then(() => {
      startRenderList(() => {
        filteredByArticulController.emit("afterDelete");
      });
    });
  }
}

function startRenderList(afterUpdateCallBack: (() => void) | undefined = undefined) {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    listForRender.value = [...ShipmentManager.instance.currentScanings.value];
    DB2Manager.instance.shiping!.putScanings(listForRender.value.map((x) => toRaw(x)));
    if (afterUpdateCallBack) {
      afterUpdateCallBack();
    }
  }, scaningSpeed);
}
</script>
