<template>
  <!-- Окно загрузки документа для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <h4>Отсканируйте ШК с сопроводительной накладной в поле</h4>
    <input
      type="text"
      class="form-control bc_input mb-3"
      placeholder="Введите штрихкод"
      v-model="barcode"
      @keyup.enter="getDocumentOrder"
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
      class="btn btn-outline-primary btn-lg btn-block text-uppercase w-100"
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
import { ref } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { UserManager } from "@/managers/user/UserManager";
import { IDocument } from "@/interfaces/IDocument";
import { IGettingProductionDocument } from "@/managers/getting/interfaces";

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.gettingProductionLoad, show, close);

const documents = ref(GettingManager.instance.documents);
const barcode = ref("");

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  barcode.value = value;
  GettingManager.instance.getDocumentByBarcode(barcode.value);
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

/// Получить документ заказа
async function getDocumentOrder() {
  const response = await GettingManager.instance.getDocumentByBarcode(
    barcode.value.delSpaces()
  );
  if (response) {
    GettingManager.instance.setCurrentDocument(response);
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
  }
}

function close() {
  seen.value = false;
}

async function initSavedDocuments() {
  documents.value = await UserManager.instance.getGettingProdDocuments();
}

async function show() {
  seen.value = true;
  setTimeout(async function () {
    initSavedDocuments();
  }, 500);
}

async function openDocument(document: IDocument) {
  GettingManager.instance.setCurrentDocument(document as IGettingProductionDocument);
  GettingManager.instance.setCurrnetScanings(document.scanings ?? []);
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
}
/// удаляет ранее добавленый документ из списка документов
async function deleteDocument(document: IDocument) {
  const resultQuest = await NotificationManager.showConfirm(
    `Вы действительно хотиет удалить документ\n${document.Наименование}`
  );
  if (resultQuest) {
    const response = await GettingManager.instance.deleteDocumentById(
      document.Ссылка.Ссылка
    );
    if (response) {
      initSavedDocuments();
    }
  }

  // if(response){
  //     //getting_prod_load.show()
  //     //GettingManager.instance.emit('go',['getting_prod_form'])
  //     RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm)
  // }
}
</script>
