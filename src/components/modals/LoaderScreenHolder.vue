<template>
  <!-- LoaderScreenHolder start -->
  <div
    class="reft_modal"
    v-show="seen"
    style="
      background: rgba(1, 1, 1, 0.8);
      color: white;
      display: flex;
      justify-content: center; /* Центрирование по горизонтали */
      align-items: center; /* Центрирование по вертикали */
      height: 100vh; /* Высота в 100% от видимой части экрана */
      margin: 0;
      z-index: 3000;
    "
  >
    <div class="spacer">
      <h6>{{ text ?? "" }}</h6>
    </div>
  </div>
  <!-- LoaderScreenHolder finish -->
</template>
<script setup lang="ts">
import { HttpManager } from "@/classes/HttpManager";
import { ref } from "vue";

var seen = ref(false);
var text = ref("Выполняется запрос на сервер");
HttpManager.instance.connect("requestStart", (data) => {
  seen.value = true;
});
HttpManager.instance.connect("requestEnd", (data) => {
  seen.value = false;
});
</script>
