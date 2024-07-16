<template>
  <button
    class="btn btn-info btn-lg btn-block text-uppercase w-100 mb-3"
    @click="
      () => {
        emit('tap');
      }
    "
  >
    +
  </button>
</template>
<script setup lang="ts">
const emit = defineEmits(["tap"]);
</script>
