<template>

    
    <!-- Выбор пользователя-->
    <div class="col-md-12 col-sm-12 col-xs-12" id="form_select_user" v-show="seen">
      <div class="jumbotron">
        <h4>Отсканируйте ШК сотрудника</h4>

        <div class="form-group form-group-lg">
          <div class="">
            <input type="text" class="form-control bc_input" placeholder="Введите штрихкод" v-model="barcode"
              @keyup.enter="getUser" id="barcode_user">

          </div>
        </div>


      </div>
    </div>
    <!-- Выбор пользователя-->
</template>
<script setup lang="ts">
import { ref } from 'vue'
import {UserManager} from '../managers/user/UserManager'
const barcode = ref(UserManager.instance.barcode)

const seen = ref(true)
const name = ref('form_select_user')

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

// eslint-disable-next-line @typescript-eslint/no-empty-function
function getUser() { 
  UserManager.instance.uploadUser()
}
</script>

