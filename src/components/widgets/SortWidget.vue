<template>
  <div class="btn-group w-100 mb-1" role="group">
    <button
      class="btn btn-primary btn-sm text-uppercase"
      @click="
        () => {
          emit('tap', 'Артикул');
        }
      "
    >
      АРТ
    </button>
    <button
      class="btn btn-primary btn-sm text-uppercase"
      @click="
        () => {
          emit('tap', 'История');
        }
      "
    >
      ИСТ
    </button>
    <button disabled class="btn btn-primary btn-sm text-uppercase">
      кор {{ boxCount }}
    </button>

    <button disabled class="btn btn-primary btn-sm text-uppercase">
      скан {{ scanCount }}
    </button>
  </div>
</template>
<script setup lang="ts">
interface IProps {
  boxCount: number;
  scanCount: number;
}

defineProps<IProps>();
const emit = defineEmits(["tap"]);
</script>
