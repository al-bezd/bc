<style scope>
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
}

.close_btn {
  width: 100%;
  margin-bottom: 16px;
}

.space {
  flex: 1;
  overflow-y: auto;
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
</style>
<template>
  <div>
    <FormSelectUser />
    <MainMenu />

    <ShipmentLoad />
    <ShipmentCreateInfoListForm />
    <ShipmentCreateInfoListCheck />

    <GettingProdLoad />
    <GettingProdForm />
    <GettingProdCheck />

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
import ConfirmScreen from "./widgets/ConfirmScreen.vue";
import AddManualFormScreen from "./widgets/AddManualFormScreen.vue";
import { onMounted } from "vue";
import { RoutingManager } from "@/classes/RoutingManager";
import NotificationListener from "@/components/widgets/NotificationListener.vue";
import ShipmentLoad from "./shipment/ShipmentLoad.vue";
import ShipmentCreateInfoListForm from "./shipment/ShipmentCreateInfoListForm.vue";
import ShipmentCreateInfoListCheck from "./shipment/ShipmentCreateInfoListCheck.vue";

onMounted(() => {
  RoutingManager.instance.afterReload();
});
</script>
