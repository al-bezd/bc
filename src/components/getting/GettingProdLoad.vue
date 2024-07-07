<template>
    <!-- Окно загрузки документа для приемки-->
    <div class="p-3" id="getting_prod_load" v-show="seen">
      <div class="jumbotron">
        <h4>Отсканируйте ШК с сопроводительной накладной в поле</h4>
        <div class="form-group form-group-lg mb-3">
          <input 
            type="text" 
            class="form-control bc_input" 
            placeholder="Введите штрихкод" 
            v-model="barcode"
            @keyup.enter="getDocumentOrder" 
            id="getting_prod_bc">
        </div>
        <div class="row">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <button 
              class="btn btn-outline-primary btn-lg btn-block text-uppercase w-100" 
              @click="closeWithConfirm" 
              tabindex="-1"><b>НАЗАД</b>
              </button>
          </div>
        </div>
      </div>
      <div class="" style="margin-bottom: 10px;">
        <div v-for="item in documents" :key="item.Ссылка.Ссылка" class="alert alert-warning">
          <div class="row">
            <div class=""><b>{{item.Ссылка.Наименование}}</b>
            </div>
          </div>
          <div class="">
            <button class="btn btn-info btn-block text-uppercase" @click="getDocumentById(item.Ссылка.Ссылка)">Продолжить</button>
            <button class="btn btn-danger btn-block text-uppercase" @click="deleteDocumnetById(item.Ссылка.Ссылка)">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Окно загрузки документа для приемки-->
</template>
<script setup lang="ts">
import { GettingManager } from '@/managers/getting/GettingManager';
import { NotificationManager } from '@/classes/NotificationManager';
import {  ref } from 'vue';
import { RoutingManager } from '@/classes/RoutingManager';
import { ScanerManager } from '@/classes/ScannerManager';

const seen = ref(false)
RoutingManager.instance.registry(RoutingManager.route.gettingProductionLoad,show,close)


const documents = ref(GettingManager.instance.documents)
const barcode = ref("")

ScanerManager.instance.onScan((value)=>{
  if(!seen.value) {
    return
  }
  barcode.value = value
  GettingManager.instance.getDocumentByBarcode(barcode.value)
})

async function closeWithConfirm(){
    const response = await NotificationManager.showConfirm('Вы уверенны что хотите перейти обратно?')
    if(response){
        //close()
        GettingManager.instance.clear()
        RoutingManager.instance.pushName(RoutingManager.route.mainMenu)

    }
}

/// Получить документ заказа
async function getDocumentOrder(){
   const response = await GettingManager.instance.getDocumentByBarcode(barcode.value.delSpaces())
   if(response){
    GettingManager.instance.setCurrentDocument(response)
    RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm)
   }
}

function close(){
    seen.value = false
}

function show(){
    seen.value = true
}

async function getDocumentById(id:string){
    // load_document
    const response = await GettingManager.instance.getDocumentById(id)
    if(response){
        //getting_prod_form.show()
        //GettingManager.instance.emit('go',['getting_prod_form'])
        RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm)

    }
}
/// удаляет ранее добавленый документ из списка документов
async function deleteDocumnetById(id:string){
    const response = await GettingManager.instance.deleteDocumentById(id)
    // if(response){
    //     //getting_prod_load.show()
    //     //GettingManager.instance.emit('go',['getting_prod_form'])
    //     RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm)
    // }

}





</script>