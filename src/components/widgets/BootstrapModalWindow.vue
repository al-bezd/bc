<template>
  <div
    class="modal fade show"
    v-if="localSeen"
    tabindex="-1"
    style="display: block"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- <slot name="header"> <div class="modal-header"></div></slot> -->

        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
      <!-- /.modal-content -->
    </div>
    <!-- /.modal-dialog -->
  </div>
  <div v-if="localSeen" class="modal-backdrop fade show"></div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";

/**<template v-slot:header>
        <h1>Custom Header</h1>
      </template> */

interface IModalWindow {
  seen: boolean;
}
const props = defineProps<IModalWindow>();
watch(props, () => {
  localSeen.value = props.seen;
});

const localSeen = ref(false);

function close() {
  localSeen.value = false;
}

function show() {
  localSeen.value = true;
}
</script>
