<template>
  <div
    class="modal fade show"
    v-if="seen"
    tabindex="-1"
    style="display: block"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="header">Default Header</slot>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </div>
  <div v-if="seen" class="modal-backdrop fade show"></div>
</template>
<script setup lang="ts">
import { DBManager, IDBDataRecord } from "@/classes/DBManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { Ref, ref } from "vue";

/**<template v-slot:header>
        <h1>Custom Header</h1>
      </template> */

interface IModalWindow {
  seen: boolean;
}

const props = defineProps<IModalWindow>();

const seen = ref(false);

function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}
</script>
