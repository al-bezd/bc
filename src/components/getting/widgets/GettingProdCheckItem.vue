<template>
    

<div :class="data.cls+' bs-callout bs-callout-danger'" :name="'check'+data.Номенклатура.Наименование">
  <div class="row">
    <div class="col-10">
      <div class="row">
        <div class="col-12" @click="OpenThisArticul(data.Номенклатура.Наименование)">
          <b>{{data.Номенклатура.Артикул}}</b> {{data.Номенклатура.Наименование}}</div>
      </div>
      <div class="row">
        <div class="col-12">{{data.Характеристика.Наименование}}</div>
      </div>
      <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12">{{data.Серия.Наименование}}</div>
      </div>
      <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12"><b>ПЛУ : {{data.ПЛУ}}</b></div>
      </div>
      <div class="row">
        <div class="col-md-12 col-sm-12 col-xs-12"><b>к/к. {{data.КоличествоКоробок}}</b></div>
        <div class="col-md-12 col-sm-12 col-xs-12"><b>тек {{data.ТекущееКоличество}} / зак
            {{data.имКоличествоВПересчетеНаКг}} кг</b></div>
        <div class="col-md-12 col-sm-12 col-xs-12"><b>тек {{data.ТекущееКоличествоВЕдиницахИзмерения}} / зак
            {{data.КоличествоУпаковок}} {{data.Номенклатура.ЕдиницаИзмерения.Наименование}}</b></div>
      </div>

    </div>
    <div class="col-md-2 col-sm-2 col-xs-2">
      <div class="row">
        <div class="col">
          <b>{{data.ВПроцСоотношении}}%</b><br>
        </div>

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