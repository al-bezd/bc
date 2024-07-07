<template>
  <!-- Форма проверки для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <div>
      <h4 class="text-muted">{{ docName }}</h4>
      <span>Поддон № {{ оитНомерПалета }}</span>
    </div>
    <div class="space">
      <GettingProdCheckItem
        v-for="item in allItem"
        :key="item.рсУИД"
        :data="item"
        @tap="openArticulScreen"
      />
    </div>

    <div class="col-12">
      <h5>
        <b>Итог {{ boxCount }} Кор. из {{ оитКоличествоКоробок }}</b>
      </h5>
      <h5>
        <b>Итог {{ weightCount }} Кг. из {{ weightFromDocument }}</b>
      </h5>
    </div>

    <div class="btn-group w-100" role="group">
      <button
        type="button"
        class="btn btn-warning btn-lg text-uppercase"
        @click="closeWithQuest"
      >
        <b>НАЗАД</b>
      </button>
      <button type="button" class="btn btn-primary btn-lg text-uppercase" @click="save">
        <b>СОХРАНИТЬ</b>
      </button>
      <button type="button" class="btn btn-success btn-lg text-uppercase" @click="send">
        <b>ПРИНЯТЬ</b>
      </button>
    </div>

    <ArticulScreen />
  </div>
  <!--Форма проверки для приемки-->
</template>
<script setup lang="ts">
import GettingProdCheckItem from "./widgets/GettingProdCheckItem.vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { GettingManager } from "@/managers/getting/GettingManager";
import { Ref, computed, ref, toRaw } from "vue";
import ArticulScreen from "./widgets/ArticulScreen.vue";
import { IScaning } from "@/interfaces/IScaning";
import { NotificationManager } from "@/classes/NotificationManager";
import { GetCount } from "@/functions/GetCount";
import {
  IGettingProductionDocument,
  IGettingProductionProductItem,
  IGettingProductionProductTotalItem,
} from "@/managers/getting/interfaces";
import { rounded } from "@/functions/rounded";
import { UserManager } from "@/managers/user/UserManager";
import { HttpManager } from "@/classes/HttpManager";

RoutingManager.instance.registry(
  RoutingManager.route.gettingProductionCheck,
  show,
  close
);
const seen = ref(false);

const allItem: Ref<any> = ref([]);
const itemForSend: Ref<any> = ref([]);
const оитНомерПалета = computed(() => {
  return GettingManager.instance.currentDocument.value?.оитНомерПалета;
});
//const countScaning = computed(()=>GettingManager.instance.currentScanings.value.length)
const boxCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Грузоместа");
});
const weightCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Количество");
});

const weightFromDocument = computed(() => {
  return GetCount(
    GettingManager.instance.currentDocument.value?.Товары ?? [],
    "Количество"
  );
});

const docName = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});

const оитКоличествоКоробок = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.оитКоличествоКоробок;
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
  const totalTable = createUniqProductionList(
    GettingManager.instance.currentDocument.value?.Товары ?? []
  );

  allItem.value = fillCurrentResult(
    totalTable,
    GettingManager.instance.currentScanings.value
  );

  //console.log("allItem ", toRaw(allItem.value));
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
  const currentDocLink = GettingManager.instance.currentDocument.value?.Ссылка.Ссылка;
  const userDocs = await UserManager.instance.getUserDocuments();
  let isFind = false;
  if (userDocs) {
    for (const userDoc of userDocs.data.docs) {
      if (userDoc.Ссылка.Ссылка == currentDocLink) {
        isFind = true;
        userDoc.scanings = GettingManager.instance.currentScanings.value.map((x) =>
          toRaw(x)
        );
        const saveRes = await UserManager.instance.saveUserDocs(userDocs.data.docs);
        if (saveRes) {
          NotificationManager.swal("Сохранено");
        }
        break;
      }
    }
    if (!isFind) {
      const userDoc: IGettingProductionDocument = GettingManager.instance.currentDocument
        .value!;
      userDoc.scanings = GettingManager.instance.currentScanings.value.map((x) =>
        toRaw(x)
      );
      userDocs.data.docs.unshift(userDoc);
      const saveRes = await UserManager.instance.saveUserDocs(userDocs.data.docs);
      if (saveRes) {
        NotificationManager.swal("Сохранено");
      }
    }
  } else {
    const errorText =
      "У пользователя не проинициализированы документы в локальном хранилище, нету записей по пользователю в локальном хранилище";
    console.log(errorText);
    NotificationManager.swal(errorText);
  }
  saveIsStart.value = false;
}

