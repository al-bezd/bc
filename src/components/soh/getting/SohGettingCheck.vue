<template>
  <!-- Форма проверки для приемки-->
  <div class="reft_screen_form p-3" v-if="seen">
    <div class="row">
      <div class="col-8">
        <h6 class="text-muted fs-6">СОХ Приемка: {{ docName }}: Проверка</h6>
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
      <ScaningGroupItem
        v-for="item in allItem"
        :key="item.key"
        :data="item"
        @tap="openArticulScreen"
        :show-procent="true"
        :mode="currentViewMode"
      >
        <template v-slot:addButton>
          <button class="btn btn-info" @click="addManual(item)">+</button>
        </template>
      </ScaningGroupItem>
    </div>

    <div class="">
      <h5>
        <b>Итог {{ boxCount }} Кор.</b>
      </h5>
      <h5>
        <b>Итог {{ weightCount }} Кг.</b>
      </h5>
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
          <b>СОХРАНИТЬ</b>
        </button>
        <button
          type="button"
          class="btn btn-success text-uppercase"
          @click="send({ Режим: 'проверка' })"
        >
          <b>ОТПРАВИТЬ</b>
        </button>
      </div>
    </div>
    <!-- Отфильтрованные по Номенклатура.Наименование НАЧАЛО -->
    <FilteredByArticulScreen :controller="filteredByArticulController">
      <!-- <template v-slot:footer>
        <span class="mb-3"
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
import { GetCount } from "@/functions/GetCount";
import { rounded } from "@/functions/rounded";
import { UserManager } from "@/managers/user/UserManager";
import { HttpManager } from "@/classes/HttpManager";
import { GetGroupScans, getRowKey, RowKeyMode } from "@/functions/GetGroupScans";

import { MainManager } from "@/classes/MainManager";
import { IDocument } from "@/interfaces/IDocument";
import { ScanerManager } from "@/classes/ScanerManager";
import { ScaningController } from "@/controllers/ScaningController";
import ContainersWidget from "@/components/soh/modals/ContainersWidget.vue";
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";

import { ISohDocument } from "@/managers/soh/interfaces";
import { SohGettingManager } from "@/managers/soh/SohGettingManager";

const currentManager = computed(() => SohGettingManager.instance);
RoutingManager.instance.registry(RoutingManager.route.sohGettingCheck, show, close);
/// Контроллер сканирования, берет на себя работу пол получению сканирования, базовой валидации, удобно для расширения функционала
const scaningController: ScaningController = new ScaningController(currentManager.value);

const seen = ref(false);

const taraSeen = ref(false);

const allItem: Ref<IScaningGroup[]> = ref([]); // группированные сканирования
const tableTotal: Ref<IScaningGroup[]> = ref([]); // товары из документа

const filteredByArticulController = new FilteredByArticulController(
  currentManager.value.currentScanings,
  ref("НомХарСер")
);

// const filteredAllItem: Ref<IScaningGroup[]> = ref([]);

// const filteredBoxCount = computed(() => {
//   return GetCount(filteredByArticulController.items.value, "КоличествоКоробок");
// });

const boxCount = computed(() => {
  return GetCount(currentManager.value.currentScanings.value, "Грузоместа");
});
const weightCount = computed(() => {
  return GetCount(currentManager.value.currentScanings.value, "Количество");
});

const currentScanings = computed(() => {
  return currentManager.value.currentScanings.value;
});

// const weightFromDocument = computed(() => {
//   return GetCount(
//     ShipmentManager.instance.currentDocument.value?.Товары ?? [],
//     "Количество"
//   );
// });

