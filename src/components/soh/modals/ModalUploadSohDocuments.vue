<template>
  <BootstrapModalWindow :seen="seen">
    <template v-slot:header>
      <div class="modal-header">
        <h4 class="modal-title text-center">{{ addOrders.Заголовок }}</h4>
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

    <div class="">
      <div class="mb-3">
        <label for="Сеть" class="form-label">Склад</label>
        <select
          class="form-control"
          id="Сеть"
          v-model="selectedStore"
          @change="
            () => {
              addOrders.СкладНаименование = selectedStore?.Наименование ?? '';
            }
          "
        >
          <option v-for="item in stores" selected :key="item.Ссылка.Ссылка" :value="item">
            {{ item.Наименование }}
          </option>
        </select>
      </div>
    </div>

    <div class="d-grid gap-2">
      <button
        type="button"
        class="btn btn-primary btn-block text-uppercase"
        @click="LoadOrdersExecute(MainManager.keys.sohOrders)"
      >
        <b>Загрузить заказы (СОХ)</b>
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
</template>
<script setup lang="ts">
import DatePicker from "@/components/widgets/DatePicker.vue";
//import { DBManager, IDBDataRecord } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { Ref, ref, watch } from "vue";
import {
  getCurrentDateByDatePickerFormat,
  getCurrentDateFromDatePickerFormat,
} from "@/functions/GetCurrentDateByDatePickerFormat";
import { DB2Manager } from "@/classes/DB2Manager";
import { SohManager } from "@/managers/soh/SohManager";
import { IStore } from "@/interfaces/IStore";

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

const stores: Ref<IStore[]> = ref([]);
const selectedStore: Ref<IStore | null> = ref(null);

const addOrders: Ref<IAddOrdersModel> = ref(getEmptyAddOrdersModel());

function getEmptyAddOrdersModel(): IAddOrdersModel {
  const currentDate = getCurrentDateByDatePickerFormat();
  return {
    ДатаНачала: currentDate,
    ДатаОкончания: currentDate,
    СкладНаименование: "",
    Заголовок: "Загрузка заказов (СОХ)",
  };
}

watch(
  () => props.seen,
  (newVal, _) => {
    if (newVal) {
      if (SohManager.instance.stores.length == 0 && stores.value.length == 0) {
        SohManager.instance.getSohStores().then((items) => {
          stores.value = items;
        });
      }
    }
  }
);

function close() {
  emit("update:seen", false);
}

async function LoadOrdersExecute(type: string) {
  if (addOrders.value.ДатаОкончания == "") {
    addOrders.value.ДатаОкончания = addOrders.value.ДатаНачала;
  }

  if (!addOrders.value.ДатаНачала || !addOrders.value.ДатаОкончания) {
    NotificationManager.error("Даты отбора не заполнены!");
    return;
  }

  if (type == MainManager.keys.sohOrders) {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ СОХ!");

    const documents = await SohManager.instance.getOrdersFromServer(
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаНачала).getTime(),
      getCurrentDateFromDatePickerFormat(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.СкладНаименование
    );
    if (documents) {
      // const data: IDBDataRecord[] = documents.map((i) => {
      //   return { data: i, id: i.ШК };
      // });

      // await DBManager.WriteDataInDB(MainManager.keys.orders, data);
      await DB2Manager.instance.orders!.addAll(documents);
      NotificationManager.success(`В систему загруженно ${documents.length} заказа(ов)`);
      return;
    }
  }

  close();
}
</script>
