<template>
  <BootstrapModalWindow :seen="seen">
    <h3 class="text-center">Внимание</h3>
    <span class="space">{{ message }}</span>
    <div class="btn-group" role="group" style="min-height: 2.5rem">
      <button
        v-if="isConfirm"
        type="button"
        class="btn btn-warning text-uppercase fs-6 w-50"
        @click="cancel"
      >
        <b>Отмена</b>
      </button>
      <button
        type="button"
        class="btn btn-primary text-uppercase fs-6 w-50"
        @click="accept"
      >
        <b>ОК</b>
      </button>
    </div>
  </BootstrapModalWindow>
</template>
<script setup lang="ts">
import BootstrapModalWindow from "@/components/widgets/BootstrapModalWindow.vue";
import { NotificationManager } from "@/classes/NotificationManager";
import { ref } from "vue";

const seen = ref(false);
const message = ref("");
let callback: (state: boolean) => void;
const isConfirm = ref(true);

NotificationManager.instance.connect("showConfirmWindow", (data) => {
  isConfirm.value = true;
  message.value = data[0];
  callback = data[1];
  show();
});

NotificationManager.instance.connect("showAlertWindow", (data) => {
  isConfirm.value = false;
  message.value = data[0];
  callback = data[1];
  show();
});

function cancel() {
  callback(false);
  close();
}

function accept() {
  callback(true);
  close();
}

function show() {
  seen.value = true;
}

function close() {
  seen.value = false;
}
</script>
