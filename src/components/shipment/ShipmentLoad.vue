<template>
  <!-- Окно загрузки документа-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Отсканируйте ШК с листа сборки в поле</h4>
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="getDocumentByBarcode(barcode)"
      id="load_doc_bc"
    />
    <div class="d-grid gap-2">
      <button
        type="button"
        class="btn btn-primary btn-lg btn-block text-uppercase"
        @click="goToReflectionOfBalances()"
      >
        <b>ОТРАЖЕНИЕ ОСТАТКОВ</b>
      </button>
      <button
        type="button"
        class="btn btn-primary btn-lg btn-block text-uppercase"
        @click="goToCreateInfoSheet()"
      >
        <b>СОЗДАНИЕ ИНФ. ЛИСТА</b>
      </button>
      <button
        type="button"
        class="btn btn-primary btn-lg btn-block text-uppercase"
        @click="showLoadOrders()"
      >
        <b>ЗАГРУЗИТЬ ЗАДАНИЯ</b>
      </button>
    </div>
    <div class="space">
      <ShipmentDocumentItem
        v-for="document in documents"
        :document="document"
        :key="document.Ссылка.Ссылка"
        @tap="onTapDocument"
        @delete="onDeleteDocument"
      />
    </div>

    <button
      type="button"
      class="btn btn-primary btn-lg btn-block text-uppercase"
      @click="closeWithQuest()"
    >
      <b>НАЗАД</b>
    </button>

    <ModalUploadShipmentDocuments />
    <!-- /.modal -->
  </div>
  <!-- Окно загрузки документа-->
</template>

<script setup lang="ts">
import ShipmentDocumentItem from "@/components/shipment/widgets/ShipmentDocumentItem.vue";
import ModalUploadShipmentDocuments from "@/components/shipment/modals/ModalUploadShipmentDocuments.vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref } from "vue";
import { IShipmentDocument } from "@/managers/shipment/interfaces";
import { DBManager } from "@/classes/DBManager";
import { UserManager } from "@/managers/user/UserManager";

const barcode = ref("");
const documents: Ref<IShipmentDocument[]> = ref([]);

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.shipmentLoad, show, close);

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  getDocumentByBarcode(barcode.value);
});

async function show() {
  seen.value = true;
  setTimeout(async function () {
    initSavedDocuments();
  }, 500);
}

async function close() {
  seen.value = false;
}

function getDocumentByBarcode(barcode: string) {
  //get_document_order
}

function goToReflectionOfBalances() {
  //Перейти к отражению остатков
  //eval(`form_doc_free.show('Остатки');form_doc_free.ClearScaning()`)
}

function goToCreateInfoSheet() {
  //Перейти к созданию инфо листа
  //eval(`form_doc_free.show('ИнфоЛист');form_doc_free.ClearScaning()`)
}

function showLoadOrders() {
  ShipmentManager.instance.emit("showLoadOrders");
}

/// Подгружаем сохраненые документы пользователя
async function initSavedDocuments() {
  documents.value = await UserManager.instance.getShipmentDocuments();
}

function onTapDocument(document: IShipmentDocument) {
  ShipmentManager.instance.setCurrentDocument(document);
  ShipmentManager.instance.setCurrentScanings(document.scanings);
  RoutingManager.instance.pushName(RoutingManager.route.shipmentForm);
}

/// удаляет ранее добавленый документ из списка документов
async function onDeleteDocument(document: IShipmentDocument) {
  const resultQuest = await NotificationManager.showConfirm(
    `Вы действительно хотиет удалить документ\n${document.Наименование}`
  );
  if (resultQuest) {
    const response = await ShipmentManager.instance.deleteDocumentById(
      document.Ссылка.Ссылка
    );
    if (response) {
      initSavedDocuments();
    }
  }
}

async function closeWithQuest() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    //close()
    ShipmentManager.instance.clear();
    RoutingManager.instance.pushName(RoutingManager.route.mainMenu);
  }
}
</script>
