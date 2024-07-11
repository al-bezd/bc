<template>
  <!-- Форма проверки сканирования (без документа)-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Проверка</h4>
    <div class="btn-group w-100 mb-3" role="group">
      <button
        :class="`btn btn-primary text-uppercase ${
          currentMode == 'НомХар' ? 'disabled' : ''
        }`"
        @click="showWithMode('НомХар')"
      >
        НОМ+ХАР
      </button>

      <button
        :class="`btn btn-primary text-uppercase ${
          currentMode == 'НомХарСер' ? 'disabled' : ''
        }`"
        @click="showWithMode('НомХарСер')"
      >
        НОМ+ХАР+СЕР
      </button>
    </div>

    <div class="col-12">
      <small>Склад</small>
      <select class="form-control" v-model="selectedSklad">
        <!-- v-if="isFirst < string > (item, sklads)"
      <option v-for="item in sklads" v-else :value="item">
          {{ item }}
        </option>
      
      -->
        <option v-for="item in sklads" :key="item" selected :value="item">
          {{ item }}
        </option>
      </select>
    </div>

    <div class="col-12 mb-3">
      <small>Сеть</small>
      <select class="form-control" v-model="selectedTorgovayaSet">
        <!-- v-if="isFirst < IDocument > (item, torgovieSeti)"-->
        <!--<option v-for="item in torgovieSeti" v-else :value="item">
          {{ item.Наименование }}
        </option>-->
        <option
          v-for="item in torgovieSeti"
          selected
          :key="item.Ссылка.Ссылка"
          :value="item"
        >
          {{ item.Наименование }}
        </option>
      </select>
      <small>Номер поддона</small>
      <input type="text" class="form-control" v-model="НомерПоддона" />
      <small>Вес поддона</small>
      <input type="number" class="form-control" v-model="ВесПоддона" />
    </div>

    <div class="space">
      <ScaningGroupItem
        v-for="item in groupedScans"
        :data="item"
        :key="item.Номенклатура.Ссылка"
        @tap="openThisArticul(item)"
      />
    </div>

    <div>
      <div class="col-md-12 col-sm-12 col-xs-12">
        <h5>
          <b>Итог {{ box_count_free }} Коробок</b>
        </h5>
        <h5>
          <b>Итог {{ weight_count_free }} Кг. </b>
        </h5>
      </div>

      <div class="btn-group w-100 mb-3" role="group">
        <button
          type="button"
          class="btn btn-primary btn-lg text-uppercase fs-6"
          @click="exit()"
          tabindex="-1"
        >
          <b>НАЗАД</b>
        </button>

        <button
          type="button"
          class="btn btn-success btn-lg text-uppercase fs-6"
          @click="saveIn1C('ИнфоЛист')"
        >
          <b>СОХРАНИТЬ В 1С</b>
        </button>
      </div>
    </div>

    <BootstrapModalWindow v-model:seen="modalIsSeen">
      <div class="col-12">
        <span
          >Коробок <b>{{ CountThisArticul_free }}</b> Шт.</span
        >

        <div class="space">
          <ScaningGroupItem
            v-for="item in groupedScansFilteredByName"
            :data="item"
            :key="item.Номенклатура.Ссылка"
            @tap="openThisArticul(item)"
          />
          <!-- <div v-for="item in groupedScansFilteredByName" :key="item.IDSec">
            <scaning-tmp v-bind:item="item" obj="'check_doc_free'"></scaning-tmp>
          </div> -->
        </div>

        <button
          type="button"
          class="btn btn-primary btn-lg text-uppercase"
          @click="show"
          tabindex="-1"
        >
          <b>НАЗАД</b>
        </button>
      </div>
    </BootstrapModalWindow>
  </div>
  <!-- Форма проверки сканирования (без документа)-->
</template>
<script setup lang="ts">
import { Ref, computed, ref, toRaw } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";

import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { DBManager } from "@/classes/DBManager";
import { IDocument } from "@/interfaces/IDocument";
import { GetGroupScans, RowKeyMode } from "@/functions/GetGroupScans";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { UserManager } from "@/managers/user/UserManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { HttpManager, IResponse } from "@/classes/HttpManager";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentCreateInfoListCheck,
  show,
  close
);
const torgovieSeti: Ref<IDocument[]> = ref([]);
const selectedTorgovayaSet: Ref<IDocument | null> = ref(null);
const sklads: Ref<string[]> = ref([]);
const selectedSklad: Ref<string> = ref("");

const НомерПоддона = ref("");
const ВесПоддона = ref(0);
const seen = ref(false);

const modalIsSeen = ref(false);
const CountThisArticul_free = ref(0);

const groupedScans: Ref<any[]> = ref([]);
const groupedScansFilteredByName: Ref<any[]> = ref([]);
// scaning_free

const box_count_free = computed(() => {
  return 0;
});

const weight_count_free = computed(() => {
  return 0;
});

function show() {
  seen.value = true;

  DBManager.getData("torgovie_seti").then((res) => {
    torgovieSeti.value = res;
  });
}

function exit() {
  clear();
  close();
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCreateInfoListForm);
}

function close() {
  seen.value = false;
}

const nx_status = ref("disabled");
const nxc_status = ref("");

const currentMode: Ref<RowKeyMode> = ref("НомХарСер");

function showWithMode(mode: RowKeyMode) {
  currentMode.value = mode;
  groupedScans.value = GetGroupScans(
    ShipmentManager.instance.currentScanings.value,
    mode
  );
}

function openThisArticul(scan: any) {
  modalIsSeen.value = true;
}

const isSaveStart = ref(false);

async function saveIn1C(mode: string) {
  if (isSaveStart.value) {
    return;
  }

  let params: any = {
    Склад: selectedSklad.value,
    scaning: [], //scaning_response_free,
    Пользователь: toRaw(UserManager.instance.user.value),
    ID: "" + Date.now(),
  };
  if (mode === "ИнфоЛист") {
    if (
      НомерПоддона.value === "" ||
      ВесПоддона.value == 0 ||
      selectedSklad.value === "" ||
      selectedTorgovayaSet.value === null
    ) {
      isSaveStart.value = false;
      NotificationManager.swal("Не все параметры заполнены");
      return;
    }
    params.save_in_1c_info_sheets = true;
    params.Сеть = toRaw(selectedTorgovayaSet.value);
    params.НомерПоддона = НомерПоддона.value;
    params.ВесПоддона = ВесПоддона.value;
  } else if (mode === "Остатки") {
    params.save_in_1c = true;
  }
  isSaveStart.value = true;
  //$('#button_save_in_1c').hide()
  const response: IResponse = await HttpManager.post("/execute", params);
  isSaveStart.value = false;
  if (response) {
    NotificationManager.swal(response.data.Текст);
    clear();
    RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
    return;
  }
  console.log(response.error);
  NotificationManager.error(String(response.error));
}

function clear() {
  ShipmentManager.instance.setCurrentScanings([]);
  selectedTorgovayaSet.value = null;
  НомерПоддона.value = "";
  ВесПоддона.value = 0;
}
</script>
