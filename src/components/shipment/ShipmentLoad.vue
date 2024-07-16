<template>
  <!-- Окно загрузки документа-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Отсканируйте ШК с листа сборки в поле</h4>
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter()"
      id="load_doc_bc"
    />
    <div class="d-grid gap-2 mb-3">
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
        v-for="document in savedShipmentDocs"
        :document="document"
        :key="document.Ссылка.Ссылка"
        @tap="onTapDocument"
        @delete="onDeleteDocument"
      />
    </div>

    <button
      type="button"
      class="btn btn-warning btn-block text-uppercase"
      @click="closeWithQuest()"
    >
      <b>НАЗАД</b>
    </button>

    <ModalUploadShipmentDocuments v-model:seen="modalSeen" />
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
import { MainManager } from "@/classes/MainManager";
import { IScaning } from "@/interfaces/IScaning";
import { IDocument } from "@/interfaces/IDocument";

const barcode = ref("");
const savedShipmentDocs: Ref<IShipmentDocument[]> = ref([]);

const modalSeen = ref(false);

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.shipmentLoad, show, close);

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onEnter();
});

async function onEnter() {
  await getDocumentByBarcode(barcode.value);
  barcode.value = "";
  initSavedDocuments();
}

async function show() {
  seen.value = true;
  setTimeout(initSavedDocuments, 500);
}

async function close() {
  seen.value = false;
}

async function getDocumentByBarcode(barcode: string) {
  //get_document_order
  ///ищем по ШК сначала в документах пользователя
  const userDocs = await MainManager.instance.local.allUserDocs();
  if (userDocs) {
    for (const doc of userDocs) {
      if (doc.Ссылка.Ссылка === barcode) {
        setCurrentDocument(doc, doc.scanings ?? []);
        return;
      }
    }
  }
  /// если не нашли документ в документах пользователя то получаем его с сервера или из списка ранее загруженных заказов
  let document: IShipmentDocument | null = null;
  if (UserManager.instance.useLocalOrders.value) {
    document = await ShipmentManager.instance.getDocumentFromLocalDBByBarcode(barcode);
  } else {
    document = await ShipmentManager.instance.getDocumentFromServerByBarcode(barcode);
  }

  if (document) {
    setCurrentDocument(document);
  }
}

function setCurrentDocument(document: IDocument, scans: IScaning[] = []) {
  ShipmentManager.instance.setCurrentDocument(document as IShipmentDocument);
  ShipmentManager.instance.setCurrentScanings(scans);
  RoutingManager.instance.pushName(RoutingManager.route.shipmentForm);
}

function goToReflectionOfBalances() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentReflectionStoreForm);
  //Перейти к отражению остатков
  //eval(`form_doc_free.show('Остатки');form_doc_free.ClearScaning()`)
}

function goToCreateInfoSheet() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentCreateInfoListForm);
  //Перейти к созданию инфо листа
  //eval(`form_doc_free.show('ИнфоЛист');form_doc_free.ClearScaning()`)
}

function showLoadOrders() {
  //ShipmentManager.instance.emit("showLoadOrders");
  modalSeen.value = true;
}

/// Подгружаем сохраненые документы пользователя
async function initSavedDocuments() {
  savedShipmentDocs.value = await MainManager.instance.local.shipmentDocs();
}

function onTapDocument(document: IShipmentDocument) {
  setCurrentDocument(document, document.scanings ?? []);
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
    console.log(document, document.Ссылка.Ссылка);
    if (response) {
      initSavedDocuments();
      return;
    }
    NotificationManager.swal(`Документ ${document.Ссылка.Наименование} не был удален`);
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
