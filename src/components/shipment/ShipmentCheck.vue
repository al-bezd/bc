<template>
  <!-- Форма проверки для приемки-->
  <div class="reft_screen_form p-1" v-if="seen">
    <div class="row">
      <div class="col-8">
        <h6 class="text-muted fs-6">{{ docName }}: Проверка</h6>
      </div>
      <div class="col-4">
        <button
          class="btn btn-success btn-sm text-uppercase"
          @click="
            () => {
              taraSeen = true;
            }
          "
        >
          тара
        </button>
      </div>
    </div>

    <!-- <span>Поддон № {{ оитНомерПалета }}</span> -->

    <div class="space">
      <ListWidget key-field="key" :list="allItem">
        <template #default="{ item }">
          <ScaningGroupItem
            :key="item.key"
            :data="item"
            @tap="openArticulScreen"
            :show-procent="true"
            :show-order="true"
            :mode="currentViewMode"
          >
            <template v-slot:addButton>
              <button class="btn btn-info" @click="addManual(item)">+</button>
            </template>
          </ScaningGroupItem>
        </template>
      </ListWidget>
    </div>

    <div class="">
      <h6>
        <b>Итог {{ boxCount }} Кор.</b>
      </h6>
      <h6>
        <b>Итог {{ weightCount }} Кг.</b>
      </h6>
    </div>

    <div class="">
      <div class="btn-group w-100" role="group">
        <button
          type="button"
          class="btn btn-warning text-uppercase"
          @click="closeWithQuest"
        >
          <b>НАЗАД</b>
        </button>
        <button type="button" class="btn btn-primary text-uppercase" @click="save">
          <b>СОХР</b>
        </button>
        <button
          type="button"
          class="btn btn-success text-uppercase"
          @click="send({ Режим: 'проверка' })"
        >
          <b>ОТПР</b>
        </button>
      </div>
    </div>
    <!-- Отфильтрованные по Номенклатура.Наименование НАЧАЛО -->
    <FilteredByArticulScreen
      :controller="filteredByArticulController"
      @delete="itemDelete"
    >
      <!-- <template v-slot:footer>
        <span class="mb-1"
          >Коробок <b>{{ filteredBoxCount }}</b> Шт.</span
        >
      </template> -->
    </FilteredByArticulScreen>

    <!-- Окно с тарой НАЧАЛО -->
    <ContainersWidget v-model:seen="taraSeen" />
    <!-- Окно с тарой КОНЕЦ -->
  </div>
  <!--Форма проверки для приемки-->
</template>
<script setup lang="ts">
import { RoutingManager } from "@/classes/RoutingManager";
import { Ref, computed, ref, toRaw } from "vue";

import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { NotificationManager } from "@/classes/NotificationManager";
import { GetCount, Round } from "@/functions/GetCount";
import { UserManager } from "@/managers/user/UserManager";
import { HttpManager } from "@/classes/HttpManager";
import { GetGroupScans, getRowKey, RowKeyMode } from "@/functions/GetGroupScans";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { IShipmentDocument } from "@/managers/shipment/interfaces";
import { MainManager } from "@/classes/MainManager";
import { IDocument } from "@/interfaces/IDocument";
import { ScanerManager } from "@/classes/ScanerManager";
import { ScaningController } from "@/controllers/ScaningController";
import ContainersWidget from "@/components/shipment/containers/ContainersWidget.vue";
import FilteredByArticulScreen from "../modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { FillCount } from "@/functions/FillCount";
RoutingManager.instance.registry(RoutingManager.route.shipmentCheck, show, close);
/// Контроллер сканирования, берет на себя работу пол получению сканирования, базовой валидации, удобно для расширения функционала
const scaningController: ScaningController = new ScaningController(
  ShipmentManager.instance
);

const seen = ref(false);

const taraSeen = ref(false);

const allItem: Ref<IScaningGroup[]> = ref([]); // группированные сканирования
//const tableTotal: Ref<IScaningGroup[]> = ref([]); // товары из документа

const filteredByArticulController = new FilteredByArticulController(
  ShipmentManager.instance.currentScanings,
  ref("НомХар")
);

// const filteredAllItem: Ref<IScaningGroup[]> = ref([]);

// const filteredBoxCount = computed(() => {
//   return GetCount(filteredByArticulController.items.value, "КоличествоКоробок");
// });

const boxCount = computed(() => {
  return GetCount(ShipmentManager.instance.currentScanings.value, "Грузоместа");
});
const weightCount = computed(() => {
  return GetCount(ShipmentManager.instance.currentScanings.value, "Количество");
});

