<template>

    
    <!-- Выбор пользователя-->
    <div class="col-md-12 col-sm-12 col-xs-12 px-3" id="form_select_user" v-show="seen">
      <div class="jumbotron">
        <h4>Отсканируйте ШК сотрудника</h4>

        <div class="form-group form-group-lg">
          <div class="">
            <input 
            :disabled="scaningIsStart"
            type="text" 
            class="form-control bc_input" 
            placeholder="Введите штрихкод" 
            v-model="barcode"
            @keyup.enter="getUser" 
            id="barcode_user">

          </div>
        </div>


      </div>
    </div>
    <!-- Выбор пользователя-->
</template>
<script setup lang="ts">
import { ref } from 'vue'
import {UserManager} from '../managers/user/UserManager'
import { ScanerManager } from '@/classes/ScannerManager';
import { RoutingManager } from '@/classes/RoutingManager';
const barcode = ref("")
const scaningIsStart = ref(false)

const seen = ref(true)
RoutingManager.instance.registry(RoutingManager.route.selectUser, show, close)

function close(){
    seen.value = false
}

function show(){
    seen.value = true
}

//155903682678532144829659545771503172989
// setTimeout(()=>{
//   ScanerManager.instance.emit("onScan",[ScanerManager.instance.barcodeWrapper("155903682678532144829659545771503172989")])
// },10000)

ScanerManager.instance.onScan((value)=>{
  barcode.value = value
  getUser()
})






// eslint-disable-next-line @typescript-eslint/no-empty-function
async function getUser() { 
  if(scaningIsStart.value){
    return
  }
  scaningIsStart.value = true
  const res = await UserManager.instance.uploadUser(barcode.value.delSpaces())
  scaningIsStart.value = false
  barcode.value = ""
  if(res){
    //UserManager.instance.emit('go',['form_menu'])
    RoutingManager.instance.pushName(RoutingManager.route.mainMenu)
  }
  
}
</script>

