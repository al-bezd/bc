<template>
  <!-- Форма проверки для приемки-->
  <div class="reft_screen_form p-1" v-if="seen">
    <div>
      <h6 class="text-muted">{{ docName }}: Проверка</h6>
      <span>Поддон № {{ оитНомерПалета }}</span>
    </div>
    <div class="space">
      <ListWidget key-field="key" :list="allItem">
        <template #default="{ item }">
          <ScaningGroupItem
            mode="НомХар"
            :key="item.key"
            :data="item"
            :show-procent="true"
            :show-order="true"
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

    <div class="">
      <h6>
        <b>Итог {{ boxCount }} Кор. из {{ оитКоличествоКоробок }}</b>
      </h6>
      <h6>
        <b>Итог {{ weightCount }} Кг.</b>
        <!-- <b>Итог {{ weightCount }} Кг. из {{ weightFromDocument }}</b> -->
      </h6>
    </div>

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
      <button type="button" class="btn btn-success text-uppercase" @click="send">
        <b>ПРИНЯТЬ</b>
      </button>
    </div>

    <FilteredByArticulScreen
      :controller="filteredByArticulController"
      @delete="itemDelete"
    />
  </div>
  <!--Форма проверки для приемки-->
</template>
<script setup lang="ts">
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";

import { RoutingManager } from "@/classes/RoutingManager";
import { GettingManager } from "@/managers/getting/GettingManager";
import { Ref, computed, ref, toRaw } from "vue";

import { IScaning } from "@/interfaces/IScaning";
import { NotificationManager } from "@/classes/NotificationManager";
import { GetCount } from "@/functions/GetCount";
import {
  IGettingProductionDocument,
  IGettingProductionProductTotalItem,
} from "@/managers/getting/interfaces";

import { UserManager } from "@/managers/user/UserManager";
import { HttpManager } from "@/classes/HttpManager";
import { GetGroupScans, getRowKey } from "@/functions/GetGroupScans";
import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import { MainManager } from "@/classes/MainManager";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { FillCount } from "@/functions/FillCount";
RoutingManager.instance.registry(
  RoutingManager.route.gettingProductionCheck,
  show,
  close
);
const seen = ref(false);

const allItem: Ref<IGettingProductionProductTotalItem[]> = ref([]);
const tableTotal: Ref<IGettingProductionProductTotalItem[]> = ref([]);
const currentDoc: Ref<IGettingProductionDocument | null> =
  GettingManager.instance.currentDocument;
const оитНомерПалета = computed(() => {
  return currentDoc.value?.оитНомерПалета;
});

const filteredByArticulController = new FilteredByArticulController(
  GettingManager.instance.currentScanings,
  ref("НомХарСер")
);

//const countScaning = computed(()=>GettingManager.instance.currentScanings.value.length)
const boxCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Грузоместа");
});
const weightCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Количество");
});

// const weightFromDocument = computed(() => {
//   return GetCount(currentDoc.value?.Товары ?? [], "Количество");
// });

const docName = computed(() => {
  if (currentDoc.value) {
    return currentDoc.value!.Наименование;
  }
  return "Документ не найден";
});

const оитКоличествоКоробок = computed(() => {
  if (currentDoc.value) {
    return currentDoc.value!.оитКоличествоКоробок;
  }
  return "";
});

const КвантыНеСоблюдены = ref(false);
const sendIsStart = ref(false); /// тригер если сохранение на сервер начато, нучно что бы дважды не нажимали
const saveIsStart = ref(false); /// тригер если сохранение в локальную БД начато, нучно что бы дважды не нажимали

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
  setTimeout(initAllItem, 500);

  //console.log("allItem ", toRaw(allItem.value));
}

function initAllItem() {
  //console.log("Товары ", currentDoc.value?.Товары);
  tableTotal.value = GetGroupScans(
    currentDoc.value?.Товары ?? []
  ) as IGettingProductionProductTotalItem[];

  allItem.value = fillCurrentResult(
    tableTotal.value,
    GettingManager.instance.currentScanings.value
  );
}

async function closeWithQuest() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
}

/// Сохраняем текущее состояние документа в локальную базу данных
async function save() {
  if (saveIsStart.value) {
    return;
  }

  saveIsStart.value = true;
  const currentDocLink = currentDoc.value?.Ссылка.Ссылка;

  let userDocs = await MainManager.instance.local.allUserDocs();
  let doc: IGettingProductionDocument = currentDoc.value!;
  let isFind = false;
  if (!userDocs) {
    userDocs = [];
  }
  for (const userDoc of userDocs) {
    if (userDoc.Ссылка.Ссылка == currentDocLink) {
      isFind = true;
      doc = userDoc as IGettingProductionDocument;
      // userDoc.scanings = GettingManager.instance.currentScanings.value.map((x) =>
      //   toRaw(x)
      // );
      // const saveRes = await UserManager.instance.saveUserDocs(userDocs);

      // if (saveRes) {
      //   NotificationManager.swal("Сохранено");
      // }
      // saveIsStart.value = false;
      break;
    }
  }

  //const userDoc: IGettingProductionDocument = GettingManager.instance.currentDocument
  // .value!;
  doc.scanings = GettingManager.instance.currentScanings.value.map((x) => toRaw(x));
  if (!isFind) {
    userDocs.unshift(doc);
  }

  const saveRes = await UserManager.instance.saveUserDocs(userDocs);
  if (saveRes) {
    NotificationManager.swal("Сохранено");
  }
  saveIsStart.value = false;
}