const currentScanings = computed(() => {
  return ShipmentManager.instance.currentScanings.value;
});

// const weightFromDocument = computed(() => {
//   return GetCount(
//     ShipmentManager.instance.currentDocument.value?.Товары ?? [],
//     "Количество"
//   );
// });

const docName = computed(() => {
  if (ShipmentManager.instance.currentDocument.value) {
    return ShipmentManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});

// const оитКоличествоКоробок = computed(() => {
//   if (ShipmentManager.instance.currentDocument.value) {
//     GetCount(ShipmentManager.instance.currentDocument.value?.Товары ?? [], "Грузоместа");
//   }
//   return "";
// });

const КвантыНеСоблюдены = ref(false);
const sendIsStart = ref(false); /// тригер если сохранение на сервер начато, нучно что бы дважды не нажимали
const saveIsStart = ref(false); /// тригер если сохранение в локальную БД начато, нучно что бы дважды не нажимали
const currentViewMode: Ref<RowKeyMode> = ref("НомХар");
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;

  setTimeout(afterShow, 500);
}

function afterShow() {
  initAllItem();
}

function initAllItem() {
  const bTable = ShipmentManager.instance.currentDocument.value?.Товары ?? [];
  bTable.forEach((x) => {
    x.Грузоместа = (x as any).рсГрузоместа;
  });

  let t = GetGroupScans(bTable, currentViewMode.value);

  allItem.value = fillCurrentResult(
    t,
    ShipmentManager.instance.currentScanings.value,
    currentViewMode.value
  );
  //allItem.value = GetDataForSending(currentViewMode.value);
  /// сортировка по артикулу
  allItem.value.sort((a, b) =>
    (a.Артикул ?? a.Номенклатура.Артикул).localeCompare(
      b.Артикул ?? b.Номенклатура.Артикул
    )
  );
}

function GetDataForSending(key: RowKeyMode) {
  let t = GetGroupScans(ShipmentManager.instance.currentScanings.value, key);

  const res = fillCurrentResult(t, ShipmentManager.instance.currentScanings.value, key);
  return res;
}

/// закрываем окно с подтверждением
async function closeWithQuest() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentForm);
}

/// Добавляем сканирование в ручном режиме
async function addManual(item: IScaning) {
  let scanIsFind = false;
  if (!item.ШтрихкодПродукции) {
    for (const i of currentScanings.value) {
      if (
        i.Номенклатура.Ссылка.Ссылка == item.Номенклатура.Ссылка.Ссылка &&
        i.Характеристика.Ссылка.Ссылка == item.Характеристика.Ссылка.Ссылка &&
        i.ШтрихкодПродукции !== ""
      ) {
        item.ШтрихкодПродукции = i.ШтрихкодПродукции;
        scanIsFind = true;
        break;
      }
    }
    if (!scanIsFind) {
      NotificationManager.error("Сканирований по данной Номенклатуре не найдено");
      return;
    }
    if (!item.ШтрихкодПродукции) {
      NotificationManager.error("Штрихкод продукции не заполнен");
      return;
    }
  }

  const res = await ScanerManager.showAddManualScaning(item);
  if (!res) {
    return;
  }
  //const newScaning = await ShipmentManager.instance.getScaning(res, itPalet.value);
  const newScaning = await scaningController.getScaning(res, false);

  if (!newScaning) {
    return;
  }

  if (newScaning) {
    ShipmentManager.instance.addScaning(newScaning);
    scaningController.isValidScaning(
      newScaning,
      ShipmentManager.instance.currentScanings.value
    );
    initAllItem();
  }

  //$('#AddItemModal').modal('show')
}

/// Сохраняем текущее состояние документа в локальную базу данных
async function save() {
  if (saveIsStart.value) {
    return;
  }

  saveIsStart.value = true;
  const currentDocLink = ShipmentManager.instance.currentDocument.value?.Ссылка.Ссылка;
  //const userDocs = await UserManager.instance.getUserDocuments();
  const documents = await MainManager.instance.local.allUserDocs();
  let isFind = false;
  if (documents) {
    for (const userDoc of documents) {
      if (userDoc.Ссылка.Ссылка == currentDocLink) {
        isFind = true;
        //Object.assign(userDoc, toRaw(ShipmentManager.instance.currentDocument.value!));
        userDoc.scanings = ShipmentManager.instance.currentScanings.value.map((x) =>
          toRaw(x)
        );
        saveDocument(documents);

        break;
      }
    }
    if (!isFind) {
      documents.unshift(getDocumnetForLocalSaving());
      saveDocument(documents);
    }
  } else {
    saveDocument([getDocumnetForLocalSaving()]);
  }
  saveIsStart.value = false;
}

