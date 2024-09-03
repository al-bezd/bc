<template>
  <!-- Окно загрузки документа для приемки-->
  <div class="reft_screen_form p-1" v-if="seen">
    <h6>Отсканируйте ШК с сопроводительной накладной в поле</h6>
    <input
      type="text"
      class="form-control bc_input mb-1"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="
        () => {
          barcode = ScanerManager.instance.barcodeWrapper(barcode);
          onEnter();
        }
      "
      id="getting_prod_bc"
    />
    <div class="space">
      <GettingProdLoadItem
        v-for="item in documents"
        :key="item.Ссылка.Ссылка"
        :document="item"
        @tap="openDocument"
        @delete="deleteDocument"
      />
    </div>
    <button
      class="btn btn-warning btn-block text-uppercase w-100"
      @click="closeWithConfirm"
    >
      <b>НАЗАД</b>
    </button>
  </div>
  <!-- Окно загрузки документа для приемки-->
</template>
<script setup lang="ts">
import GettingProdLoadItem from "@/components/getting/widgets/GettingProdLoadItem.vue";
import { GettingManager } from "@/managers/getting/GettingManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { Ref, ref } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { UserManager } from "@/managers/user/UserManager";
import { IDocument } from "@/interfaces/IDocument";
import { IGettingProductionDocument } from "@/managers/getting/interfaces";
import { MainManager } from "@/classes/MainManager";
import { IScaning } from "@/interfaces/IScaning";

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.gettingProductionLoad, show, close);

const documents: Ref<IGettingProductionDocument[]> = ref([]);
const barcode = ref("");

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onEnter();
  //getDocumentOrder(barcode.value)
  //GettingManager.instance.getDocumentByBarcode(barcode.value);
});

async function closeWithConfirm() {
  const response = await NotificationManager.showConfirm(
    "Вы уверенны что хотите перейти обратно?"
  );
  if (response) {
    //close()
    GettingManager.instance.clear();
    RoutingManager.instance.pushName(RoutingManager.route.mainMenu);
  }
}

function onEnter() {
  //getDocumentOrder(ScanerManager.instance.barcodeWrapper(barcode.value));
  getDocumentByBarcode(ScanerManager.instance.barcodeWrapper(barcode.value));
}

async function getDocumentByBarcode(barcode: string) {
  //get_document_order
  ///ищем по ШК сначала в документах пользователя
  const userDocs = await MainManager.instance.local.allUserDocs();
  if (userDocs) {
    for (const doc of userDocs) {
      if (doc.ШК === barcode) {
        setCurrentDocument(doc, doc.scanings ?? []);
        return;
      }
    }
  }
  /// если не нашли документ в документах пользователя то получаем его с сервера или из списка ранее загруженных заказов
  let document: IGettingProductionDocument | null = null;
  document = await GettingManager.instance.getDocumentByBarcode(barcode);

  if (document) {
    setCurrentDocument(document);
  }
}

function setCurrentDocument(document: IDocument, scans: IScaning[] = []) {
  GettingManager.instance.setCurrentDocument(document as IGettingProductionDocument);
  GettingManager.instance.setCurrentScanings(scans);
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
}

/// Получить документ заказа
async function getDocumentOrder(barcode: string) {
  const response = await GettingManager.instance.getDocumentByBarcode(barcode);
  if (response) {
    GettingManager.instance.setCurrentDocument(response);
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
  }
}

function clear() {
  barcode.value = "";
}

function close() {
  clear();
  seen.value = false;
}

/// Подгружаем сохраненые документы пользователя
async function initSavedDocuments() {
  documents.value = await UserManager.instance.getGettingProdDocuments();
}

async function show() {
  seen.value = true;
  setTimeout(initSavedDocuments, 500);
}

async function openDocument(document: IDocument) {
  GettingManager.instance.setCurrentDocument(document as IGettingProductionDocument);
  GettingManager.instance.setCurrentScanings(document.scanings ?? []);
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
}
/// удаляет ранее добавленый документ из списка документов
async function deleteDocument(document: IDocument) {
  const resultQuest = await NotificationManager.showConfirm(
    `Вы действительно хотиет удалить документ\n${document.Наименование}`
  );
  if (resultQuest) {
    const response = await GettingManager.instance.deleteDocument(document);
    if (response) {
      initSavedDocuments();
    }
  }
}
</script>
