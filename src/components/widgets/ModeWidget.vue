<template>
  <div class="btn-group w-100 mb-3" role="group">
    <button
      v-for="item in items"
      :key="item"
      :class="`btn btn-primary text-uppercase ${mode == item ? 'disabled' : ''}`"
      @click="showWithMode(item)"
    >
      <span>{{ GetLabel(item) }}</span>
    </button>
    <!-- <button
      :class="`btn btn-primary text-uppercase ${mode == 'Ном' ? 'disabled' : ''}`"
      @click="showWithMode('Ном')"
    >
      НОМ
    </button>
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
    </button> -->
  </div>
</template>
<script setup lang="ts">
import { RowKeyMode } from "@/functions/GetGroupScans";

interface IProps {
  mode: RowKeyMode | string;
  items: RowKeyMode[] | string[];
}
withDefaults(defineProps<IProps>(), {
  items: () => ["НомХар", "НомХарСер"],
});

const emit = defineEmits(["tap"]);

function showWithMode(mode: RowKeyMode | string) {
  emit("tap", mode);
  //   currentMode.value = mode;
  //   LocalStorageManager.set(currentModeKey, currentMode.value);
  //   groupedScans.value = GetGroupScans(
  //     ShipmentManager.instance.currentScanings.value,
  //     currentMode.value
  //   );
}

function GetLabel(item: RowKeyMode | string) {
  switch (item) {
    case "Ном":
      return "НОМ";
    case "НомХар":
      return "НОМ+ХАР";
    case "НомХарСер":
      return "НОМ+ХАР+СЕР";
    default:
      return ("" + item).toUpperCase();
  }
}
</script>
