<template>
  <BootstrapModalWindow :seen="seen">
    <h3>Список тары</h3>
    <div class="space">
      <div class="">
        <div v-for="item in containers" :key="item.ИД" :id="item.ИД">
          <div class="alert alert-info" role="alert">
            <div view="Тара">
              <b class="d-block text-center">{{ item.Тара.Наименование }}</b>
              <div class="row">
                <div class="col">
                  <div class="">
                    <label class="form-label" :for="item.ИД + 'Вес'">Вес</label>
                    <input
                      :id="item.ИД + 'Вес'"
                      type="text"
                      view="Вес"
                      v-model="item.Вес"
                      class="form-control"
                    />
                  </div>
                </div>
                <div class="col">
                  <div class="">
                    <label class="form-label" :for="item.ИД + 'Количество'"
                      >Количество</label
                    >
                    <input
                      :id="item.ИД + 'Количество'"
                      type="text"
                      class="form-control"
                      view="Количество"
                      v-model="item.Количество"
                      @blur="UpdateWeight(item)"
                      @click="UpdateWeight(item)"
                      @keyup.enter="UpdateWeight(item)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="">
      <div class="btn-group w-100" role="group">
        <button
          type="button"
          class="btn btn-warning text-uppercase"
          @click="
            () => {
              emit('update:seen', false);
            }
          "
        >
          <b>НАЗАД</b>
        </button>
        <button type="button" class="btn btn-success text-uppercase" @click="save">
          <b>СОХРАНИТЬ</b>
        </button>
      </div>
    </div>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
import { HttpManager } from "@/classes/HttpManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { IShipmentDocument } from "@/managers/shipment/interfaces";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref, toRaw, watch } from "vue";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { IContainer } from "@/interfaces/IStore";

interface IProps {
  seen: boolean;
}

const props = defineProps<IProps>();
const emit = defineEmits(["update:seen"]);

watch(
  () => props.seen,
  (newVal, _) => {
    if (newVal) {
      initContainers();
    }
  }
);

const containers: Ref<IContainer[]> = ref([]);

// function show() {
//   // emit("seen:update", true);
//   initContainers();
// }

async function initContainers() {
  const doc: IShipmentDocument = ShipmentManager.instance.currentDocument.value!;
  const data = {
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    СтатусЗапроса: "Получить",
  };
  const httpRes = await HttpManager.post("/document_container", data);
  if (!httpRes.success) {
    NotificationManager.error(httpRes.error);
  }

  if (!httpRes.data.РезультатПроверки) {
    NotificationManager.error(httpRes.data.Текст);
  }

  containers.value = httpRes.data.Текст;
  const scanings = ShipmentManager.instance.currentScanings.value;
  const containersFromDB = (await MainManager.instance.local.containers()) ?? [];

  for (const y of containers.value) {
    y.Количество = 0;
    y.Вес = 0;
    const тара = containersFromDB.filter(
      (item: any) => item.Наименование === y.Тара.Наименование
    );
    if (тара.length > 0) {
      y.ВесШт = тара[0].Вес;
    }
  }

  for (const i of scanings) {
    for (const y of containers.value) {
      if (i.Характеристика.рсТипКоробки.Наименование === y.Тара.Наименование) {
        y.Вес += y.ВесШт * i.Грузоместа;
        y.Количество += i.Грузоместа;
      }
    }
  }
}

function close() {
  emit("update:seen", false);
}

async function save() {
  const doc: IShipmentDocument = ShipmentManager.instance.currentDocument.value!;
  const data = {
    Тип: doc.Ссылка.Тип,
    Вид: doc.Ссылка.Вид,
    Ссылка: doc.Ссылка.Ссылка,
    Тара: containers.value.map((x: IContainer) => toRaw(x)),
    СтатусЗапроса: "Записать",
  };
  const httpRes = await HttpManager.post("/document_container", data);
  if (!httpRes.success) {
    NotificationManager.error(httpRes.error);
  }

  if (!httpRes.data.РезультатПроверки) {
    NotificationManager.error(httpRes.data.Текст);
  }

  NotificationManager.success("Информация по таре успешно записана");
  close();
}

function UpdateWeight(item: any) {
  item.Вес = item.Количество * item.ВесШт;
}
</script>