/// отправляет данные на сервер
async function send() {
  if (sendIsStart.value) {
    return;
  }
  const doc: IGettingProductionDocument = currentDoc.value!;
  if (boxCount.value !== doc.оитКоличествоКоробок) {
    NotificationManager.swal(
      "Количество коробок по факту не совпадает с количеством по документу"
    );
    return;
  }
  const countKG = GetCount(GettingManager.instance.currentScanings.value, "Количество");
  //const countKGInDoc = GetCount(doc.Товары, "Количество");
  const countKGInDoc = GetCount(allItem.value, "ТекущееКоличество");
  if (countKG !== countKGInDoc) {
    NotificationManager.swal(
      `Количество в сопроводительной(${countKGInDoc} кг) отличается от количества в сканированиях (${countKG} кг)`
    );
    return;
  }

  const params = {
    Наименование: doc.Ссылка.Наименование,
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    Товары: Object.assign([], toRaw(allItem.value.map((x) => toRaw(x)))),
    Пользователь: toRaw(UserManager.instance.user.value),
    check_prod_doc: true,
  };

  // qw.show("",console.log,getting_prod_check.show);
  // $('#ok_button_id').hide();
  // qw.question_window_text = 'Ожидайте записи документа!!!';
  NotificationManager.swal(`Запись документа ${doc.Ссылка.Наименование} Начата`, "info");
  sendIsStart.value = true;
  const response = await HttpManager.post("/execute", params);
  sendIsStart.value = false;
  if (response.success) {
    if (response.data.РезультатПроверки) {
      NotificationManager.swal(response.data.Текст, "success");
      GettingManager.instance.clear();

      RoutingManager.instance.pushName(RoutingManager.route.gettingProductionLoad);
    }
  } else {
    NotificationManager.swal(response.data.Текст);
    //RoutingManager.instance.pushName(RoutingManager.route.gettingProductionCheck);
  }
}

function fillCurrentResult(
  tableTotal: IGettingProductionProductTotalItem[],
  scanings: IScaning[]
) {
  for (const tableRow of tableTotal) {
    tableRow.ТекущееКоличество = 0;
    tableRow.ТекущееКоличествоВЕдиницахИзмерения = 0;
    tableRow.ТекущееКоличествоГрузомест = 0;
  }
  for (const scan of scanings) {
    const scanKey = getRowKey(scan);
    for (const tableRow of tableTotal) {
      const tableRowKey = getRowKey(tableRow);

      if (tableRowKey == scanKey) {
        tableRow.Серия = scan.Серия;
        FillCount(tableRow, scan);
        //tableRow.ТекущееКоличество += scan.Количество;
        //tableRow.ТекущееКоличествоВЕдиницахИзмерения += scan.КоличествоВЕдиницахИзмерения;
        //tableRow.ТекущееКоличествоГрузомест += scan.Грузоместа;
        // tableRow.ТекущееКоличествоВЕдиницахИзмерения += scan.КоличествоВЕдиницахИзмерения;
        // tableRow.ТекущееКоличество = scan.Количество;

        // if (tableRow.Номенклатура.ЕдиницаИзмерения.Наименование == "шт") {
        //   //если штучная продукция то количество у нее не в кг а в ее ед изм а надо перевести в кг а вед изм заполнить ед изм
        //   tableRow.ТекущееКоличествоВЕдиницахИзмерения += scan.Количество;
        //   tableRow.ТекущееКоличество +=
        //     scan.Количество * tableRow.Номенклатура.ВесЧислитель;
        // } else {
        //   let КоличествоВЕдиницахИзмерения = scan.КоличествоВЕдиницахИзмерения ?? 0;
        //   const Количество = scan.Количество ?? 0;

        //   tableRow.Количество += Количество;
        //   КоличествоВЕдиницахИзмерения =
        //     КоличествоВЕдиницахИзмерения == 0 ? Количество : КоличествоВЕдиницахИзмерения;
        //   tableRow.КоличествоВЕдиницахИзмерения += КоличествоВЕдиницахИзмерения;
        // }

        //tableRow.ТекущееКоличество = rounded(tableRow.ТекущееКоличество);

        ///
        // if (tableRow.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
        //   tableRow.ТекущееКоличествоВЕдиницахИзмерения = rounded(
        //     tableRow.ТекущееКоличествоВЕдиницахИзмерения,
        //     0
        //   );
        // } else {
        //   tableRow.ТекущееКоличествоВЕдиницахИзмерения = rounded(
        //     tableRow.ТекущееКоличествоВЕдиницахИзмерения
        //   );
        // }
        ///
        // tableRow.КоличествоВЕдиницахИзмерения =
        //   tableRow.Количество / rounded(scan.Номенклатура.ВесЧислитель);
        // tableRow.КоличествоВЕдиницахИзмерения = rounded(
        //   tableRow.КоличествоВЕдиницахИзмерения
        // );
        //console.log("scan", scan);
        //console.log("tableRow", tableRow);

        //tableRow.КоличествоКоробок += scan.Грузоместа;
        //tableRow.Грузоместа += scan.Грузоместа;
        //this.box_count+=y.Грузоместа
        //scan.ВЗаказе = true;
      }
    }
  }

  // Сортировка
  tableTotal.sort(
    (a: IGettingProductionProductTotalItem, b: IGettingProductionProductTotalItem) => {
      return Number(a.Номенклатура.Артикул) - Number(b.Номенклатура.Артикул);
    }
  );

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
    GettingManager.instance.deleteScaning(item).then(() => {
      initAllItem();
      filteredByArticulController.emit("afterDelete");
    });
  }
}
</script>
