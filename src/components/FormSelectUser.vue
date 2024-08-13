<template>
  <!-- Выбор пользователя-->
  <div class="p-3" id="form_select_user" v-if="seen">
    <div class="jumbotron">
      <h6>Отсканируйте ШК сотрудника</h6>

      <div class="form-group form-group-lg">
        <div class="">
          <input
            :disabled="scaningIsStart"
            type="text"
            class="form-control bc_input"
            placeholder="Введите штрихкод"
            v-model="barcode"
            @keyup.enter="onEnter"
            id="barcode_user"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Выбор пользователя-->
</template>
<script setup lang="ts">
import { ref } from "vue";
import { UserManager } from "../managers/user/UserManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { RoutingManager } from "@/classes/RoutingManager";
const barcode = ref("");
const scaningIsStart = ref(false);

const seen = ref(true);
RoutingManager.instance.registry(RoutingManager.route.selectUser, show, close);

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

//155903682678532144829659545771503172989
// setTimeout(()=>{
//   ScanerManager.instance.emit("onScan",[ScanerManager.instance.barcodeWrapper("155903682678532144829659545771503172989")])
// },10000)

function onEnter(){
  barcode.value = ScanerManager.instance.barcodeWrapper(barcode.value)
  getUser()
}

ScanerManager.instance.onScan((value) => {
  if (!seen.value) {
    return;
  }
  console.log("Выбор пользователя сканирование ", value);
  barcode.value = value;
  getUser();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function getUser() {
  if (scaningIsStart.value) {
    return;
  }
  scaningIsStart.value = true;
  const res = await UserManager.instance.uploadUser(barcode.value);
  scaningIsStart.value = false;
  barcode.value = "";
  if (res) {
    //UserManager.instance.emit('go',['form_menu'])
    RoutingManager.instance.pushName(RoutingManager.route.mainMenu);
  }
}
</script>