const docName = computed(() => {
  if (currentManager.value.currentDocument.value) {
    return currentManager.value.currentDocument.value!.Наименование;
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
const currentViewMode: Ref<RowKeyMode> = ref("НомХарСер");
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;

  setTimeout(initAllItem, 500);
}

function initAllItem() {
  tableTotal.value = GetGroupScans(
    currentManager.value.currentDocument.value?.Товары ?? [],
    currentViewMode.value
  );

  allItem.value = fillCurrentResult(
    tableTotal.value,
    currentManager.value.currentScanings.value,
    currentViewMode.value
  );
}

/// закрываем окно с подтверждением
async function closeWithQuest() {
  RoutingManager.instance.pushName(RoutingManager.route.sohGettingForm);
}

/// Добавляем сканирование в ручном режиме
async function addManual(item: IScaning) {
  let scanIsFind = false;
  if (!item.ШтрихкодПродукции) {
    for (const i of currentScanings.value) {
      if (
        i.Номенклатура.Ссылка.Ссылка == item.Номенклатура.Ссылка.Ссылка &&
        i.Характеристика.Ссылка.Ссылка == item.Характеристика.Ссылка.Ссылка &&
        i.Серия.Наименование == item.Серия.Наименование &&
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
    currentManager.value.addScaning(newScaning);
    scaningController.isValidScaning(
      newScaning,
      currentManager.value.currentScanings.value
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
  const currentDocLink = currentManager.value.currentDocument.value?.Ссылка.Ссылка;
  //const userDocs = await UserManager.instance.getUserDocuments();
  const documents = await MainManager.instance.local.allUserDocs();
  let isFind = false;
  if (documents) {
    for (const userDoc of documents) {
      if (userDoc.Ссылка.Ссылка == currentDocLink) {
        isFind = true;
        //Object.assign(userDoc, toRaw(ShipmentManager.instance.currentDocument.value!));
        userDoc.scanings = currentManager.value.currentScanings.value.map((x) =>
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
  const userDoc: ISohDocument = toRaw(currentManager.value.currentDocument.value!);
  userDoc.scanings = currentManager.value.currentScanings.value.map((x) => toRaw(x));
  return userDoc;
}

/// Сохраняем текущий документ в хранилище документов пользователя
async function saveDocument(documents: IDocument[]) {
  const curDoc = currentManager.value.currentDocument.value!;
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
    NotificationManager.info("Ожидайте записи документа!!!>");
    //qw.question_window_text = 'Ожидайте записи документа!!!'
  }
  if (sendIsStart.value) {
    NotificationManager.info("Операция записи документа еще выполняется");
    return;
  }
  sendIsStart.value = true;
  const doc = currentManager.value.currentDocument.value!;
  const itemsForSendToServer = allItem.value.map((x: IScaningGroup) => toRaw(x));

  //doc = GetData("current_doc", "j");
  let params = {
    Наименование: doc.Ссылка.Наименование,
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    Товары: itemsForSendToServer,
    //КвантыНеСоблюдены: КвантыНеСоблюдены.value,
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
        const scaningsForSavingInOrder = currentManager.value.currentScanings.value.map(
          (x) => toRaw(x)
        );
        const params = {
          Наименование: doc.Ссылка.Наименование,
          Тип: doc.Ссылка.Тип,
          Вид: doc.Ссылка.Вид,
          Ссылка: doc.Ссылка.Ссылка,
          Товары: scaningsForSavingInOrder,
          set_scaning_in_getting_soh: true, //set_scaning_in_order
        };
        /// Сохраняем сканирования в заказ
        const saveScaningInOrderRes = await HttpManager.post("/execute", params);
        if (saveScaningInOrderRes.success) {
          //console.log(saveScaningInOrderRes.data.Текст);
        }
      }
    }
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
    tableRow.КоличествоВЕдиницахИзмерения = 0;
    tableRow.КоличествоКоробок = 0;
    tableRow.ТекущееКоличествоГрузомест = 0;
    tableRow.Количество = 0;
  }
  /// заполняем таблицу насканированным
  for (const scan of scanings) {
    const scanKey = getRowKey(scan, mode);
    for (const tableRow of tableTotal) {
      const tableRowKey = getRowKey(tableRow, mode);

      if (tableRowKey === scanKey) {
        tableRow.Серия = scan.Серия;
        //tableRow.ТекущееКоличество += scan.Количество;
        //tableRow.ТекущееКоличество = rounded(tableRow.ТекущееКоличество);
        tableRow.ТекущееКоличествоВЕдиницахИзмерения += scan.КоличествоВЕдиницахИзмерения;
        ///
        if (tableRow.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
          tableRow.ТекущееКоличествоВЕдиницахИзмерения = rounded(
            tableRow.ТекущееКоличествоВЕдиницахИзмерения,
            0
          );
        } else {
          tableRow.ТекущееКоличествоВЕдиницахИзмерения = rounded(
            tableRow.ТекущееКоличествоВЕдиницахИзмерения
          );
        }
        ///
        tableRow.КоличествоВЕдиницахИзмерения =
          tableRow.Количество / rounded(scan.Номенклатура.ВесЧислитель);
        tableRow.КоличествоВЕдиницахИзмерения = rounded(
          tableRow.КоличествоВЕдиницахИзмерения
        );
        tableRow.КоличествоКоробок += scan.Грузоместа;
        tableRow.ТекущееКоличествоГрузомест += scan.Грузоместа;
        //this.box_count+=y.Грузоместа
        //scan.ВЗаказе = true;
      }
    }
  }

  // Сортировка
  tableTotal.sort((a: IScaningGroup, b: IScaningGroup) => {
    return Number(a.Номенклатура.Артикул) - Number(b.Номенклатура.Артикул);
  });

  for (const tableTotalRow of tableTotal) {
    let ВПроцСоотношении = Math.round(
      (100 / tableTotalRow.КоличествоУпаковок) *
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
</script>
