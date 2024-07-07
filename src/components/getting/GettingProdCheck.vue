<template>
  <!-- Форма проверки для приемки-->
  <div class="reft_screen_form p-3" v-show="seen">
    <div>
      <h4 class="text-muted">{{ docName }}</h4>
      <span>Поддон № {{ оитНомерПалета }}</span>
    </div>
    <div class="space">
      <GettingProdCheckItem
        v-for="item in allItem"
        :key="item.рсУИД"
        :data="item"
        @tap="openArticulScreen"
      /></div>
    
      <div class="col-12">
        <h5>
          <b>Итог {{ boxCount }} Кор. из {{ оитКоличествоКоробок }}</b>
        </h5>
        <h5>
          <b>Итог {{ weightCount }} Кг. </b>
        </h5>
      </div>

    <div class="btn-group w-100" role="group" >
      <button
          type="button"
          class="btn btn-warning btn-lg text-uppercase"
          @click="closeWithQuest"
          tabindex="-1"
        >
          <b>НАЗАД</b>
        </button>
        <button
          type="button"
          class="btn btn-primary btn-lg text-uppercase"
          @click="save"
          tabindex="-1"
        >
          <b>СОХРАНИТЬ</b>
        </button>
        <button
          type="button"
          class="btn btn-success btn-lg text-uppercase"
          @click="send"
          tabindex="-1"
        >
          <b>ПРИНЯТЬ</b>
        </button>
    </div>

    

    <ArticulScreen />
  </div>
  <!--Форма проверки для приемки-->
</template>
<script setup lang="ts">
import GettingProdCheckItem from "./widgets/GettingProdCheckItem.vue";
import { RoutingManager } from "@/classes/RoutingManager";
import { GettingManager } from "@/managers/getting/GettingManager";
import { Ref, computed, ref } from "vue";
import ArticulScreen from "./widgets/ArticulScreen.vue";
import { IScaning } from "@/interfaces/IScaning";
import { NotificationManager } from "@/classes/NotificationManager";
import { GetCount } from "@/functions/GetCount";
import { IGettingProductionProductItem } from "@/managers/getting/interfaces";

RoutingManager.instance.registry(
  RoutingManager.route.gettingProductionCheck,
  show,
  close
);
const seen = ref(false);

const allItem: Ref<any> = ref([]);
const оитНомерПалета = computed(() => {
  return GettingManager.instance.currentDocument.value?.оитНомерПалета;
});
//const countScaning = computed(()=>GettingManager.instance.currentScanings.value.length)
const boxCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Грузоместа");
});
const weightCount = computed(() => {
  return GetCount(GettingManager.instance.currentScanings.value, "Количество");
});

const docName = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.Наименование;
  }
  return "Документ не найден";
});
const оитКоличествоКоробок = computed(() => {
  if (GettingManager.instance.currentDocument.value) {
    return GettingManager.instance.currentDocument.value!.оитКоличествоКоробок;
  }
  return "";
});
function close() {
  seen.value = false;
}

function show() {
  seen.value = true;
}

async function closeWithQuest() {
  RoutingManager.instance.pushName(RoutingManager.route.gettingProductionForm);
}

function save() {
  //
}

function send() {
  //
}

function openArticulScreen(productName: string) {
  if (seen.value) {
    GettingManager.instance.emit("openArticulScreen", [productName]);
  }
}

function createUniqProductionList(products:IGettingProductionProductItem[]){
  const list:any = {}
  for (const item of products){
    const НоменклатураСсылка = item.Номенклатура.Ссылка.Ссылка
    const ХарактеристикаСсылка = item.Характеристика.Ссылка.Ссылка
    const СерияСсылка = item.Серия.Ссылка
    const key = НоменклатураСсылка + ХарактеристикаСсылка + СерияСсылка
    if(!list.hasOwnProperty(key)){
      list[key]=Object.assign({}, item)
      continue
    }
    list[key].Количество += item.Количество
    list[key].КоличествоВЕдиницахИзмерения += item.КоличествоВЕдиницахИзмерения
  	list[key].Грузоместа += item.Грузоместа
            

  }
  const result = []
  for (const key of Object.keys(list)){
    result.unshift(list[key])
  }
  return result
}

