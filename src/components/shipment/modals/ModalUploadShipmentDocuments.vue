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
              type="text"
              class="form-control"
              id="Склад"
              v-model="addOrders.Склад"
            />
          </div>
        </div>
        <div class="d-grid gap-2 p-3">
          <button
            type="button"
            class="btn btn-primary btn-lg btn-block text-uppercase"
            @click="LoadOrdersExecute('orders')"
          >
            Загрузить заказы
          </button>
          <button
            type="button"
            class="btn btn-primary btn-lg btn-block text-uppercase"
            @click="LoadOrdersExecute('info_sheets')"
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
import { DBManager } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref } from "vue";

interface IAddOrdersModel {
  ДатаНачала: string;
  ДатаОкончания: string;
  Склад: string;
  Заголовок: string;
}

const seen = ref(false);

const addOrders: Ref<IAddOrdersModel> = ref(getEmptyAddOrdersModel());

function getEmptyAddOrdersModel(): IAddOrdersModel {
  return {
    ДатаНачала: "",
    ДатаОкончания: "",
    Склад: "" + MainManager.instance.mainStore.value,
    Заголовок: "Загрузка заказов",
  };
}
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

async function LoadOrdersExecute(type: string) {
  if (addOrders.value.ДатаОкончания == "") {
    addOrders.value.ДатаОкончания = addOrders.value.ДатаНачала;
  }

  if (type == "orders") {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!");

    const documents = await ShipmentManager.instance.getOrdersFromServer(
      new Date(addOrders.value.ДатаНачала).getTime(),
      new Date(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.Склад
    );
    if (documents) {
      const data = documents.map((i) => {
        return { data: i, id: i.ШК };
      });
      NotificationManager.info("Загрузка заказов начата");
      await DBManager.deleteDatabase("orders");
      await DBManager.WriteDataInDB("orders", data);
      NotificationManager.success(`В систему загруженно ${data.length} заказа(ов)`);
      return;
    }
  } else if (type == "info_sheets") {
    NotificationManager.info("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!");
    const sheets = await MainManager.instance.getInfoList(
      new Date(addOrders.value.ДатаНачала).getTime(),
      new Date(addOrders.value.ДатаОкончания).getTime(),
      addOrders.value.Склад
    );
    if (sheets) {
      const data = sheets.map((i: any) => {
        return { data: i.list, id: i.ID.replace(/ /g, "") };
      });
      NotificationManager.info("Загрузка информационных листов начата");
      await DBManager.deleteDatabase("info_lists");
      await DBManager.WriteDataInDB("info_lists", data);
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