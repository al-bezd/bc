<template>
  <!-- Окно загрузки документа СОХ-->
  <div class="reft_screen_form p-1" v-if="seen">
    <h6>СОХ Приемка: Отсканируйте ШК в поле: Загрузка</h6>
    <input
      type="text"
      class="form-control bc_input mb-1"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="onEnter()"
    />
    <!-- <div class="d-grid gap-2 mb-1">
      <button
        type="button"
        class="btn btn-primary btn-lg btn-block text-uppercase"
        @click="showLoadOrders()"
      >
        <b>ЗАГРУЗИТЬ ЗАДАНИЯ (СОХ)</b>
      </button>
    </div> -->
    <div class="space">
      <DocumentItemComponent
        v-for="document in savedSohDocs"
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

    <ModalUploadSohDocuments v-model:seen="modalSeen" />
    <!-- /.modal -->
  </div>
  <!-- Окно загрузки документа-->
</template>
<script setup lang="ts">
import DocumentItemComponent from "@/components/widgets/DocumentItemComponent.vue";
import ModalUploadSohDocuments from "@/components/soh/modals/ModalUploadSohDocuments.vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { SohGettingManager } from "@/managers/soh/SohGettingManager";
import { computed, Ref, ref } from "vue";
import { UserManager } from "@/managers/user/UserManager";
import { MainManager } from "@/classes/MainManager";
import { IScaning } from "@/interfaces/IScaning";
import { IDocument } from "@/interfaces/IDocument";
import { ISohDocument } from "@/managers/soh/interfaces";

const currentManager = computed(() => SohGettingManager.instance);
const barcode = ref("");
const savedSohDocs: Ref<ISohDocument[]> = ref([]);

const modalSeen = ref(false);

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.sohGettingLoad, show, close);

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  onEnter();
});

async function onEnter() {
  await getDocumentByBarcode(ScanerManager.instance.barcodeWrapper(barcode.value));
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

/// Подгружаем сохраненые документы пользователя
async function initSavedDocuments() {
  savedSohDocs.value = await MainManager.instance.local.sohGettingDocs();
}

function onTapDocument(document: IDocument) {
  setCurrentDocument(document, document.scanings ?? []);
}

/// удаляет ранее добавленый документ из списка документов
async function onDeleteDocument(document: IDocument) {
  const resultQuest = await NotificationManager.showConfirm(
    `Вы действительно хотиет удалить документ\n${document.Наименование}`
  );
  if (resultQuest) {
    const response = await currentManager.value.deleteDocument(document);
    //console.log(document, document.Ссылка.Ссылка);
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
    currentManager.value.clear();
    RoutingManager.instance.pushName(RoutingManager.route.mainMenu);
  }
}

async function getDocumentByBarcode(barcode: string) {
  ///ищем по ШК сначала в документах пользователя
  /// для приемки сох пока не предусмотрен поиск по локальной базе
  // const userDocs = await MainManager.instance.local.allUserDocs();
  // if (userDocs) {
  //   for (const doc of userDocs) {
  //     if (doc.Ссылка.Ссылка === barcode) {
  //       setCurrentDocument(doc, doc.scanings ?? []);
  //       return;
  //     }
  //   }
  // }
  /// если не нашли документ в документах пользователя то получаем его с сервера или из списка ранее загруженных заказов
  let document: ISohDocument | null = null;
  const con = UserManager.instance.useLocalOrders.value;
  if (con) {
    document = await currentManager.value.getDocumentFromLocalDBByBarcode(barcode);
  } else {
    document = await currentManager.value.getDocumentFromServerByBarcode(barcode);
  }

  if (document) {
    setCurrentDocument(document);
  }
}

function setCurrentDocument(document: IDocument, scans: IScaning[] = []) {
  currentManager.value.setCurrentDocument(document as ISohDocument);
  currentManager.value.setCurrentScanings(scans);
  RoutingManager.instance.pushName(RoutingManager.route.sohGettingForm);
}

function showLoadOrders() {
  modalSeen.value = true;
}
</script>
