<template>
  <!-- <div class="form-check form-switch">
    <label class="form-check-label" :for="id">{{ label }}</label>
    <input
      class="form-check-input"
      type="checkbox"
      :id="id"
      :checked="value"
      @change="onChanged"
    />
  </div> -->

  <div class="custom-control custom-switch">
    <input
      type="checkbox"
      class="custom-control-input"
      :id="id"
      :checked="value"
      @change="onChanged"
    />
    <label class="custom-control-label" :for="id">{{ label }}</label>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { v4 as uuidv4 } from "uuid";

const id = ref(uuidv4());

const emit = defineEmits(["update:value", "tap"]);

interface Props {
  label: string;
  value: boolean;
}

defineProps<Props>();

function onChanged(event: any) {
  const value = event.target.checked;
  emit("update:value", value);
  emit("tap", value);
  //console.log("onChanged ", value);
}
</script>
