<template>
  <div>
    <div v-if="!document.completed" class="alert alert-warning">
      <div class="row">
        <div class="col fs-6">
          <b>{{ document.Ссылка.Наименование }}</b>
        </div>
      </div>
      <div class="">
        <button
          class="btn btn-info btn-block text-uppercase me-3"
          @click="emit('tap', document)"
        >
          Продолжить
        </button>
        <button
          class="btn btn-danger btn-block text-uppercase"
          @click="emit('delete', document)"
        >
          Закрыть
        </button>
      </div>
    </div>
    <div v-else class="alert alert-success">
      <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">
          <b>{{ document.Ссылка.Наименование }} СОБРАН!</b>
        </div>
      </div>
      <div class="">
        <button
          class="btn btn-info btn-block text-uppercase"
          @click="emit('tap', document)"
        >
          Продолжить
        </button>
        <button
          class="btn btn-danger btn-block text-uppercase"
          @click="emit('delete', document)"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IShipmentDocument } from "@/managers/shipment/interfaces";

interface Props {
  document: IShipmentDocument;
}
const props = defineProps<Props>();
const emit = defineEmits(["tap", "delete"]);
</script>
