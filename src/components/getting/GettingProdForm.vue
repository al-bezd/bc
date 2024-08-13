<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-3" v-if="seen">
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
      <RecycleScroller class="scroller" :items="items" :item-size="280" key-field="IDSec">
        <template #default="{ item }"
          ><ScaningItem
            :data="item"
            :key="item.IDSec"
            @delete="itemDelete"
            @tap="
              () => {
                filteredByArticulController.filter(item);
                filteredByArticulController.show();
              }
            "
        /></template>
      </RecycleScroller>
    </div>
    <div class="row">
      <div class="col-6">Вес(ДОК): {{ weightInDoc }}</div>
      <div class="col-6">Вес(ФАКТ): {{ weightScans }}</div>
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
  <!-- Форма сканирования для приемки-->
  <FilteredByArticulScreen :controller="filteredByArticulController" />
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
import { computed, ref } from "vue";
import { IScaning } from "@/interfaces/IScaning";
import { ScaningController } from "@/controllers/ScaningController";
import { GetListSortBy, OrderByType } from "@/functions/OrderBy";
import { IРеквизит } from "@/interfaces/IDocument";

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
const weightInDoc = ref(0);
const weightScans = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Количество");
});
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
  setTimeout(afterShow, 500);
}

function afterShow() {
  if (GettingManager.instance.currentDocument.value) {
    weightInDoc.value = GetCount(
      GettingManager.instance.currentDocument.value?.Товары,
      "Количество"
    );
  }
}

function goCheck() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionCheck);
}

function onEnter() {
  onScan(ScanerManager.instance.barcodeWrapper(barcode.value));
  barcode.value = "";
}

const validators = [
  isValidScaning,
  isWeightMoreWeightInChar,
  isWeightMoreWeightInDoc,
  isLentaTanderRule,
];

async function onScan(barcodeStr: string) {
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
  if (itPalet.value) {
    itPalet.value = false;
  }
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
    if (scan.Количество > i.Значение * 1.2) {
      NotificationManager.instance.playError();
      var answer = await NotificationManager.showConfirm(
        `Вес в характеристике ${scan.Характеристика.Наименование}\n${
          i.Значение
        }(максимально доступный вес ${i.Значение * 1.2}) больше чем вес в сканировании ${
          scan.Количество
        } Вы действительно хотите принять продукцию?`
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
  if (con1 && con2.length && scan.Количество > con2[0].Значение) {
    NotificationManager.swal(
      `Вес в сканировании больше чем доступно в характеристике ${scan.Характеристика.Наименование} ${con2[0].Значение}\nвес в сканировании ${scan.Количество}`
    );
    NotificationManager.instance.playError();
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
