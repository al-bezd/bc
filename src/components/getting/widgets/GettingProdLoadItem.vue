<template>
  <div class="alert alert-warning">
    <div class="row">
      <div class="">
        <b>{{ document.Ссылка.Наименование }}</b>
      </div>
    </div>
    <div class="mt-1">
      <button
        class="btn btn-info btn-block text-uppercase me-3"
        @click="
          () => {
            emit('tap', document);
          }
        "
      >
        Продолжить
      </button>
      <button
        class="btn btn-danger btn-block text-uppercase"
        @click="
          () => {
            emit('delete', document);
          }
        "
      >
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
