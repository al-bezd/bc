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
const barcode = ref("")
const seen = ref(true)
// eslint-disable-next-line @typescript-eslint/no-empty-function
function getUser() { }
</script>

