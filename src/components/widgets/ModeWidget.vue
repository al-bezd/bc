<template>
  <div class="btn-group w-100 mb-3" role="group">
    <button
      :class="`btn btn-primary text-uppercase ${mode == 'НомХар' ? 'disabled' : ''}`"
      @click="showWithMode('НомХар')"
    >
      НОМ+ХАР
    </button>

    <button
      :class="`btn btn-primary text-uppercase ${mode == 'НомХарСер' ? 'disabled' : ''}`"
      @click="showWithMode('НомХарСер')"
    >
      НОМ+ХАР+СЕР
    </button>
  </div>
</template>
<script setup lang="ts">
import { RowKeyMode } from "@/functions/GetGroupScans";

interface IProps {
  mode: RowKeyMode;
}
const props = defineProps<IProps>();

const emit = defineEmits(["tap"]);

function showWithMode(mode: RowKeyMode) {
  emit("tap", mode);
  //   currentMode.value = mode;
  //   LocalStorageManager.set(currentModeKey, currentMode.value);
  //   groupedScans.value = GetGroupScans(
  //     ShipmentManager.instance.currentScanings.value,
  //     currentMode.value
  //   );
}
</script>
