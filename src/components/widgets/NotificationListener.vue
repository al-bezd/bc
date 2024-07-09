<template>
  <div></div>
</template>
<script setup lang="ts">
import { NotificationManager, AlertMode } from "@/classes/NotificationManager";
import { toast } from "vue3-toastify";
import { v4 as uuidv4 } from "uuid";

NotificationManager.instance.connect("showAlert", (data) => {
  let action = toast.warning;
  let title = "Внимание";
  switch (data[1]) {
    case "error":
      action = toast.error;
      title = "Ошибка";
      break;
    case "success":
      action = toast.success;
      title = "Успешно";
      break;
    case "info":
      action = toast.info;
      title = "Уведомление";
      break;
  }

  action(`${title}\n${data[0]}`, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: false,
    closeOnClick: true,
    transition: toast.TRANSITIONS.SLIDE,
    toastId: uuidv4(),
  });
});
</script>