async function send() {
  if (sendIsStart.value) {
    return;
  }
  const doc: IGettingProductionDocument = GettingManager.instance.currentDocument.value!;
  if (boxCount.value !== doc.оитКоличествоКоробок) {
    NotificationManager.swal(
      "Количество коробок по факту не совпадает с количеством по документу"
    );
    return;
  }

  const params = {
    Наименование: doc.Ссылка.Наименование,
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    Товары: Object.assign([], toRaw(itemForSend.value)),
    Пользователь: toRaw(UserManager.instance.user.value),
    check_prod_doc: true,
  };

  // qw.show("",console.log,getting_prod_check.show);
  // $('#ok_button_id').hide();
  // qw.question_window_text = 'Ожидайте записи документа!!!';
  sendIsStart.value = true;
  const response = await HttpManager.post("/execute", params);
  sendIsStart.value = false;
  if (response.success) {
    if (response.data.РезультатПроверки) {
      NotificationManager.swal(response.data.Текст);
      GettingManager.instance.clear();
      RoutingManager.instance.pushName(RoutingManager.route.gettingProductionLoad);
    }
  } else {
    NotificationManager.swal(response.data.Текст);
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionCheck);
  }
}

function openArticulScreen(productName: string) {
  if (seen.value) {
    GettingManager.instance.emit("openArticulScreen", [productName]);
  }
}

function createUniqProductionList(
  products: IGettingProductionProductItem[]
): IGettingProductionProductTotalItem[] {
  const list: any = {};
  for (const item of products) {
    const key = getRowKey(item);

    // eslint-disable-next-line no-prototype-builtins
    if (!list.hasOwnProperty(key)) {
      list[key] = Object.assign({}, item);
      list[key].key = key;
      list[key].cls = " alert alert-primary ";
      list[key].ВПроцСоотношении = 0;
      list[key].ТекущееКоличество = 0;
      list[key].ТекущееКоличествоВЕдиницахИзмерения = 0;
      list[key].КоличествоКоробок = 0;

      continue;
    }
    const dataItem: IGettingProductionProductTotalItem = list[key];
    dataItem.Количество += item.Количество;
    dataItem.КоличествоВЕдиницахИзмерения += item.КоличествоВЕдиницахИзмерения;
    dataItem.КоличествоКоробок += item.Грузоместа;
    // ВПроцСоотношении = Math.round(
    //   (100 / i.КоличествоУпаковок) * i.ТекущееКоличествоВЕдиницахИзмерения
    // );
  }

  const result = [];
  for (const key of Object.keys(list)) {
    result.unshift(list[key]);
  }
  return result;
}

