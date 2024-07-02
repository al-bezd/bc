let prod_list=[]
getting_prod_load = new Vue({
  el:'#getting_prod_load',
  data:{
    name:'getting_prod_load',
    seen:false,
    barcode:"",
    documents:[],

  },
  methods:{
    closeq() {
      qw.show("Вы уверенны что хотите перейти обратно?",form_menu.show,getting_prod_load.show,{});
    },
    show(){
      all_vue_obj.map(i=> i.seen = false)
      this.seen = true
      SetData('current_option',this.name)
      getFile(GetData('current_user', 'j').Ссылка.Ссылка, (res)=> {
        if (res !== -1) {
          this.documents = res.data.docs.filter((item)=>{return item.Наименование.toLowerCase().indexOf("заказ")<0})
        }
      }, 'user_docs', 'user_docs')
    },
    Scan(){
    },
    get_document_order(){
      bc=PodgotovitBarcode(this,this.barcode)
      this.barcode=""

       axios.get(url_to_base+'/barcode2020/hs/barcode/execute',
      {
        params :{
          "get_doc_move":true,
          "ID":bc
        }
      }).then((response)=>{
        SetData('prod_doc',response.data)
        getting_prod_load.output_response(response.data)
        soundClick("resurse/GOOD.mp3")
      }).catch((error)=>{
        swal(JSON.stringify(error))
      })

    },
    output_response(response){
      prod_list=[]
      getting_prod_check.prod_doc = response.Ссылка.Наименование
      getting_prod_form.prod_doc = response.Ссылка.Наименование
      getting_prod_form.show()
    },
    delete_document(Ссылка) {
      getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res) =>{
        for (i of res.data.docs) {
          if (i.Ссылка.Ссылка === Ссылка) {
            res.data.docs.splice(res.data.docs.indexOf(i), 1)
            setFile(res, 'user_docs', 'user_docs')
            getting_prod_load.show()
            break
          }
        }
      }, 'user_docs', 'user_docs')
    },
    load_document(Ссылка) {
      getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res) =>{
        for (i of res.data.docs) {
          if (i.Ссылка.Ссылка === Ссылка) {
            SetData("prod_doc", i)
            if (i.scanings == null) {
              SetData('prod_list', [])
              prod_list = []
            } else {
              SetData('prod_list', i.scanings)
              prod_list = i.scanings
            }
            //getting_prod_form.scaning_response_set = $.isEmptyObject(i.scanings_set) ? new Set() : new Set(i.scanings_set)
            getting_prod_form.show()
          }
          continue
        }

      }, 'user_docs', 'user_docs')
    },
   
  }
})

getting_prod_form = new Vue({
  el:'#getting_prod_form',
  data:{
    name:'getting_prod_form',
    seen:false,
    barcode:"",
    prod_doc:"",
    it_palet:false,
    count_scaning:0,
    box_in_order:0,
    prod_list_set:new Set(),

  },
  methods:{
    closeq() {
      qw.show("Вы уверенны что хотите перейти обратно?",getting_prod_load.show,getting_prod_form.show,{});
    },
    show(){
      SetData('current_option',this.name)
      all_vue_obj.map(i=> i.seen = false)
      this.seen = true
      //GetCount(GetData("prod_doc","j").Товары,"рсГрузоместа");
      this.render()
      this.box_in_order=GetCount(prod_list,'Грузоместа')

  },
    scaning(){
      bc=PodgotovitBarcode(this,this.barcode)
      this.barcode=""
      if (bc==="") {
          return
      }
    
      Штрихкод         = bc.slice(2,16)
      Количество       = Number(bc.slice(20,26))/1000
      ДатаПроизводства = bc.slice(28,34)
      ГоденДо          = bc.slice(36,42)

      Структура={Штрихкод:Штрихкод,Количество:Количество,ДатаПроизводства:ДатаПроизводства,ГоденДо:ГоденДо}

      if (admin.use_local_db) {
          getFile(Структура.Штрихкод,(res)=>{
          if (res===-1) {
            swal('Продукция с таким штрих кодом не найдена')
            return
          }
          res.data.Штрихкод = Структура.Штрихкод;
          res.data.bc=bc;
          CheckScaningGetting(this,res.data,Структура.Количество,Структура.ДатаПроизводства,Структура.ГоденДо)
        },'1c','barcodes')


      }else{

        params={
          "barcode":this.bc,
          "Наименование":load_doc.response.Ссылка.Наименование,
          "Тип":load_doc.response.Ссылка.Тип,
          "Вид":load_doc.response.Ссылка.Вид,
          "Ссылка":load_doc.response.Ссылка.Ссылка
        }
         axios.get(url_to_base+'/barcode2020/hs/barcode/scaning_barcode',{
           params :params
          })
           .then( (response)=> {
          if (response.data.РезультатПроверки) {
            СтруктураШК={Ссылка:response.data}
            CheckScaning(this,СтруктураШК,Количество,ДатаПроизводства,ГоденДо)
          }else {
            swal(response.data.Текст)
            this.show()
            soundClick("resurse/ERROR.mp3")
          }
        }).catch( (error)=> {
          swal(JSON.stringify(error))
          this.show()
        })
      }
      this.box_in_order=GetCount(prod_list,'Грузоместа')
    },
    clear_quest(){
      prod_list=[]
      this.render()
    },
    delete_scaning(param){
      for (i of prod_list) {
        if(i.IDSec === param.id) {
          prod_list.splice(prod_list.indexOf(i), 1)
          $('#'+param.id).remove()
          break
        }
      }
      SetData("prod_list",prod_list)
      this.show()

    },
    delete_scaning_in_articul_list(param){
      for (i of prod_list) {
        if(i.IDSec === param.id) {
          prod_list.splice(prod_list.indexOf(i), 1)
          $('#'+param.id).remove()
          break
        }
      }
      SetData("prod_list",prod_list)
      this.render()
    },

    render(){
      $("#getting_prod_list").html('')
      if (prod_list!==null) {
        GetListSortBy(prod_list,'History')
        for (i of prod_list) {
          i.free=false
          $("#getting_prod_list").prepend(FillTemplate(i))
        }
      }
      this.count_scaning = prod_list.length
      this.box_in_order  = GetCount(prod_list,'Грузоместа')
    }
}
})

