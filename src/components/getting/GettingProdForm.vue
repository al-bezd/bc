<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-1" v-if="seen">
    <div class="row">
      <div class="col-12">
        <h6 class="text-muted">{{ docName }}</h6>
      </div>
      <!-- <div class="col-3">
        <h5>кол. {{ countScaning }}</h5>
        <h5>г/м. {{ boxCount }}</h5>
      </div> -->
    </div>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" />

    <div class="input-group mb-2">
      <input
        type="text"
        class="form-control bc_input mb-1"
        placeholder="Введите штрихкод"
        v-model="barcode"
        @keyup.enter="onEnter"
        id="getting_prod_form_bc"
      />
      <div class="input-group-prepend">
        <button class="btn btn-info text-uppercase w-100 mb-1" @click="addManualScaning">
          +
        </button>
      </div>
    </div>
    <SortWidget @tap="onSort" :scan-count="listForRender.length" :box-count="boxCount" />

    <div v-if="isScaningAdded" class="space">
      <ListWidget key-field="IDSec" :list="listForRender">
        <template #default="{ item }">
          <ScaningItem
            :data="item"
            :key="item.IDSec"
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
      <div class="col-12">Вес(ДОК/ФАКТ): {{ weightInDoc }} / {{ weightScans }}</div>
      <!-- <div class="col-6">Вес(ФАКТ): {{ weightScans }}</div> -->
    </div>
    <div class="row">
      <div class="col-12">
        <!-- <AddManualScaningButton @tap="addManualScaning" /> -->
        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning text-uppercase fs-6"
            @click="closeWithConfirm"
          >
            <b>ЗАКР</b>
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
            <b>ДАЛЕЕ</b>
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Форма сканирования для приемки-->
  <FilteredByArticulScreen
    :controller="filteredByArticulController"
    @delete="itemDelete"
  />
</template>
<script setup lang="ts">
import AddManualScaningButton from "@/components/widgets/AddManualScaningButton.vue";
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
import { computed, Ref, ref, toRaw } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { ScaningController } from "@/controllers/ScaningController";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import { IРеквизит } from "@/interfaces/IDocument";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { DB2Manager } from "@/classes/DB2Manager";
import { MainManager } from "@/classes/MainManager";
import { rounded } from "@/functions/rounded";
RoutingManager.instance.registry(RoutingManager.route.gettingProductionForm, show, close);
const scaningController: ScaningController = new ScaningController(
  GettingManager.instance
);

let timerId = -1;
const isScaningAdded = ref(false);

const listForRender: Ref<IScaning[]> = ref([]);

const filteredByArticulController = new FilteredByArticulController(
  listForRender,
  ref("НомХар")
);

const seen = ref(false);
const barcode = ref("");

const itPalet = ref(false);
const weightInDoc = ref(0);
const weightScans = computed(() => GetCount(listForRender.value, "Количество"));
const boxCount = computed(() => GetCount(listForRender.value, "Грузоместа"));
const docName = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});

async function closeWithConfirm() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    GettingManager.instance.clear();
    startRenderList();
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionLoad);
  }
}
// Добавляем товар в ручном режиме
async function addManualScaning() {
  // HandAddItem.Show('prod_list')
  const result = await ScanerManager.showAddManualScaning();
  if (result) {
    onScan(result).then(() => startRenderList());
  }
}

function onSort(mode: OrderByType) {
  listForRender.value = GetListSortBy(listForRender.value, mode);
}

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
  listForRender.value = [...GettingManager.instance.currentScanings.value];
  setTimeout(afterShow, 500);
}

function afterShow() {
  if (GettingManager.instance.currentDocument.value) {
    let res = 0;
    for (var i of GettingManager.instance.currentDocument.value?.Товары) {
      if (i.Номенклатура.ЕдиницаИзмерения.Наименование == "шт") {
        res += i.Количество * i.Номенклатура.ВесЧислитель;
      } else {
        res += i.Количество;
      }
    }
    weightInDoc.value = rounded(res, 3);
    // weightInDoc.value = GetCount(
    //   GettingManager.instance.currentDocument.value?.Товары,
    //   "Количество"
    // );
  }
  startRenderList();
}

function goCheck() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionCheck);
}

