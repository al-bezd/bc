<template>
  <!-- Форма проверки сканирования (без документа)-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Проверка</h4>
    <ModeWidget :mode="currentMode" @tap="showWithMode" />

    <div :class="`alert alert-${ifSettingsFilled ? 'success' : 'danger'}`">
      <div class="w-100" style="display: flex; flex-direction: row-reverse">
        <div
          role="button"
          @click="
            () => {
              settingsIsShow = !settingsIsShow;
              LocalStorageManager.set(settingsIsShowKey, settingsIsShow);
            }
          "
        >
          <p v-if="settingsIsShow" class="badge bg-success mb-0">Свернуть</p>
          <p v-else class="badge bg-success mb-0">Развернуть</p>
        </div>
        <p class="w-100 mb-0">Настройки</p>
      </div>
      <div v-if="settingsIsShow">
        <div class="col-12">
          <div class="mb-3">
            <label for="Склад" class="form-label">Склад</label>
            <select
              class="form-control"
              id="Склад"
              v-model="selectedSklad"
              @change="
                () => {
                  DBManager.setData(selectedSkladKey, toRaw(selectedSklad));
                }
              "
            >
              <option
                v-for="item in sklads"
                :key="item.Ссылка.Ссылка"
                selected
                :value="item"
              >
                {{ item.Наименование }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="space">
      <ScaningGroupItem
        v-for="item in groupedScans"
        :data="item"
        :key="item.Номенклатура.Ссылка.Ссылка"
        :mode="currentMode"
        :show-procent="false"
        @tap="openThisArticul(item)"
      />
    </div>

    <div>
      <div class="col-md-12 col-sm-12 col-xs-12">
        <h5>
          <b>Итог {{ boxCount }} Коробок</b>
        </h5>
        <h5>
          <b>Итог {{ weightCount }} Кг. </b>
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
          @click="saveIn1C()"
        >
          <b>СОХРАНИТЬ В 1С</b>
        </button>
      </div>
    </div>
  </div>
  <BootstrapModalWindow v-model:seen="modalIsSeen">
    <div class="col-12">
      <span
        >Коробок <b>{{ CountThisArticul }}</b> Шт.</span
      >

      <div class="space">
        <ScaningGroupItem
          v-for="item in groupedScansFilteredByName"
          :data="item"
          :key="item.Номенклатура.Ссылка.Ссылка"
          :mode="currentMode"
          :show-procent="false"
        />
        <!-- <div v-for="item in groupedScansFilteredByName" :key="item.IDSec">
              <scaning-tmp v-bind:item="item" obj="'check_doc_free'"></scaning-tmp>
            </div> -->
      </div>

      <button
        type="button"
        class="btn btn-primary btn-lg text-uppercase w-100"
        @click="
          () => {
            modalIsSeen = !modalIsSeen;
          }
        "
        tabindex="-1"
      >
        <b>НАЗАД</b>
      </button>
    </div>
  </BootstrapModalWindow>
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
import { IScaning, IScaningGroup } from "@/interfaces/IScaning";
import { MainManager } from "@/classes/MainManager";
import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { StringToBool } from "@/functions/StringToBoolean";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentReflectionStoreCheck,
  show,
  close
);

const sklads: Ref<IDocument[]> = ref([]);
const selectedSkladKey = RoutingManager.instance.currentScreen + "selectedSklad";
const selectedSklad: Ref<IDocument | null> = ref(null);

const settingsIsShowKey = RoutingManager.instance.currentScreen + "settingsIsShow";
const settingsIsShow = ref(true);

const currentModeKey = RoutingManager.instance.currentScreen + "currentMode";
const currentMode: Ref<RowKeyMode> = ref("НомХарСер");

const seen = ref(false);

const modalIsSeen = ref(false);

const groupedScans: Ref<IScaningGroup[]> = ref([]);
const groupedScansFilteredByName: Ref<IScaningGroup[]> = ref([]);
// scaning_free

const isSaveStart = ref(false);

const boxCount = computed(() => {
  return groupedScans.value.reduce((sum, scan) => sum + scan.Грузоместа, 0);
});

const CountThisArticul = computed(() => {
  return groupedScansFilteredByName.value.length;
});

const ifSettingsFilled = computed(() => {
  return selectedSklad.value !== null;
});

const weightCount = computed(() => {
  return groupedScans.value.reduce(
    (sum, scan) => sum + scan.КоличествоВЕдиницахИзмерения,
    0
  );
});

async function afterShow() {
  settingsIsShow.value =
    StringToBool(LocalStorageManager.get(settingsIsShowKey)) ?? false;

  currentMode.value = LocalStorageManager.get(currentModeKey) ?? "НомХарСер";

  const mainStoreRes = await MainManager.instance.local.mainStore();
  if (mainStoreRes) {
    sklads.value = [mainStoreRes];
  }

  const selectedSkladRes = await DBManager.getData(selectedSkladKey);
  if (selectedSkladRes) {
    selectedSklad.value = selectedSkladRes;
  }

  groupedScans.value = GetGroupScans(
    ShipmentManager.instance.currentScanings.value,
    currentMode.value
  );
}

function show() {
  seen.value = true;
  afterShow();
}

function close() {
  seen.value = false;
}

function exit() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentReflectionStoreForm);
}

function showWithMode(mode: RowKeyMode) {
  currentMode.value = mode;
  LocalStorageManager.set(currentModeKey, currentMode.value);
  groupedScans.value = GetGroupScans(
    ShipmentManager.instance.currentScanings.value,
    currentMode.value
  );
}

function openThisArticul(scan: IScaningGroup) {
  groupedScansFilteredByName.value = groupedScans.value.filter((x: IScaningGroup) => {
    return x.Номенклатура.Ссылка === scan.Номенклатура.Ссылка;
  });
  modalIsSeen.value = true;
}

async function saveIn1C() {
  if (!ifSettingsFilled.value) {
    NotificationManager.error("Не все данные заполнены");
    return;
  }
  if (isSaveStart.value) {
    return;
  }

  let params: any = {
    Склад: selectedSklad.value?.Наименование,
    scaning: ShipmentManager.instance.currentScanings.value.map((i) => toRaw(i)), //scaning_response_free,
    Пользователь: toRaw(UserManager.instance.user.value),
    ID: "" + Date.now(),
  };

  params.save_in_1c = true;
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
  const error = (response as IResponse).error;
  console.log(error);
  NotificationManager.error(error);
}

function clear() {
  groupedScans.value = [];
  groupedScansFilteredByName.value = [];
  ShipmentManager.instance.setCurrentScanings([]);
  selectedSklad.value = null;
  DBManager.deleteDatabase(selectedSkladKey);
  LocalStorageManager.remove(currentModeKey);
  LocalStorageManager.remove(settingsIsShowKey);
}

ShipmentManager.instance.connect("ReflectionStoreClear", () => {
  clear();
});
</script>
