<template>
  <div
    class="modal fade show"
    v-if="seen"
    tabindex="-1"
    aria-labelledby="exampleModalLiveLabel"
    style="display: block"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title text-center">{{ addOrders.Заголовок }}</h4>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="ДатаНачала" class="control-label">Дата начала</label>
            <input
              type="date"
              class="form-control"
              id="ДатаНачала"
              v-model="addOrders.ДатаНачала"
            />
          </div>
          <div class="form-group">
            <label for="ДатаОкончания" class="control-label">Дата окончания</label>
            <input
              type="date"
              class="form-control"
              id="ДатаОкончания"
              v-model="addOrders.ДатаОкончания"
            />
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
        </div>
        <div class="d-grid gap-2 p-3">
          <button
            type="button"
            class="btn btn-primary btn-lg btn-block text-uppercase"
            @click="LoadOrdersExecute(MainManager.keys.orders)"
          >
            Загрузить заказы
          </button>
          <button
            type="button"
            class="btn btn-primary btn-lg btn-block text-uppercase"
            @click="LoadOrdersExecute(MainManager.keys.infoSheets)"
          >
            Загрузить инфо. листы
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-lg btn-block text-uppercase"
            data-dismiss="modal"
            @click="close()"
          >
            Закрыть
          </button>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </div>
  <div v-if="seen" class="modal-backdrop fade show"></div>
</template>
<script setup lang="ts">
import { DBManager, IDBDataRecord } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref } from "vue";

interface IAddOrdersModel {
  ДатаНачала: string;
  ДатаОкончания: string;
  СкладНаименование: string;
  Заголовок: string;
}

const seen = ref(false);

const addOrders: Ref<IAddOrdersModel> = ref(getEmptyAddOrdersModel());

function getEmptyAddOrdersModel(): IAddOrdersModel {
  return {
    ДатаНачала: "",
    ДатаОкончания: "",
    СкладНаименование: "" + MainManager.instance.mainStore.value?.Наименование,
    Заголовок: "Загрузка заказов",
  };
}

function close() {
  seen.value = false;
}

function show() {
  addOrders.value.СкладНаименование =
    "" + MainManager.instance.mainStore.value?.Наименование;
  seen.value = true;
}

async function LoadOrdersExecute(type: string) {
  if (addOrders.value.ДатаОкончания == "") {
    addOrders.value.ДатаОкончания = addOrders.value.ДатаНачала;
  }

  if (!addOrders.value.ДатаНачала || !addOrders.value.ДатаОкончания) {
    NotificationManager.error("Даты отбора не заполнены!");
    return;
  }

  if (type == MainManager.keys.orders) {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!");

    const documents = await ShipmentManager.instance.getOrdersFromServer(
      new Date(addOrders.value.ДатаНачала).getTime(),
      new Date(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.СкладНаименование
    );
    if (documents) {
      const data: IDBDataRecord[] = documents.map((i) => {
        return { data: i, id: i.ШК };
      });

      await DBManager.WriteDataInDB(MainManager.keys.orders, data);
      NotificationManager.success(`В систему загруженно ${data.length} заказа(ов)`);
      return;
    }
  } else if (type == MainManager.keys.infoSheets) {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ИНФО ЛИСТОВ!");
    const sheets = await MainManager.instance.getInfoList(
      new Date(addOrders.value.ДатаНачала).getTime(),
      new Date(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.СкладНаименование
    );
    if (sheets) {
      const data: IDBDataRecord[] = sheets.map((i: any) => {
        return { data: i.list, id: i.ID.replace(/ /g, "") };
      });
      NotificationManager.info("Загрузка информационных листов начата");

      await DBManager.WriteDataInDB(MainManager.keys.infoSheets, data);

      NotificationManager.success(
        `В систему загруженно ${data.length} информационных листа`
      );
      return;
    }
  }

  close();
}

ShipmentManager.instance.connect("showLoadOrders", (data) => {
  show();
});
</script>