function getRowKey(row: IGettingProductionProductItem) {
  const НоменклатураСсылка = row.Номенклатура.Ссылка.Ссылка;
  const ХарактеристикаСсылка = row.Характеристика.Ссылка.Ссылка;
  const СерияСсылка = row.Серия.Наименование; //Используем наименование как ссылку потому что мы идентифицируем в приложении серию по наименованию
  const key = НоменклатураСсылка + ХарактеристикаСсылка + СерияСсылка;
  return key;
}
function fillCurrentResult(
  tableTotal: IGettingProductionProductTotalItem[],
  scanings: IScaning[]
) {
  for (const scan of scanings) {
    const scanKey = getRowKey(scan);
    for (const tableRow of tableTotal) {
      const tableRowKey = getRowKey(tableRow);
      if (tableRowKey == scanKey) {
        tableRow.ТекущееКоличество += scan.Количество;
        tableRow.ТекущееКоличество = rounded(tableRow.ТекущееКоличество);
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
/*
function prepareData() {
  const allItems = GettingManager.instance.currentDocument.value?.Товары;

  // if (getting_prod_form.prod_list_set===null) {
  //   swal("Не найдено ни одного сканирования")
  //   getting_prod_form.show()
  // }
  prod_list_set = Array.from(getting_prod_form.prod_list_set);

  scaning = []; // Все сканирования
  err = [];
  // init array prod_list
  for (i of prod_list_set) {
    for (y of prod_list) {
      if (y.Номенклатура.Ссылка.Ссылка === undefined) {
        nom = y.Номенклатура.Ссылка;
        har = y.Характеристика.Ссылка;
        ser = y.Серия.Наименование;
      }

      if (
        i ===
        y.Номенклатура.Ссылка.Ссылка +
          y.Характеристика.Ссылка.Ссылка +
          y.Серия.Наименование
      ) {
        if (
          err.indexOf(
            y.Номенклатура.Ссылка.Ссылка +
              y.Характеристика.Ссылка.Ссылка +
              y.Серия.Наименование
          ) == -1
        ) {
          scaning.push(Object.assign({}, y));
          err.push(
            y.Номенклатура.Ссылка.Ссылка +
              y.Характеристика.Ссылка.Ссылка +
              y.Серия.Наименование
          );
        }
      }
    }
  }
  // собираем массив для отображения сборки массива номенкл хар-ка
  for (i of this.all_item) {
    i.КоличествоКоробок = 0;
    i.ТекущееКоличество = 0;
    i.ТекущееКоличествоВЕдиницахИзмерения = 0;
    i.Артикул = "";
    i.Номенклатура.ЕдиницаИзмерения = { Наименование: "" };
    for (y of prod_list) {
      if (
        i.Номенклатура.Наименование === y.Номенклатура.Наименование &&
        i.Характеристика.Наименование === y.Характеристика.Наименование
      ) {
        i.Номенклатура.ЕдиницаИзмерения = y.Номенклатура.ЕдиницаИзмерения;
        i.ТекущееКоличество += y.Количество;
        i.ТекущееКоличество = rounded(i.ТекущееКоличество);
        i.Артикул = y.Артикул;
        i.ПЛУ = y.ПЛУ;
        i.ТекущееКоличествоВЕдиницахИзмерения += y.КоличествоВЕдиницахИзмерения;
        i.ТекущееКоличествоВЕдиницахИзмерения = rounded(
          i.ТекущееКоличествоВЕдиницахИзмерения
        );
        if (i.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
          i.ТекущееКоличествоВЕдиницахИзмерения = rounded(
            i.ТекущееКоличествоВЕдиницахИзмерения,
            0
          );
        }
        i.КоличествоВЕдиницахИзмерения =
          i.Количество / rounded(y.Номенклатура.ВесЧислитель);
        i.КоличествоВЕдиницахИзмерения = rounded(i.КоличествоВЕдиницахИзмерения);
        i.КоличествоКоробок += y.Грузоместа;
        //this.box_count+=y.Грузоместа
        y.ВЗаказе = true;
      }
    }
  }

  // Сортировка
  this.all_item.sort((a, b) => {
    a.Артикул - b.Артикул;
  });

  for (i of this.all_item) {
    ВПроцСоотношении = Math.round(
      (100 / i.КоличествоУпаковок) * i.ТекущееКоличествоВЕдиницахИзмерения
    );
    if (String(ВПроцСоотношении) === "NaN") {
      ВПроцСоотношении = 0;
    }
    if (ВПроцСоотношении === 100) {
      i.cls = " alert alert-success ";
    }
    if (ВПроцСоотношении > 100) {
      i.cls = " alert alert-warning ";
      this.КвантыНеСоблюдены = true;
    }
    if (ВПроцСоотношении < 100) {
      i.cls = " alert alert-info ";
    }
    if (ВПроцСоотношении === 0) {
      i.cls = " alert alert-danger ";
    }
    if (ВПроцСоотношении > 110) {
      i.cls = " alert alert-orange ";
    }
    i.ВПроцСоотношении = ВПроцСоотношении;
    //this.weight_count+=i.ТекущееКоличество
  }
  //this.weight_count=rounded(this.weight_count)
  if (
    this.all_item.filter((i) => i.cls === " alert alert-success ").length ===
    this.all_item.length
  ) {
    doc = GetData("prod_doc", "j");
    doc.completed = true;
    SetData("prod_doc", doc);
  } else {
    doc = GetData("prod_doc", "j");
    doc.completed = false;
    SetData("prod_doc", doc);
  }

  //this.item_from_send=arr_item;
  // заполняем массив для отправки номенкл хар серия
  for (i of scaning) {
    i.ТекущееКоличество = 0;
    i.ТекущееКоличествоВЕдиницахИзмерения = 0;
    Грузоместа = 0;
    for (y of prod_list) {
      if (
        i.Номенклатура.Наименование === y.Номенклатура.Наименование &&
        i.Характеристика.Наименование === y.Характеристика.Наименование &&
        i.Серия.Наименование === y.Серия.Наименование
      ) {
        Грузоместа += y.Грузоместа;
        i.ТекущееКоличество += rounded(y.Количество); //Number(prod_list[y].Количество.toFixed(3))
        i.ТекущееКоличествоВЕдиницахИзмерения += rounded(y.КоличествоВЕдиницахИзмерения);
        if (i.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
          i.ТекущееКоличествоВЕдиницахИзмерения = rounded(
            i.ТекущееКоличествоВЕдиницахИзмерения,
            0
          );
        }
      }
    }
    i.Грузоместа = Грузоместа;
  }
  this.item_from_send = scaning;
}
*/
</script>