getting_prod_check = new Vue({
  el:'#getting_prod_check',
  data:{
    name:'getting_prod_check',
    seen:false,
    barcode:"",
    prod_doc:"",
    //prod_doc_count_box:0,
    item_order:{},
    count_items:0,
    box_count:0,
    weight_count:0,
    all_item:[],
    scaning:[],
    articul_list_seen:false,
    CountThisArticul:0,
    prod_list:prod_list,
    item_from_send:[],
    оитНомерПалета:'',
  },
  methods:{
    closeq(){
      getting_prod_form.show();
      //qw.show("Вы уверенны что хотите перейти обратно?",getting_prod_form.show,getting_prod_check.show,{});
    },
    show(){
      this.item_order=GetData("prod_doc",'j')
      this.box_count=0
      this.weight_count=0
      this.оитНомерПалета=this.item_order.оитНомерПалета
      SetData('current_option',this.name)
      this.articul_list_seen=false;
      arr_item = [];
      all_vue_obj.map(i=> i.seen = false)
      this.seen = true
      prod_list.map(i=>{getting_prod_form.prod_list_set.add(i.Номенклатура.Ссылка.Ссылка+i.Характеристика.Ссылка.Ссылка+i.Серия.Наименование)})
      this.all_item = this.item_order.Товары

      if (getting_prod_form.prod_list_set===null) {
        swal("Не найдено ни одного сканирования")
        getting_prod_form.show()
      }
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

    this.box_count    = GetCount(prod_list, "Грузоместа")
    this.weight_count = rounded(GetCount(prod_list, "Количество"))
    },
    articul_list_seen(){
      
    },
    send(){
      doc=GetData("prod_doc","j");
      if (this.box_count!==Number(doc.оитКоличествоКоробок)) {
        swal("Количество коробок по факту не совпадает с количеством по документу");
        return
      }
      qw.show("",console.log,getting_prod_check.show);
      $('#ok_button_id').hide();
      qw.question_window_text = 'Ожидайте записи документа!!!';


      params={
        "Наименование":doc.Ссылка.Наименование,
        "Тип":doc.Ссылка.Тип,
        "Вид":doc.Ссылка.Вид,
        "Ссылка":doc.Ссылка.Ссылка,
        "Товары":Object.assign([],getting_prod_check.item_from_send),
        "Пользователь":GetData("current_user",'j'),
        "check_prod_doc":true
      };
      axios({
        method: 'post',
        url: url_to_base+'/barcode2020/hs/barcode/execute',
        data: JSON.parse(JSON.stringify(params))
      }).then((response)=>{
        if (response.data.РезультатПроверки) {
          swal(response.data.Текст)
          qw.seen=false
          qw.question_window_text = ''
          getting_prod_load.show()
          //getting_prod_form.show()
          $('#ok_button_id').show()

          RemoveData('prod_doc')
          RemoveData('prod_list')
          RemoveData('prod_list_set')

        }else{
          swal(response.data.Текст)
          getting_prod_check.show()
        }

      }).catch((e)=>{
        swal(JSON.stringify(e))
        getting_prod_form.show()
        $('#ok_button_id').show()
      });

    },
    OpenThisArticul(Номенклатура){
      this.articul_list_seen=true
      arr_res=[]
      arr=prod_list
      for (i of arr.filter(item=>item.Номенклатура.Наименование===Номенклатура)) {
          arr_res.push(i)
      }
      this.prod_list=arr_res
      this.CountThisArticul=GetCount(arr_res,'Грузоместа')
      window.scrollTo(0 ,0)
      SetData('OpenThisArticul',Номенклатура)
    },
    delete_scaning_quest(id){
      getting_prod_form.delete_scaning_in_articul_list(id)
      this.render()
      getting_prod_check.OpenThisArticul(GetData('OpenThisArticul'))
    },
    save(){
      getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> {
        mach = false
        for (i of res.data.docs) {
          if (i.Ссылка.Ссылка === GetData('prod_doc', 'j').Ссылка.Ссылка) {
            //i = GetData('prod_doc', 'j')
            i.scanings = prod_list
            setFile(res, 'user_docs', 'user_docs')
            swal('Сохранено')
            mach = true
            break
          }
          
        }
        if (!mach) {
          ob = GetData('prod_doc', 'j')
          ob.scanings = prod_list
          res.data.docs.unshift(ob)
          setFile(res, 'user_docs', 'user_docs')
          swal('Сохранено')
        }
      }, 'user_docs', 'user_docs')
    }
  }
})

