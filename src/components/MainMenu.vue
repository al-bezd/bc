<template>
  <!-- Главное меню-->
  <div class="reft_screen_form p-1" id="form_menu" v-if="seen">
    <div class="alert alert-success mb-1 p-1">
      <div class="panel-heading">
        <h5 style="font-weight: bold; text-align: center; text-transform: uppercase">
          {{ UserManager.instance.user.value?.ФИО }}
        </h5>
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
      <button
        @click="
          () => {
            sohMenuSeen = true;
          }
        "
        class="btn btn-primary btn-lg btn-block text-uppercase"
      >
        СОХ
      </button>
    </div>
    <div class="space"></div>
    <button @click="exit" class="btn btn-warning btn-block text-uppercase mt-3">
      <b>ВЫЙТИ</b>
    </button>
  </div>
  <!-- Главное меню-->
  <BootstrapModalWindow :seen="sohMenuSeen">
    <h3 class="text-center">СОХ</h3>
    <div class="d-grid gap-2">
      <button
        @click="
          () => {
            sohMenuSeen = false;
            RoutingManager.instance.pushName(RoutingManager.route.sohGettingLoad);
          }
        "
        class="btn btn-primary btn-lg btn-block text-uppercase"
      >
        Приемка
      </button>
      <button
        @click="
          () => {
            sohMenuSeen = false;
            RoutingManager.instance.pushName(RoutingManager.route.sohShipmentLoad);
          }
        "
        class="btn btn-primary btn-lg btn-block text-uppercase"
      >
        Отгрузка
      </button>
    </div>
    <div class="space"></div>
    <button
      @click="
        () => {
          sohMenuSeen = false;
        }
      "
      class="btn btn-warning btn-block text-uppercase mt-3"
    >
      <b>ВЫЙТИ</b>
    </button>
  </BootstrapModalWindow>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { UserManager } from "@/managers/user/UserManager";
import { NotificationManager } from "@/classes/NotificationManager";
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";

const seen = ref(false);
RoutingManager.instance.registry(RoutingManager.route.mainMenu, show, close);
const sohMenuSeen = ref(false);

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
