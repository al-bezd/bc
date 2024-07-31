<template>
  <div class="reft_screen_form p-3" v-show="seen">
    <h6>{{ pageTitle }}</h6>

    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter()"
    />

    <div class="space">
      <div v-for="item in items" :key="item.ШК" class="alert alert-info" role="alert">
        <div class="row">
          <div role="button" class="col-10" @click="tapInfoSheet(item)">
            <div>
              ИД: <b>{{ item.ШК }}</b>
            </div>
            <div>Сеть: {{ item.Сеть?.Наименование }}</div>
            <div>Склад: {{ item.Склад?.Наименование }}</div>
            <div>НомерПоддона: {{ item.НомерПоддона }}</div>
            <div>ВесПоддона: {{ item.ВесПоддона }}</div>
            <div>Количество сканов: {{ item.data.length }}</div>
          </div>
          <div class="col-2">
            <button type="button" class="btn btn-danger" @click="deleteInfoSheet(item)">
              Х
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="btn-group w-100" role="group">
          <button
            type="button"
            class="btn btn-warning text-uppercase fs-6"
            @click="closeWithQuest()"
          >
            <b>ЗАКРЫТЬ</b>
          </button>
          <button
            type="button"
            class="btn btn-primary text-uppercase fs-6"
            @click="clearWithQuest()"
          >
            <b>ОЧИСТИТЬ</b>
          </button>

          <button
            type="button"
            class="btn btn-success text-uppercase fs-6"
            attr="check"
            @click="save()"
          >
            <b>Сохранить</b>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Ref, ref, toRaw } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { IInfoList } from "@/interfaces/IInfoList";
import { HttpManager } from "@/classes/HttpManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { DB2Manager } from "@/classes/DB2Manager";
import { ScanerManager } from "@/classes/ScanerManager";
RoutingManager.instance.registry(
  RoutingManager.route.shipmentUploadInfoListByBarcode,
  show,
  close
);
ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onEnter();
  barcode.value = "";
});
const seen = ref(false);
const pageTitle = ref("Добавление Инфо. листов через сканирование");
const barcode = ref("");

const items: Ref<IInfoList[]> = ref([]);

function show() {
  seen.value = true;
  setTimeout(afterShow, 500);
}

function close() {
  seen.value = false;
}

async function clear() {
  items.value.length = 0;
  barcode.value = "";
  await DB2Manager.instance.local?.delete(key);
}

function back() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
}

function tapInfoSheet(item: IInfoList) {
  //
}
const key = "infoList_Uload_by_barcode_items";
async function afterShow() {
  const res = await DB2Manager.instance.local?.get(key);
  if (res) {
    items.value = res as IInfoList[];
  }
}

async function deleteInfoSheet(item: IInfoList) {
  const text = `Вы уверены что хотите удалить Инфо. лист ИД: ${item.ШК}?`;
  const answerIsTrue = await NotificationManager.showConfirm(text);
  if (answerIsTrue) {
    items.value = items.value.filter((x) => x.ШК != item.ШК);
  }
  await DB2Manager.instance.local?.set(
    key,
    items.value.map((x) => toRaw(x))
  );
}

async function save() {
  await DB2Manager.instance.infoSheets?.addAll(items.value.map((x) => toRaw(x)));
  NotificationManager.success("Инфо листы сохранены");
  //clear();
  //back();
}

async function clearWithQuest() {
  const response = await NotificationManager.showConfirm(
    "Вы действительно хотите очистить сканирования"
  );
  if (response) {
    clear();
  }
}

async function closeWithQuest() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    clear();
    close();

    back();
  }
}

async function onEnter() {
  barcode.value = barcode.value.delSpaces();
  if (items.value.findIndex((x) => x.ШК == barcode.value) != -1) {
    NotificationManager.swal("Данный ШК уже есть в списке");
    return;
  }
  const res = await HttpManager.get("/execute", {
    get_info_list: true,
    ID: barcode.value,
  });
  if (!res.success) {
    return;
  }

  //   if (!res.data.РезультатПроверки) {
  //     return;
  //   }

  for (const i of res.data) {
    items.value.unshift({
      ШК: i.ID,
      data: i.list,
      ВесПоддона: i.ВесПоддона,
      НомерПоддона: i.НомерПоддона,
      Сеть: i.Сеть,
      Склад: i.Склад,
    });
    await DB2Manager.instance.local?.set(
      key,
      items.value.map((x) => toRaw(x))
    );
  }

  barcode.value = "";
}
</script>