function CheckScaningGetting(self,СтруктураШК,Количество,ДатаПроизводства,ГоденДо){
  bc=СтруктураШК.bc
  Грузоместа = 1
  Палетная   = "row alert alert-info"

  if (self.it_palet==true) {
      Грузоместа = FindGM(bc)
      Палетная   = "row alert alert-warning"
      self.it_palet=false;
  }
  prod_doc=GetData('prod_doc','j')

  in_order = prod_doc.Товары.filter( item=>
    СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование &&
    СтруктураШК.Ссылка.Характеристика.Наименование == item.Характеристика.Наименование)

  ЧтоЕсть = prod_doc.Товары.filter( item=>СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование)

  in_order = in_order.length>0 ? true : false

  if (!in_order) {
    //
    text =`Продукции \n\n ${СтруктураШК.Ссылка.Номенклатура.Наименование} ${СтруктураШК.Ссылка.Характеристика.Наименование} ПЛУ: ${СтруктураШК.Ссылка.ПЛУ} \n\n нет в заказе`
    if (ЧтоЕсть.length>0) {
      text+=`, нужна\n\n`
      for (i of ЧтоЕсть) {
        text +=  `${i.Номенклатура.Наименование} ${i.Характеристика.Наименование} ПЛУ: ${i.ПЛУ} \n\nили `
      }
      text=text.substring(0, text.length - 3)
    }else {
      text
    }
    swal(text);
    soundClick('resurse/ERROR.mp3')
    return
  }

  КоличествоВЕдиницахИзмерения = GetCountFromBarcode(СтруктураШК,Грузоместа,Количество)
  /*if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1]!==undefined && СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование==="шт") {
    if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Свойство.Наименование==="Количество(хар)") {

      //КоличествоВЕдиницахИзмерения = СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Значение * Количество*(СтруктураШК.Ссылка.Номенклатура.ВесЧислитель/СтруктураШК.Ссылка.Номенклатура.ВесЗнаменатель);
      КоличествоВЕдиницахИзмерения = СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Значение * Грузоместа;
    }
  }*/

  response={
    ID:'',
    Номенклатура:СтруктураШК.Ссылка.Номенклатура,
    Характеристика:СтруктураШК.Ссылка.Характеристика,
    ПЛУ:СтруктураШК.Ссылка.ПЛУ===undefined?"":СтруктураШК.Ссылка.ПЛУ,
    Серия:{
        Наименование : Date1C(ДатаПроизводства,ГоденДо),
        Ссылка       : `${ДатаПроизводства}${ГоденДо}`
    },
    Количество:Количество,
    КоличествоВЕдиницахИзмерения:КоличествоВЕдиницахИзмерения,
    ЕдиницаИзмерения:СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
    Артикул    : СтруктураШК.Ссылка.Номенклатура.Артикул,
    Грузоместа : Грузоместа,
    Палетная   : Палетная,
    bc:bc
  }
  response.IDSec=response.ID+Date.now();
  prod_list.unshift(response);
  SetData("prod_list",prod_list);
  if (prod_list.length>1) {
    if (prod_list[1].bc===bc) {
      soundClick("resurse/REPEAT_ARIAL.mp3")
    }else{
      soundClick("resurse/GOOD.mp3")
    }
  }else{
    soundClick("resurse/GOOD.mp3")
  }
  getting_prod_form.render()
}

