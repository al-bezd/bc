<template>
    

<div :class="data.cls+' bs-callout bs-callout-danger'" :name="'check'+data.Номенклатура.Наименование">
  <div class="row">
    <div class="col-10">
      
        <div @click="OpenThisArticul(data.Номенклатура.Наименование)">
          <b>{{data.Номенклатура.Артикул}}</b> {{data.Номенклатура.Наименование}}
        </div>
        <div>{{data.Характеристика.Наименование}}</div>
        <div>{{data.Серия.Наименование}}</div>
        <div><b>ПЛУ : {{data.ПЛУ}}</b></div>
        <div ><b>к/к. {{data.КоличествоКоробок}}</b></div>
        <div><b>тек {{data.ТекущееКоличество}} / зак {{data.имКоличествоВПересчетеНаКг}} кг</b></div>
        <div><b>тек {{data.ТекущееКоличествоВЕдиницахИзмерения}} / зак
            {{data.КоличествоУпаковок}} {{data.Номенклатура.ЕдиницаИзмерения.Наименование}}</b></div>

    </div>
    <div class="col-2">
        <div>
          <b>{{data.ВПроцСоотношении}}%</b>
        </div>
    </div>
  </div>
</div>




</template>
<script setup lang="ts">
import { IScaning } from '@/interfaces/IScaning';


interface Props{
    data:any
    //onDelete:(data:IScaning)=>void
}
const props = defineProps<Props>()
const emit = defineEmits(['tap']);

function OpenThisArticul(nomenklName:string){
    emit('tap', nomenklName)
}



</script>