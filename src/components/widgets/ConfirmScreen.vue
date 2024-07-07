
<template>
    <div class="reft_modal text-center" v-if="seen">
        <h3>Внимание</h3>
        <span class="space">{{message}}</span>
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-warning btn-lg text-uppercase fs-6" @click="cancel"><b>Отмена</b></button>
            <button type="button" class="btn btn-primary btn-lg text-uppercase fs-6" @click="accept"><b>Принять</b></button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { NotificationManager } from '@/classes/NotificationManager';
import { ref } from 'vue';

const seen = ref(false)
const message = ref("")
let callback : (state:boolean)=>void 



NotificationManager.instance.connect('showConfirm', (data)=>{
    message.value = data[0]
    callback = data[1]
    show()
})

function cancel(){
    callback(false)
    close()
}

function accept(){
    callback(true)
    close()
}

function show(){
    seen.value = true
}

function close(){
    seen.value = false
}


</script>