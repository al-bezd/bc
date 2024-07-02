<template>
    <!-- Окно загрузки документа для приемки-->
    <div class="" id="getting_prod_load" v-show="seen">
      <div class="jumbotron">
        <h4>Отсканируйте ШК с сопроводительной накладной в поле</h4>
        <div class="form-group form-group-lg">
          <div class="">
            <input type="text" class="form-control bc_input" placeholder="Введите штрихкод" v-model="barcode"
              @keyup.enter="getDocumentOrder" id="getting_prod_bc">
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 col-sm-12 col-xs-12">
            <div class="list-group">
              <button type="button" class="btn btn-default btn-lg btn-block text-uppercase" @click="closeWithConfirm" tabindex="-1"><b>НАЗАД</b>
              </button>
            </div>
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
            <button class="btn btn-danger btn-block text-uppercase" @click="closeDocumnetById(item.Ссылка.Ссылка)">Закрыть</button>
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

const name = ref('getting_prod_load')

const seen = ref(false)

const documents = ref(GettingManager.instance.documents)
const barcode = ref(GettingManager.instance.barcode)

async function closeWithConfirm(){
    console.log('closeWithConfirm')
    const response = await NotificationManager.showConfirm('da?')
    if(response){
        //
        close()
    }
}

/// Получить документ заказа
function getDocumentOrder(){
    console.log('getDocumentOrder')
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
        GettingManager.instance.emit('go',['getting_prod_form'])

    }
}

async function closeDocumnetById(id:string){
    const response = await GettingManager.instance.closeDocumentById(id)
    if(response){
        //getting_prod_load.show()
        GettingManager.instance.emit('go',['getting_prod_form'])
    }

}

document.addEventListener('go',(event:any)=>{
    if(event.detail[0]===name.value){
        show()
    }else{
        close()
    }
})



</script>