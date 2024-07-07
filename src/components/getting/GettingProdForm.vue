<template>
  <!-- Форма сканирования для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <div class="row">
      <div class="col-9">
        <h4 class="text-muted">{{ docName }}</h4>
      </div>
      <div class="col-3">
        <h5>кол. {{ countScaning }}</h5>
        <h5>г/м. {{ boxInOrder }}</h5>
      </div>
    </div>
    <BootstrapSwitcher label="Палетная" v-model:value="itPalet" @update="(x) => {}" />
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter"
      id="getting_prod_form_bc"
    />

    <div class="space">
      <!--<div id="getting_prod_list"></div>-->
      <GettingProdFormItem
        v-for="item in items"
        :key="item.ID"
        :data="item"
        @delete="itemDelete"
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
</template>
<script setup lang="ts">
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import GettingProdFormItem from "./widgets/GettingProdFormItem.vue";
import { DBManager } from "@/classes/DBManager";
import { HttpManager } from "@/classes/HttpManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { Date1C } from "@/functions/Date1C";
import { FindGM } from "@/functions/FindGruzoMesta";
import { GetCount } from "@/functions/GetCount";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { I1CObject } from "@/interfaces/IDocument";
import { GettingManager } from "@/managers/getting/GettingManager";
import { UserManager } from "@/managers/user/UserManager";
import { computed, ref } from "vue";
import { IScaning } from "@/interfaces/IScaning";
RoutingManager.instance.registry(RoutingManager.route.gettingProductionForm, show, close);
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

