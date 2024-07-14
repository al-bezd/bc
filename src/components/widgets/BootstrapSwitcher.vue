<template>
  <div class="form-check form-switch">
    <label class="form-check-label" :for="id">{{ label }}</label>
    <!--<input class="form-check-input" type="checkbox" :id="id" :value="value" @input="onInput">-->
    <input
      class="form-check-input"
      type="checkbox"
      :id="id"
      :checked="value"
      @change="onChanged"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { v4 as uuidv4 } from "uuid";

const id = ref(uuidv4());
//const label = ref('label')

const emit = defineEmits(["update:value", "tap"]);

// function sendMessage() {
//   // emit('message-sent', 'Привет из дочернего компонента');
// }
// const props = withDefaults(defineProps<Props>(), {
//   id: self.crypto.randomUUID(),
//   success: '',
//   error: ''
// })
interface Props {
  label: string;
  value: boolean;
  //onUpdate:(value:boolean)=>void | null
}

// const props = withDefaults(defineProps<Props>(), {
//     onUpdate:(value:boolean)=>{}
// });
defineProps<Props>();

// function onInput(event: any) {
//   emit('update:value', event.target.value);
// }

function onChanged(event: any) {
  const value = event.target.checked;
  emit("update:value", value);
  emit("tap", value);
  console.log("onChanged ", value);
  //props.onUpdate(event.target.checked);
}
</script>
