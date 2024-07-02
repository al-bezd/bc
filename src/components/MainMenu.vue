<template>
    <!-- Главное меню-->
    <div class="row form_menu" id="form_menu" v-show="seen">
      <div class="">
        <div class="col-md-12 col-sm-12 col-xs-12">
          <div class="panel panel-success">
            <div class="panel-heading">
              <h3 style="font-weight: bold;text-align: center;text-transform: uppercase;">{{fio}}</h3>
            </div>
          </div>
          <div class="well center-block" role="group">
            <button @click="showBildOrder" class="btn btn-primary btn-lg btn-block text-uppercase">
            Сборка заказа</button>
            <button @click="showGettingProd" class="btn btn-primary btn-lg btn-block text-uppercase">
            Прием продукции</button>
            <button @click="exit" class="btn btn-default btn-lg btn-block text-uppercase">
            ВЫЙТИ</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Главное меню-->
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fio = ref("")

function showBildOrder(){
    console.log('show_bild_orders')
}

function showGettingProd(){
    console.log('show_getting_prod')
}

function exit(){
    console.log('exit')
    close()
}

const seen = ref(false)
const name = ref('form_menu')

function close(){
    seen.value = false
}

function show(){
    seen.value = true
}

document.addEventListener('go',(event:any)=>{
    if(event.detail[0]===name.value){
        show()
    }else{
        close()
    }
})


</script>