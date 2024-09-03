<template>
  <div class="alert alert-warning">
    <div class="row">
      <div class="col fs-6">
        <b>{{ document.Ссылка.Наименование }}</b>
      </div>
    </div>
    <div class="d-flex">
      <button
        class="btn btn-info text-uppercase me-3 mr-3"
        @click="emit('tap', document)"
      >
        Продолжить
      </button>
      <button class="btn btn-danger text-uppercase" @click="emit('delete', document)">
        Закрыть
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IDocument } from "@/interfaces/IDocument";

interface Props {
  document: IDocument;
}

const props = defineProps<Props>();
const emit = defineEmits(["delete", "tap"]);
</script>
