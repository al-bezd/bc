<template>
  <div class="btn-group w-100 mb-3" role="group">
    <button
      class="btn btn-primary btn-sm text-uppercase"
      @click="
        () => {
          emit('tap', 'Артикул');
        }
      "
    >
      по Артикулу
    </button>
    <button
      class="btn btn-primary btn-sm text-uppercase"
      @click="
        () => {
          emit('tap', 'История');
        }
      "
    >
      по Истории
    </button>
    <button disabled class="btn btn-primary btn-sm text-uppercase">
      Кол.кор {{ boxCount }}
    </button>
  </div>
</template>
<script setup lang="ts">
interface IProps {
  boxCount: number;
}

defineProps<IProps>();
const emit = defineEmits(["tap"]);
</script>
