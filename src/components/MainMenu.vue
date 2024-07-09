<template>
  <!-- Главное меню-->
  <div class="row form_menu p-3" id="form_menu" v-show="seen">
    <div class="">
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="panel panel-success">
          <div class="panel-heading">
            <h3 style="font-weight: bold; text-align: center; text-transform: uppercase">
              {{ UserManager.instance.user.value?.ФИО }}
            </h3>
          </div>
        </div>
        <div class="d-grid gap-2">
          <button
            @click="showBildOrder"
            class="btn btn-primary btn-lg btn-block text-uppercase"
          >
            Отгрузка продукции
          </button>
          <button
            @click="showGettingProd"
            class="btn btn-primary btn-lg btn-block text-uppercase"
          >
            Прием продукции
          </button>
          <button @click="exit" class="btn btn-outline-primary btn-lg text-uppercase">
            ВЫЙТИ
          </button>
        </div>
      </div>
    </div>
  </div>
  <!-- Главное меню-->
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { UserManager } from "@/managers/user/UserManager";
import { NotificationManager } from "@/classes/NotificationManager";

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.mainMenu, show, close);
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

function showBildOrder() {
  RoutingManager.instance.pushName(RoutingManager.route.shipmentLoad);
}

function showGettingProd() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionLoad);
}

async function exit() {
  const response = await NotificationManager.showConfirm(
    "Вы действительно хотите выйти?"
  );
  if (response) {
    UserManager.instance.clearUser();
    RoutingManager.instance.pushName(RoutingManager.route.selectUser);
  }
  // qw.show(
  //       "Вы действительно хотите выйти?",
  //       ()=> { form_select_user.show(); RemoveData("current_user"); },
  //       form_menu.show, {})
}
</script>
