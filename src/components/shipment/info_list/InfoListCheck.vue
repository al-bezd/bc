<template>
  <!-- Форма проверки сканирования (без документа)-->
  <div class="reft_screen_form p-1" v-if="seen">
    <h6 class="text-center">Создание Инфо. листа: Проверка</h6>

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
        <div class="">
          <div class="mb-1">
            <label for="Склад" class="form-label">Склад</label>
            <select
              class="form-control"
              id="Склад"
              v-model="selectedSklad"
              @change="
                () => {
                  DB2Manager.setData(selectedSkladKey, toRaw(selectedSklad));
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

        <div class="">
          <div class="mb-1">
            <label for="Сеть" class="form-label">Сеть</label>
            <select
              class="form-control"
              id="Сеть"
              v-model="selectedTorgovayaSet"
              @change="
                () => {
                  DB2Manager.setData(
                    selectedTorgovayaSetKey,
                    toRaw(selectedTorgovayaSet)
                  );
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

        <div class="row g-2 mb-1">
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
      <ListWidget key-field="key" :list="groupedScans">
        <template #default="{ item }">
          <ScaningGroupItem
            :data="item"
            :key="item.key"
            :mode="currentMode"
            :show-procent="false"
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

    <div>
      <div class="">
        <h6>
          <b>Итог {{ boxCount }} Коробок</b>
        </h6>
        <h6>
          <b>Итог {{ weightCount }} Кг. </b>
        </h6>
      </div>

      <div class="btn-group w-100" role="group">
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
          class="btn btn-success text-uppercase fs-6"
          @click="saveIn1C()"
        >
          <b>СОХРАНИТЬ В 1С</b>
        </button>
      </div>
    </div>
  </div>

  <FilteredByArticulScreen
    :controller="filteredByArticulController"
    @delete="itemDelete"
  />
  <!-- Форма проверки сканирования (без документа)-->
</template>
<script setup lang="ts">
import { Ref, computed, ref, toRaw } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import FilteredByArticulScreen from "@/components/modals/FilteredByArticulScreen.vue";
import ScaningGroupItem from "@/components/widgets/ScaningGroupItem.vue";
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
import { DB2Manager } from "@/classes/DB2Manager";
import ListWidget from "@/components/widgets/ListWidget.vue";
import { GetCount } from "@/functions/GetCount";

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
  return GetCount(groupedScans.value, "КоличествоКоробок");
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
  return GetCount(groupedScans.value, "КоличествоВЕдиницахИзмерения");
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

  const selectedSetRes = await DB2Manager.getData<IDocument | null>(
    selectedTorgovayaSetKey
  );
  if (selectedSetRes) {
    selectedTorgovayaSet.value = selectedSetRes;
  }

  const selectedSkladRes = await DB2Manager.getData<IDocument | null>(selectedSkladKey);
  if (selectedSkladRes) {
    selectedSklad.value = selectedSkladRes;
  }

  initGroupList();
}

function initGroupList() {
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
  //console.log(error);
  NotificationManager.error(error);
}

function clear() {
  groupedScans.value = [];

  ShipmentManager.instance.setCurrentScanings([]);
  selectedSklad.value = null;
  DB2Manager.removeData(selectedSkladKey);
  selectedTorgovayaSet.value = null;
  DB2Manager.removeData(selectedTorgovayaSetKey);
  НомерПоддона.value = "";
  ВесПоддона.value = 0;

  LocalStorageManager.remove(currentModeKey);
  LocalStorageManager.remove(settingsIsShowKey);
}

ShipmentManager.instance.connect("InfoListClear", () => {
  clear();
});

async function itemDelete(item: IScaning) {
  const text = `Вы уверены что хотите удалить  ${item.Номенклатура.Наименование}
      ${item.Характеристика.Наименование} ${item.Серия.Наименование} ${item.Количество}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    ShipmentManager.instance.deleteScaning(item).then(() => {
      initGroupList();
      filteredByArticulController.emit("afterDelete");
    });
  }
}
</script>
