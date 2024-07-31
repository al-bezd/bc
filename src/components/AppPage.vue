<style scope>
/* body {
  font-size: 0.5rem !important;
}
.btn {
  font-size: 0.5rem !important;
} */
.d-flex-direction-column {
  display: flex;
  flex-direction: column;
}
.flex-d-column {
  flex-direction: column;
}
.reft_screen_form {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}
.reft_modal {
  height: 100vh;
  /*height: -webkit-fill-available;*/
  width: 100%;
  background-color: white;
  position: absolute;
  top: 0px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
}

.close_btn {
  width: 100%;
  margin-bottom: 16px;
}

.space {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.btn {
  flex-shrink: 0;
}

.fs-7 {
  font-size: 0.75rem !important;
}
.fs-8 {
  font-size: 0.5rem !important;
}
.fs-9 {
  font-size: 0.25rem !important;
}

.alert-orange {
  color: #573815;
  background-color: #f9a653;
  border-color: #e6d6c3;
}
</style>
<template>
  <div>
    <FormSelectUser />
    <MainMenu />

    <ShipmentLoad />
    <ShipmentForm />
    <ShipmentCheck />

    <InfoListForm />
    <InfoListCheck />
    <InfoListUploadByBarcode />

    <ReflectionStoreForm />
    <ReflectionStoreCheck />

    <GettingProdLoad />
    <GettingProdForm />
    <GettingProdCheck />

    <SohShipingLoad />
    <SohShipingForm />
    <SohShipingCheck />

    <SohGettingLoad />
    <SohGettingForm />
    <SohGettingCheck />

    <SettingsButton />
    <SettingsScreen />

    <AddManualFormScreen />
    <ConfirmScreen />
    <NotificationListener />
  </div>
</template>

<script setup lang="ts">
import FormSelectUser from "./FormSelectUser.vue";
import MainMenu from "./MainMenu.vue";
import GettingProdLoad from "./getting/GettingProdLoad.vue";
import GettingProdForm from "./getting/GettingProdForm.vue";
import GettingProdCheck from "./getting/GettingProdCheck.vue";
import SettingsButton from "./widgets/SettingsButton.vue";
import SettingsScreen from "./SettingsScreen.vue";
import ConfirmScreen from "@/components/modals/ConfirmScreen.vue";
import AddManualFormScreen from "@/components/modals/AddManualFormScreen.vue";
import InfoListUploadByBarcode from "@/components/shipment/info_list/InfoListUploadByBarcode.vue";
// import { onMounted } from "vue";
// import { RoutingManager } from "@/classes/RoutingManager";
import NotificationListener from "@/components/widgets/NotificationListener.vue";
import ShipmentLoad from "./shipment/ShipmentLoad.vue";
import ShipmentForm from "./shipment/ShipmentForm.vue";
import ShipmentCheck from "./shipment/ShipmentCheck.vue";
import InfoListForm from "./shipment/info_list/InfoListForm.vue";
import InfoListCheck from "./shipment/info_list/InfoListCheck.vue";

import ReflectionStoreForm from "./shipment/reflection_store/ReflectionStoreForm.vue";
import ReflectionStoreCheck from "./shipment/reflection_store/ReflectionStoreCheck.vue";

import SohShipingLoad from "@/components/soh/shiping/SohShipingLoad.vue";
import SohShipingForm from "@/components/soh/shiping/SohShipingForm.vue";
import SohShipingCheck from "@/components/soh/shiping/SohShipingCheck.vue";

import SohGettingLoad from "@/components/soh/getting/SohGettingLoad.vue";
import SohGettingForm from "@/components/soh/getting/SohGettingForm.vue";
import SohGettingCheck from "@/components/soh/getting/SohGettingCheck.vue";

// onMounted(() => {
//   RoutingManager.instance.afterReload();
// });
</script>