const boxInOrder = computed(() =>
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

async function addManualScaning() {
  // HandAddItem.Show('prod_list')
  const result = await ScanerManager.showAddManualScaningForm();
  if (result) {
    onScan(result);
  }
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

async function onScan(barcode: string) {
  // const result = PodgotovitBarcode(barcode)
  // if(!result.success){
  //     console.error(result.data)
  //     NotificationManager.swal(result.data)
  //     throw result.data
  // }
  const barcodeValue = barcode;

  if (barcodeValue === "") {
    return;
  }

  const Штрихкод = barcodeValue.slice(2, 16);
  const Количество = Number(barcodeValue.slice(20, 26)) / 1000;
  const ДатаПроизводства = barcodeValue.slice(28, 34);
  const ГоденДо = barcodeValue.slice(36, 42);

  const Структура = {
    Штрихкод: Штрихкод,
    Количество: Количество,
    ДатаПроизводства: ДатаПроизводства,
    ГоденДо: ГоденДо,
  };

  if (UserManager.instance.useLocalDb) {
    const barcodeFromDB = await DBManager.getFileAsync(
      Структура.Штрихкод,
      "barcodes",
      "barcodes"
    );
    if (barcodeFromDB) {
      barcodeFromDB.data.Штрихкод = Структура.Штрихкод;
      barcodeFromDB.data.bc = barcodeValue;
      checkScaningGetting(
        barcodeFromDB.data,
        Структура.Количество,
        Структура.ДатаПроизводства,
        Структура.ГоденДо
      );
    } else {
      NotificationManager.swal("Продукция с таким штрих кодом не найдена");
      return;
    }
    //   getFile(Структура.Штрихкод, (res) => {
    //     if (res === -1) {
    //       swal('Продукция с таким штрих кодом не найдена')
    //       return
    //     }
    //     res.data.Штрихкод = Структура.Штрихкод;
    //     res.data.bc = bc;
    //     CheckScaningGetting(getting_prod_form, res.data, Структура.Количество, Структура.ДатаПроизводства, Структура.ГоденДо)
    //   }, '1c', 'barcodes')
  } else {
    const loadDoc = GettingManager.instance.currentDocument.value!;
    const params = {
      barcode: barcodeValue,
      Наименование: loadDoc.Наименование,
      Тип: loadDoc.Ссылка.Тип,
      Вид: loadDoc.Ссылка.Вид,
      Ссылка: loadDoc.Ссылка.Ссылка,
    };
    const httpResult = await HttpManager.get("/scaning_barcode", params);
    if (httpResult.success) {
      if (httpResult.data.РезультатПроверки) {
        const СтруктураШК = { Ссылка: httpResult.data };
        checkScaningGetting(СтруктураШК, Количество, ДатаПроизводства, ГоденДо);
      } else {
        NotificationManager.swal(httpResult.data.Текст);
        //this.show()
        //soundClick("resurse/ERROR.mp3")
        NotificationManager.instance.playError();
      }
    } else {
      NotificationManager.swal(JSON.stringify(httpResult.error));
      //this.show()
    }
    //   axios.get(getUrl('/scaning_barcode'), {
    //     params: params
    //   })
    //     .then((response) => {
    //       if (response.data.РезультатПроверки) {
    //         СтруктураШК = { Ссылка: response.data }
    //         CheckScaning(this, СтруктураШК, Количество, ДатаПроизводства, ГоденДо)
    //       } else {
    //         swal(response.data.Текст)
    //         this.show()
    //         soundClick("resurse/ERROR.mp3")
    //       }
    //     }).catch((error) => {
    //       swal(JSON.stringify(error))
    //       this.show()
    //     })
  }
  //boxInOrder.value = GetCount(prod_list, 'Грузоместа')
}

function checkScaningGetting(
  СтруктураШК: any,
  Количество: number,
  ДатаПроизводства: string,
  ГоденДо: string
) {
  const bc = СтруктураШК.bc;
  let Грузоместа = 1;
  let Палетная = "alert alert-info";
  const prodDoc = GettingManager.instance.currentDocument.value!;

  //text = ''

  const Серия: I1CObject = {
    Наименование: Date1C(ДатаПроизводства, ГоденДо),
    Ссылка: `${ДатаПроизводства}${ГоденДо}`,
  };
  const ЕдИзмСтр = СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование;

  const curNomStr = `${СтруктураШК.Ссылка.Номенклатура.Наименование}\n${СтруктураШК.Ссылка.Характеристика.Наименование}\n${Серия.Наименование}`;

  if (itPalet.value == true) {
    Грузоместа = FindGM(bc);
    Палетная = "alert alert-warning";
    itPalet.value = false;
  }
  //debugger
  //this.prod_doc = GetData('prod_doc', 'j')

  const inOrder =
    prodDoc.Товары.filter(
      (item) =>
        СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование &&
        СтруктураШК.Ссылка.Характеристика.Наименование == item.Характеристика.Наименование
    ).length > 0
      ? true
      : false;

  const ЧтоЕсть = prodDoc.Товары.filter(
    (item) =>
      СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование
  );

  // in_order = in_order.length > 0 ? true : false

  if (!inOrder) {
    //
    let text = `Продукции \n\n ${СтруктураШК.Ссылка.Номенклатура.Наименование} ${СтруктураШК.Ссылка.Характеристика.Наименование} ПЛУ: ${СтруктураШК.Ссылка.ПЛУ} \n\n нет в заказе`;
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
    return;
  }

  // const validationPropertyData = WeightManager.instance.validationProperty(СтруктураШК.Ссылка.Характеристика, Количество)
  // if(!validationPropertyData.isValid){
  //   const text = `Прием\n\n${curNomStr}\n\nнарушает условия по весу характеристики
  //   \nТекущий вес: ${validationPropertyData.currentCount} ${ЕдИзмСтр}
  //   \nРазрешенный вес Характеристики: ${validationPropertyData.validCount} ${ЕдИзмСтр}`
  //   NotificationManager.swal(text);
  //   NotificationManager.instance.playError()
  //   return
  // }

  // const isValidWeight = WeightManager.instance.isValid(
  //     prodDoc.Ссылка.Ссылка,
  //   СтруктураШК.Ссылка.Номенклатура.Ссылка.Ссылка,
  //   СтруктураШК.Ссылка.Характеристика.Ссылка.Ссылка,
  //   Серия.Наименование,
  //   Количество)
  // if (!isValidWeight) {
  //   const curMaxWeight = WeightManager.instance.getMaxWeight(
  //     prodDoc.Ссылка.Ссылка,
  //     СтруктураШК.Ссылка.Номенклатура.Ссылка.Ссылка,
  //     СтруктураШК.Ссылка.Характеристика.Ссылка.Ссылка,
  //     Серия.Наименование,
  //   )
  //   const curWeight = WeightManager.instance.getCurrentWeight(
  //     prodDoc.Ссылка.Ссылка,
  //     СтруктураШК.Ссылка.Номенклатура.Ссылка.Ссылка,
  //     СтруктураШК.Ссылка.Характеристика.Ссылка.Ссылка,
  //     Серия.Наименование,
  //   )
  //   const text = `Прием\n\n${curNomStr}\n\nдалее не возможен, так как присутствует превышение по весу\n\nТекущий вес ${curWeight} кг.\nДопустимый вес заказа ${curMaxWeight} кг.`
  //   NotificationManager.swal(text);
  //   NotificationManager.instance.playError()
  //   return
  // }

  const КоличествоВЕдиницахИзмерения = GetCountFromBarcode(
    СтруктураШК,
    Грузоместа,
    Количество
  );
  /*if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1]!==undefined && СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование==="шт") {
      if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Свойство.Наименование==="Количество(хар)") {
  
        //КоличествоВЕдиницахИзмерения = СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Значение * Количество*(СтруктураШК.Ссылка.Номенклатура.ВесЧислитель/СтруктураШК.Ссылка.Номенклатура.ВесЗнаменатель);
        КоличествоВЕдиницахИзмерения = СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Значение * Грузоместа;
      }
    }*/

  const response = {
    IDSec: Date.now(),
    ID: "",
    Номенклатура: СтруктураШК.Ссылка.Номенклатура,
    Характеристика: СтруктураШК.Ссылка.Характеристика,
    ПЛУ: СтруктураШК.Ссылка.ПЛУ === undefined ? "" : СтруктураШК.Ссылка.ПЛУ,
    Серия: Серия,
    Количество: Количество,
    КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
    ЕдиницаИзмерения: СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
    Артикул: СтруктураШК.Ссылка.Номенклатура.Артикул,
    Грузоместа: Грузоместа,
    Палетная: Палетная,
    bc: bc,
  };
  //response.IDSec = response.ID + Date.now();
  GettingManager.instance.addScaning(response);
  // prodList.unshift(response);
  // SetData("prod_list", prod_list);

  // WeightManager.instance.add(
  //     prodDoc.Ссылка.Ссылка,
  //   СтруктураШК.Ссылка.Номенклатура.Ссылка.Ссылка,
  //   СтруктураШК.Ссылка.Характеристика.Ссылка.Ссылка,
  //   Серия.Наименование,
  //   Количество
  // )
  const prodList = GettingManager.instance.currentScanings.value;
  if (prodList.length > 1) {
    if (prodList[1].bc === bc) {
      //soundClick("resurse/REPEAT_ARIAL.mp3")
      NotificationManager.instance.playRepeatArial();
    } else {
      //soundClick("resurse/GOOD.mp3")
      NotificationManager.instance.playGood();
    }
  } else {
    //soundClick("resurse/GOOD.mp3")
    NotificationManager.instance.playGood();
  }
  //getting_prod_form.render()
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
