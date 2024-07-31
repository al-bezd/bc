<template>
  <div></div>
</template>
<script setup lang="ts">
import { NotificationManager } from "@/classes/NotificationManager";
import { toast, ToastActions } from "vue3-toastify";
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
  const toastId = uuidv4();
  action(`${title}\n${data[0]}`, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 5000,
    closeOnClick: true,
    delay: 0,
    transition: toast.TRANSITIONS.SLIDE,
    toastId: toastId,
  });
  setTimeout(() => {
    ToastActions.dismiss(toastId);
  }, 6000);
});
</script>
