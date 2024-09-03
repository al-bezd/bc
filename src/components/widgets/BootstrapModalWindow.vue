<template>
  <div
    class="modal fade show"
    v-if="localSeen"
    tabindex="-1"
    :style="`display: block; padding-bottom: 16px; height:${winHeight}px`"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog h-100" role="document">
      <div class="modal-content h-100">
        <!-- <div class="modal-header"></div> -->
        <slot name="header"> </slot>

        <div class="modal-body p-1" style="display: flex; flex-direction: column">
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
const winHeight = window.screen.height;
interface IModalWindow {
  seen: boolean;
}
const props = defineProps<IModalWindow>();
watch(props, () => {
  localSeen.value = props.seen;
});

const localSeen = ref(false);

// function close() {
//   localSeen.value = false;
// }

// function show() {
//   localSeen.value = true;
// }
</script>
