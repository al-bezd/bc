<template>
  <BootstrapModalWindow :seen="seen">
    <template v-slot:header>
      <div class="modal-header">
        <h6 class="modal-title text-center">{{ addOrders.Заголовок }}</h6>
      </div>
    </template>

    <div class="row">
      <div class="col-6">
        <div class="form-group">
          <label for="ДатаНачала" class="control-label">Дата начала</label>
          <DatePicker id="ДатаНачала" v-model:date="addOrders.ДатаНачала" />
          <!-- <input
          type="date"
          class="form-control"
          id="ДатаНачала"
          v-model="addOrders.ДатаНачала"
        /> -->
        </div>
      </div>
      <div class="col-6">
        <div class="form-group">
          <label for="ДатаОкончания" class="control-label">Дата окончания</label>
          <DatePicker id="ДатаОкончания" v-model:date="addOrders.ДатаОкончания" />
          <!-- <input
          type="date"
          class="form-control"
          id="ДатаОкончания"
          v-model="addOrders.ДатаОкончания"
        /> -->
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="Склад" class="control-label">Склад</label>
      <input
        disabled
        type="text"
        class="form-control"
        id="Склад"
        :value="addOrders.СкладНаименование"
      />
    </div>

    <div class="d-grid gap-2">
      <button
        type="button"
        class="btn btn-primary btn-block text-uppercase"
        @click="LoadOrdersExecute(MainManager.keys.orders)"
      >
        <b>Загрузить заказы</b>
      </button>
      <button
        type="button"
        class="btn btn-primary btn-block text-uppercase"
        @click="
          () => {
            isLoadingOrders = true;
            LoadOrdersExecute(MainManager.keys.infoSheets).then(() => {
              isLoadingOrders = false;
            });
          }
        "
      >
        <b>Загрузить инфо. листы</b>
      </button>
    </div>
    <div class="space"></div>
    <button
      type="button"
      class="btn btn-warning btn-block text-uppercase"
      data-dismiss="modal"
      @click="close()"
    >
      <b>Закрыть</b>
    </button>
  </BootstrapModalWindow>
  <div
    class="reft_modal"
    v-show="isLoadingOrders"
    style="
      background: rgba(1, 1, 1, 0.8);
      color: white;
      display: flex;
      justify-content: center; /* Центрирование по горизонтали */
      align-items: center; /* Центрирование по вертикали */
      height: 100vh; /* Высота в 100% от видимой части экрана */
      margin: 0;
      z-index: 3000;
    "
  >
    <div class="spacer">
      <h6>Выполняется загрузка заказов</h6>
    </div>
  </div>
</template>
<script setup lang="ts">
import DatePicker from "@/components/widgets/DatePicker.vue";
//import { DBManager, IDBDataRecord } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref, watch } from "vue";
import {
  getCurrentDateByDatePickerFormat,
  getCurrentDateFromDatePickerFormat,
} from "@/functions/GetCurrentDateByDatePickerFormat";
import { DB2Manager } from "@/classes/DB2Manager";
import { IInfoList } from "@/interfaces/IInfoList";
import { HttpManager } from "@/classes/HttpManager";

interface IAddOrdersModel {
  ДатаНачала: string;
  ДатаОкончания: string;
  СкладНаименование: string;
  Заголовок: string;
}

interface IProps {
  seen: boolean;
}
const props = defineProps<IProps>();
const emit = defineEmits(["update:seen"]);
//const seen = ref(false);

const isLoadingOrders = ref(false);

const addOrders: Ref<IAddOrdersModel> = ref(getEmptyAddOrdersModel());

function getEmptyAddOrdersModel(): IAddOrdersModel {
  const currentDate = getCurrentDateByDatePickerFormat();
  return {
    ДатаНачала: currentDate,
    ДатаОкончания: currentDate,
    СкладНаименование: "" + MainManager.instance.mainStore.value?.Наименование,
    Заголовок: "Загрузка заказов",
  };
}

watch(
  () => props.seen,
  (newVal, _) => {
    if (newVal) {
      addOrders.value.СкладНаименование =
        "" + MainManager.instance.mainStore.value?.Наименование;
    }
  }
);

function close() {
  emit("update:seen", false);
}

async function LoadOrdersExecute(type: string) {
  //debugger;
  if (addOrders.value.ДатаОкончания == "") {
    addOrders.value.ДатаОкончания = addOrders.value.ДатаНачала;
  }

  if (!addOrders.value.ДатаНачала || !addOrders.value.ДатаОкончания) {
    NotificationManager.error("Даты отбора не заполнены!");
    return;
  }

  if (type == MainManager.keys.orders) {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!");
    isLoadingOrders.value = true;
    const documents = await ShipmentManager.instance.getOrdersFromServer(
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаНачала).getTime(),
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.СкладНаименование
    );
    if (documents) {
      // const data: IDBDataRecord[] = documents.map((i) => {
      //   return { data: i, id: i.ШК };
      // });

      // await DBManager.WriteDataInDB(MainManager.keys.orders, data);
      await DB2Manager.instance.orders!.setAll(documents);
      NotificationManager.success(`В систему загруженно ${documents.length} заказа(ов)`);
      isLoadingOrders.value = false;
      return;
    }
  } else if (type == MainManager.keys.infoSheets) {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ИНФО ЛИСТОВ!");
    const sheets = await MainManager.instance.getInfoList(
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаНачала).getTime(),
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.СкладНаименование
    );
    if (sheets) {
      // const data: IDBDataRecord[] = sheets.map((i: any) => {
      //   return { data: i.list, id: i.ID.replace(/ /g, "") };
      // });
      NotificationManager.info("Загрузка информационных листов начата");

      //await DBManager.WriteDataInDB(MainManager.keys.infoSheets, data);
      const infList: IInfoList[] = sheets.map((i: any) => {
        return {
          data: i.list,
          ШК: i.ID.delSpaces(),
          ВесПоддона: i.ВесПоддона,
          НомерПоддона: i.НомерПоддона,
          Сеть: i.Сеть,
          Склад: i.Склад,
        } as IInfoList;
      });
      await DB2Manager.instance.infoSheets!.setAll(infList);

      NotificationManager.success(
        `В систему загруженно ${infList.length} информационных листа`
      );
      return;
    }
  }

  close();
}
</script>
