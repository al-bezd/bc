<style scoped></style>

<template>
    <div class="row" style="margin-top:16px">
        <div class="col-md-12 col-sm-12 col-xs-12" v-for="item in items" :key="item.id" >
            <div class="alert alert-success">
                {{ item.title }}
            </div>
        </div>  
    </div>
</template>
<script setup lang="ts">
import { Ref, ref } from 'vue';
    interface Item {
        id:number
        title:string
    }
    const items:Ref<Item[]> = ref([])
    import { useCounterStore } from '../stores/store';

    const counterStore = useCounterStore();
    const { count, increment } = counterStore;

    async function getData(){
        const response = await fetch('https://jsonplaceholder.typicode.com/todos')
        items.value = await response.json()
        console.log(items.value)
    }

    getData()
</script>