function prepareData(){
  const allItems = GettingManager.instance.currentDocument.value?.Товары
  const 

      // if (getting_prod_form.prod_list_set===null) {
      //   swal("Не найдено ни одного сканирования")
      //   getting_prod_form.show()
      // }
      prod_list_set  = Array.from(getting_prod_form.prod_list_set)

      scaning=[] // Все сканирования
      err=[]
      // init array prod_list
      for (i of prod_list_set) {
        for (y of prod_list) {
          if (y.Номенклатура.Ссылка.Ссылка===undefined) {
            nom=y.Номенклатура.Ссылка
            har=y.Характеристика.Ссылка
            ser=y.Серия.Наименование
          }

          if (i===y.Номенклатура.Ссылка.Ссылка+y.Характеристика.Ссылка.Ссылка+y.Серия.Наименование) {
            if (err.indexOf( y.Номенклатура.Ссылка.Ссылка+y.Характеристика.Ссылка.Ссылка+y.Серия.Наименование) == -1 ) {
              scaning.push(Object.assign({}, y))
              err.push(y.Номенклатура.Ссылка.Ссылка+y.Характеристика.Ссылка.Ссылка+y.Серия.Наименование)
            }
          }
        }
      }
      // собираем массив для отображения сборки массива номенкл хар-ка
      for (i of this.all_item) {
		      i.КоличествоКоробок=0
          i.ТекущееКоличество=0
		      i.ТекущееКоличествоВЕдиницахИзмерения=0
          i.Артикул=""
          i.Номенклатура.ЕдиницаИзмерения = {"Наименование":""}
        for (y of prod_list) {
          if ((i.Номенклатура.Наименование   === y.Номенклатура.Наименование )&&
          (i.Характеристика.Наименование === y.Характеристика.Наименование )){
            i.Номенклатура.ЕдиницаИзмерения = y.Номенклатура.ЕдиницаИзмерения
            i.ТекущееКоличество +=y.Количество
            i.ТекущееКоличество =  rounded(i.ТекущееКоличество)
            i.Артикул           =  y.Артикул
            i.ПЛУ               =  y.ПЛУ
  		      i.ТекущееКоличествоВЕдиницахИзмерения += y.КоличествоВЕдиницахИзмерения
            i.ТекущееКоличествоВЕдиницахИзмерения =  rounded(i.ТекущееКоличествоВЕдиницахИзмерения)
            if (i.Номенклатура.ЕдиницаИзмерения.Наименование==="шт") {
              i.ТекущееКоличествоВЕдиницахИзмерения =  rounded(i.ТекущееКоличествоВЕдиницахИзмерения,0)
            }
            i.КоличествоВЕдиницахИзмерения		   = i.Количество/rounded(y.Номенклатура.ВесЧислитель)
  		      i.КоличествоВЕдиницахИзмерения       =  rounded(i.КоличествоВЕдиницахИзмерения)
  		      i.КоличествоКоробок+=y.Грузоместа
            //this.box_count+=y.Грузоместа
            y.ВЗаказе = true
        }
      }
      }

      // Сортировка
      this.all_item.sort((a, b) =>{
        a.Артикул - b.Артикул
      })

      for (i of this.all_item) {
        ВПроцСоотношении=Math.round((100/i.КоличествоУпаковок)*i.ТекущееКоличествоВЕдиницахИзмерения)
        if (String(ВПроцСоотношении)==="NaN") {
          ВПроцСоотношении=0
        }
        if (ВПроцСоотношении===100) {
          i.cls=" alert alert-success "
        }
        if (ВПроцСоотношении>100) {
          i.cls=" alert alert-warning "
          this.КвантыНеСоблюдены=true
        }
        if (ВПроцСоотношении<100) {
          i.cls=" alert alert-info "
        }
        if (ВПроцСоотношении===0) {
          i.cls=" alert alert-danger "
        }
      if (ВПроцСоотношении>110) {
          i.cls=" alert alert-orange "
        }
        i.ВПроцСоотношении=ВПроцСоотношении
        //this.weight_count+=i.ТекущееКоличество
      }
      //this.weight_count=rounded(this.weight_count)
      if (this.all_item.filter(i=>i.cls===' alert alert-success ').length===this.all_item.length){
        doc=GetData("prod_doc",'j')
        doc.completed=true
        SetData("prod_doc",doc)
      }else{
        doc=GetData("prod_doc",'j')
        doc.completed=false
        SetData("prod_doc",doc)
      }

      //this.item_from_send=arr_item;
      // заполняем массив для отправки номенкл хар серия
      for (i of scaning) {
        i.ТекущееКоличество=0
        i.ТекущееКоличествоВЕдиницахИзмерения=0
        Грузоместа=0
        for (y of prod_list) {
          if ((i.Номенклатура.Наименование   === y.Номенклатура.Наименование )&&
          (i.Характеристика.Наименование === y.Характеристика.Наименование )&&
          (i.Серия.Наименование          === y.Серия.Наименование ))
          {
            Грузоместа+=y.Грузоместа
            i.ТекущееКоличество+=rounded(y.Количество) //Number(prod_list[y].Количество.toFixed(3))
            i.ТекущееКоличествоВЕдиницахИзмерения+=rounded(y.КоличествоВЕдиницахИзмерения)
            if (i.Номенклатура.ЕдиницаИзмерения.Наименование==="шт") {
              i.ТекущееКоличествоВЕдиницахИзмерения = rounded(i.ТекущееКоличествоВЕдиницахИзмерения,0)
            }
          }
        }
        i.Грузоместа = Грузоместа
      }
      this.item_from_send=scaning
}
</script>