function getDocumnetForLocalSaving() {
  const userDoc: IShipmentDocument = toRaw(
    ShipmentManager.instance.currentDocument.value!
  );
  userDoc.scanings = ShipmentManager.instance.currentScanings.value.map((x) => toRaw(x));
  return userDoc;
}

/// Сохраняем текущий документ в хранилище документов пользователя
async function saveDocument(documents: IDocument[]) {
  const curDoc = ShipmentManager.instance.currentDocument.value!;
  //   const userDoc: IShipmentDocument = ShipmentManager.instance.currentDocument.value!;
  //   userDoc.scanings = ShipmentManager.instance.currentScanings.value.map((x) => toRaw(x));
  //   documents.unshift(userDoc);
  const saveRes = await UserManager.instance.saveUserDocs(documents);
  if (saveRes) {
    NotificationManager.success(`Документ ${curDoc.Наименование}\nУспешно сохранен!`);
    return;
  }
  NotificationManager.error(`Документ ${curDoc.Наименование}\nНе сохранен`);
}

/// отправляет данные на сервер
async function send(mode: any) {
  if (mode.Режим == "запись") {
    //$('#ok_button_id').hide()
    NotificationManager.info("Ожидайте записи документа!!!");
    //qw.question_window_text = 'Ожидайте записи документа!!!'
  } else {
    var answer = false;
    if (КвантыНеСоблюдены.value) {
      answer = await NotificationManager.showConfirm(
        "Вы уверенны что хотите записать заказ С НАРУШЕНИЕМ КВАНТОВ??? "
      );
      if (!answer) {
        return;
      }
    }
    // else {
    //   answer = await NotificationManager.showConfirm(
    //     "Вы уверенны что хотите записать заказ? "
    //   );
    //   if (!answer) {
    //     return;
    //   }
    // }
  }
  if (sendIsStart.value) {
    NotificationManager.info("Операция записи документа еще выполняется");
    return;
  }
  sendIsStart.value = true;
  const doc = ShipmentManager.instance.currentDocument.value!;

  const itemsForSendToServer = GetDataForSending("НомХарСер").map((x: IScaningGroup) => {
    const item = toRaw(x);
    item.Грузоместа = item.ТекущееКоличествоГрузомест;
    item.Количество = item.ТекущееКоличество;
    item.КоличествоВЕдиницахИзмерения = item.ТекущееКоличествоВЕдиницахИзмерения;
    return item;
  });

  //doc = GetData("current_doc", "j");
  let params = {
    Наименование: doc.Ссылка.Наименование,
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    Товары: itemsForSendToServer,
    КвантыНеСоблюдены: КвантыНеСоблюдены.value,
    Пользователь: toRaw(UserManager.instance.user.value),
    Режим: mode.Режим,
  };
  const res = await HttpManager.post("/check_and_write_doc", params);
  if (res.success) {
    sendIsStart.value = false;
    if (res.data.РезультатПроверки) {
      if (mode.Режим == "проверка") {
        /// После успешного запроса проверки данных, мы справшиваем пользователя хочет ли он записать данные в 1с
        const confirmRes = await NotificationManager.showConfirm(res.data.Текст);
        if (confirmRes) {
          send({ Режим: "запись" });
        }
      } else {
        /// После успешной записи документа мы отправляем запрос с записью сканирований в документ
        NotificationManager.swal(res.data.Текст);
        const scaningsForSavingInOrder = ShipmentManager.instance.currentScanings.value.map(
          (x) => toRaw(x)
        );
        const params = {
          Наименование: doc.Ссылка.Наименование,
          Тип: doc.Ссылка.Тип,
          Вид: doc.Ссылка.Вид,
          Ссылка: doc.Ссылка.Ссылка,
          Товары: scaningsForSavingInOrder,
          set_scaning_in_order: true,
        };
        /// Сохраняем сканирования в заказ
        const saveScaningInOrderRes = await HttpManager.post("/execute", params);
        if (saveScaningInOrderRes.success) {
          //console.log(saveScaningInOrderRes.data.Текст);
        }
        RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
      }
    } else {
      NotificationManager.error(res.data.Текст);
    }
  } else {
    NotificationManager.error(res.error);
  }
}

/// передаем в контроллер данные показываем экран с отфильтрованным содержимым
function openArticulScreen(scaning: IScaning) {
  filteredByArticulController.filter(scaning);
  filteredByArticulController.show();
}