function onEnter() {
  onScan(ScanerManager.instance.barcodeWrapper(barcode.value)).then(() =>
    startRenderList()
  );
  barcode.value = "";
}

const validators = [
  isValidScaning,
  isWeightMoreWeightInChar,
  isWeightMoreWeightInDoc,
  isLentaTanderRule,
];

async function onScan(barcodeStr: string) {
  isScaningAdded.value = false;
  if (barcodeStr === "") {
    return false;
  }
  scaningController.itPalet = itPalet.value;
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

  await GettingManager.instance.addScaning(scaning);

  scaningController.isValidScaning(
    scaning,
    GettingManager.instance.currentScanings.value
  );
  scaningController.isWrongPaletScan(scaning, itPalet.value);
  // if (itPalet.value) {
  //   itPalet.value = false;
  // }
  return true;
}

/// Запрещаем добавлять сканирование если его добавление превысит вес сканирований по дкументу
async function isWeightMoreWeightInDoc(scan: IScaning): Promise<boolean> {
  if (scan.Количество + weightScans.value > weightInDoc.value * 1.2) {
    // NotificationManager.swal(
    //   `Вес приемки не должен превышать вес по документу ${weightInDoc.value}`
    // );
    NotificationManager.instance.playError();
    var answer = await NotificationManager.showConfirm(`Вес приемки не должен превышать вес по документу ${
      weightInDoc.value
    },\n
    Вы действительно хотите принять эту продукцию (текущий вес ${
      scan.Количество + weightScans.value
    } максимально возможный ${weightInDoc.value * 1.2})`);
    return answer;
  }
  return true;
}

/// уведомляем пользователя и блокируем сканирование если вес в сканировании больше веса в характеристике
async function isWeightMoreWeightInChar(scan: IScaning): Promise<boolean> {
  const res = scan.Характеристика.ДополнительныеРеквизиты.filter(
    (x: IРеквизит) => x.Свойство.Наименование === "Количество(хар)"
  );
  for (const i of res) {
    var maxWeight = i.Значение * 1.2;
    if (i.Значение != 1 && scan.Количество > maxWeight) {
      NotificationManager.instance.playError();
      var answer = await NotificationManager.showConfirm(
        `Вес в характеристике ${scan.Характеристика.Наименование}\n${i.Значение}(максимально доступный вес ${maxWeight}) больше чем вес в сканировании ${scan.Количество} Вы действительно хотите принять продукцию?`
      );

      // NotificationManager.swal(
      //   `Вес в характеристике ${scan.Характеристика.Наименование}\n${
      //     i.Значение
      //   }(максимально доступный вес ${i.Значение * 1.2}) больше чем вес в сканировании ${
      //     scan.Количество
      //   }`
      // );

      return answer;
    }
  }
  return true;
}

function isLentaTanderRule(scan: IScaning): boolean {
  const con1 =
    scan.Характеристика.Наименование.includes("(Лента)") ||
    scan.Характеристика.Наименование.includes("(Тандер)");

  const con2 = scan.Характеристика.ДополнительныеРеквизиты.filter(
    (x: IРеквизит) => x.Свойство.Наименование === "Количество(хар)"
  );
  if (con1 && con2.length && scan.Количество > con2[0].Значение * 1.2) {
    const text = `Вес в сканировании больше чем доступно в характеристике ${scan.Характеристика.Наименование} ${con2[0].Значение}\nвес в сканировании ${scan.Количество}`;
    // NotificationManager.swal(
    //   text
    // );
    // NotificationManager.instance.playError();
    NotificationManager.instance.playError();
    NotificationManager.showAlert(text);
    return false;
  }
  return true;
}

function isValidScaning(scan: IScaning): boolean {
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
    NotificationManager.instance.playError();
    NotificationManager.showAlert(text);
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
    GettingManager.instance.deleteScaning(item);
    startRenderList(() => {
      filteredByArticulController.emit("afterDelete");
    });
  }
}

function startRenderList(afterUpdateCallBack: (() => void) | undefined = undefined) {
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    isScaningAdded.value = true;
    listForRender.value = [...GettingManager.instance.currentScanings.value];
    DB2Manager.instance.getting!.putScanings(listForRender.value.map((x) => toRaw(x)));
    if (afterUpdateCallBack) {
      afterUpdateCallBack();
    }
  }, MainManager.instance.scaningSpeed.value);
}
</script>
