<template>
  <!-- Форма проверки сканирования (без документа)-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4 class="text-center">Создание Инфо. листа: Проверка</h4>

    <!-- <ModeWidget :mode="currentMode" @tap="showWithMode" /> -->
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

        <div class="col-12">
          <div class="mb-3">
            <label for="Сеть" class="form-label">Сеть</label>
            <select
              class="form-control"
              id="Сеть"
              v-model="selectedTorgovayaSet"
              @change="
                () => {
                  DBManager.setData(selectedTorgovayaSetKey, toRaw(selectedTorgovayaSet));
                }
              "
            >
              <option
                v-for="item in torgovieSeti"
                selected
                :key="item.Ссылка.Ссылка"
                :value="item"
              >
                {{ item.Наименование }}
              </option>
            </select>
          </div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6">
            <label for="НомерПоддона" class="form-label">Номер поддона</label>
            <input
              type="text"
              class="form-control"
              id="НомерПоддона"
              v-model="НомерПоддона"
            />
          </div>
          <div class="col-6">
            <label for="ВесПоддона" class="form-label">Вес поддона</label>
            <input
              type="number"
              class="form-control"
              id="ВесПоддона"
              v-model="ВесПоддона"
            />
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
        @tap="
          () => {
            filteredByArticulController.filter(item);
            filteredByArticulController.show();
          }
        "
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
          class="btn btn-primary text-uppercase fs-6"
          @click="exit()"
          tabindex="-1"
        >
          <b>НАЗАД</b>
        </button>

        <button
          type="button"
          class="btn btn-success  text-uppercase fs-6"
          @click="saveIn1C()"
        >
          <b>СОХРАНИТЬ В 1С</b>
        </button>
      </div>
    </div>
  </div>

  <FilteredByArticulScreen :controller="filteredByArticulController" />
  <!-- Форма проверки сканирования (без документа)-->
</template>
<script setup lang="ts">
import { Ref, computed, ref, toRaw } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";

import ModeWidget from "@/components/widgets/ModeWidget.vue";
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
import { FilteredByArticulController } from "@/controllers/FilteredByArticulController";

RoutingManager.instance.registry(
  RoutingManager.route.shipmentCreateInfoListCheck,
  show,
  close
);

const filteredByArticulController: FilteredByArticulController = new FilteredByArticulController(
  ShipmentManager.instance.currentScanings,
  ref("НомХар")
);

const torgovieSeti: Ref<IDocument[]> = ref([]);
const sklads: Ref<IDocument[]> = ref([]);

const selectedTorgovayaSetKey =
  RoutingManager.instance.currentScreen + "selectedTorgovayaSet";
const selectedTorgovayaSet: Ref<IDocument | null> = ref(null);

const selectedSkladKey = RoutingManager.instance.currentScreen + "selectedSklad";
const selectedSklad: Ref<IDocument | null> = ref(null);

const settingsIsShowKey = RoutingManager.instance.currentScreen + "settingsIsShow";
const settingsIsShow = ref(true);

const currentModeKey = RoutingManager.instance.currentScreen + "currentMode";
const currentMode: Ref<RowKeyMode> = ref("НомХарСер");

const НомерПоддона = ref("");
const ВесПоддона = ref(0);
const seen = ref(false);

const groupedScans: Ref<IScaningGroup[]> = ref([]);

// scaning_free

const isSaveStart = ref(false);

const boxCount = computed(() => {
  return groupedScans.value.reduce((sum, scan) => sum + scan.Грузоместа, 0);
});

const ifSettingsFilled = computed(() => {
  return (
    НомерПоддона.value !== "" &&
    ВесПоддона.value !== 0 &&
    selectedSklad.value !== null &&
    selectedTorgovayaSet.value !== null
  );
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

  const res = await MainManager.instance.local.torgovieSeti();
  if (res) {
    torgovieSeti.value = res;
  }

  const mainStoreRes = await MainManager.instance.local.mainStore();
  if (mainStoreRes) {
    sklads.value = [mainStoreRes];
  }

  const selectedSetRes = await DBManager.getData(selectedTorgovayaSetKey);
  if (selectedSetRes) {
    selectedTorgovayaSet.value = selectedSetRes;
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
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCreateInfoListForm);
}

function showWithMode(mode: RowKeyMode) {
  currentMode.value = mode;
  LocalStorageManager.set(currentModeKey, currentMode.value);
  groupedScans.value = GetGroupScans(
    ShipmentManager.instance.currentScanings.value,
    currentMode.value
  );
}

async function saveIn1C() {
  if (isSaveStart.value) {
    return;
  }

  let params: any = {
    Склад: selectedSklad.value?.Наименование,
    scaning: ShipmentManager.instance.currentScanings.value.map((i) => toRaw(i)), //scaning_response_free,
    Пользователь: toRaw(UserManager.instance.user.value),
    ID: "" + Date.now(),
  };
  if (
    НомерПоддона.value === "" ||
    ВесПоддона.value == 0 ||
    selectedSklad.value === null ||
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

  ShipmentManager.instance.setCurrentScanings([]);
  selectedSklad.value = null;
  DBManager.deleteDatabase(selectedSkladKey);
  selectedTorgovayaSet.value = null;
  DBManager.deleteDatabase(selectedTorgovayaSetKey);
  НомерПоддона.value = "";
  ВесПоддона.value = 0;

  LocalStorageManager.remove(currentModeKey);
  LocalStorageManager.remove(settingsIsShowKey);
}

ShipmentManager.instance.connect("InfoListClear", () => {
  clear();
});
</script>