/// заполняем сгруппированные элементы
function fillCurrentResult(
  tableTotal: IScaningGroup[],
  scanings: IScaning[],
  mode: RowKeyMode
) {
  /// очищаем таблицу перед ее заполнением
  for (const tableRow of tableTotal) {
    tableRow.ТекущееКоличество = 0;
    tableRow.ТекущееКоличествоВЕдиницахИзмерения = 0;
    tableRow.ТекущееКоличествоГрузомест = 0;
    // tableRow.КоличествоВЕдиницахИзмерения = 0;
    // //tableRow.КоличествоКоробок = 0;
    // tableRow.ТекущееКоличествоГрузомест = 0;
    // tableRow.Количество = 0;
    // tableRow.Грузоместа = 0;
    // //(tableRow as any).рсГрузоместа = 0;
    //(tableRow as any).ЕдиницаИзмерения = tableRow.Номенклатура.ЕдиницаИзмерения;
  }
  /// заполняем таблицу насканированным
  for (const scan of scanings) {
    const scanKey = getRowKey(scan, mode);
    for (const tableRow of tableTotal) {
      const tableRowKey = getRowKey(tableRow, mode);

      if (tableRowKey === scanKey) {
        /// Заменяем серию из сканирований потому что нам нужна ссылка из сканирования а не из строки табличной части
        tableRow.Серия = scan.Серия;
        FillCount(tableRow, scan);
        //tableRow.ТекущееКоличество += scan.Количество;
        //tableRow.ТекущееКоличество = rounded(tableRow.ТекущееКоличество);
        //tableRow.ТекущееКоличествоВЕдиницахИзмерения += scan.КоличествоВЕдиницахИзмерения;
        //tableRow.Количество += scan.Количество;
        //tableRow.ТекущееКоличество = tableRow.Количество;
        ///
        // if (tableRow.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
        //   tableRow.ТекущееКоличествоВЕдиницахИзмерения = Round(
        //     tableRow.ТекущееКоличествоВЕдиницахИзмерения,
        //     0
        //   );
        // } else {
        //   tableRow.ТекущееКоличествоВЕдиницахИзмерения = Round(
        //     tableRow.ТекущееКоличествоВЕдиницахИзмерения
        //   );
        // }
        ///
        // tableRow.КоличествоВЕдиницахИзмерения =
        //   tableRow.Количество / Round(scan.Номенклатура.ВесЧислитель);
        // tableRow.КоличествоВЕдиницахИзмерения = Round(
        //   tableRow.КоличествоВЕдиницахИзмерения
        // );
        //tableRow.КоличествоКоробок += scan.Грузоместа;
        //tableRow.ТекущееКоличествоГрузомест += scan.Грузоместа;

        //tableRow.Количество = Round(tableRow.Количество, 3);
        //tableRow.ТекущееКоличество = Round(tableRow.ТекущееКоличество, 3);
        //tableRow.Грузоместа += scan.Грузоместа;
        //this.box_count+=y.Грузоместа
        //scan.ВЗаказе = true;
      }
    }
  }

  // Сортировка
  // tableTotal.sort((a: IScaningGroup, b: IScaningGroup) => {
  //   return Number(a.Номенклатура.Артикул) - Number(b.Номенклатура.Артикул);
  // });

  for (const tableTotalRow of tableTotal) {
    // let ВПроцСоотношении = Math.round(
    //   (100 / tableTotalRow.КоличествоУпаковок) *
    //     tableTotalRow.ТекущееКоличествоВЕдиницахИзмерения
    // );
    let ВПроцСоотношении = Math.round(
      (100 / tableTotalRow.ЗаказанноеКоличествоВЕдиницахИзмерения) *
        tableTotalRow.ТекущееКоличествоВЕдиницахИзмерения
    );
    if (String(ВПроцСоотношении) === "NaN") {
      ВПроцСоотношении = 0;
    }
    if (ВПроцСоотношении === 100) {
      tableTotalRow.cls = " alert alert-success ";
    }
    if (ВПроцСоотношении > 100) {
      tableTotalRow.cls = " alert alert-warning ";
      КвантыНеСоблюдены.value = true;
    }
    if (ВПроцСоотношении < 100) {
      tableTotalRow.cls = " alert alert-info ";
    }
    if (ВПроцСоотношении === 0) {
      tableTotalRow.cls = " alert alert-danger ";
    }
    if (ВПроцСоотношении > 110) {
      tableTotalRow.cls = " alert alert-orange ";
    }
    tableTotalRow.ВПроцСоотношении = ВПроцСоотношении;
    //this.weight_count+=i.ТекущееКоличество
  }
  return tableTotal;
}

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
      ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    ShipmentManager.instance.deleteScaning(item).then(() => {
      initAllItem();
      filteredByArticulController.emit("afterDelete");
    });
  }
}
</script>
