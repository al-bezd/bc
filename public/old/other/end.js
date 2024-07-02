
var all_vue_obj = [
  form_menu,
  form_select_user,
  load_doc,
  form_doc,
  check_doc,
  form_doc_free,
  check_doc_free,
  qw,
  msg,
  loading_holder,
  document_container,
  getting_prod_load,
  getting_prod_form,
  getting_prod_check
];
function Load(){
  SetData('url_to_base',url_to_base)
  current_option = GetData("current_option")
  current_user   = GetData("current_user",'j')
  prod_doc       = GetData("prod_doc",'j')
  if (current_user !== null) {
    current_doc  = GetData("current_doc",'j')
    SetData('containers',current_user.containers==null?[]:current_user.containers)
    if (current_doc !== null) {
      scaning_response=[]
      scaning_response=GetData("scaning_response",'j')
      if (scaning_response !== null) {
        scaning_response.map(i=> {
          i.free=false
          $("#scaning_response_list").prepend(FillTemplate(i))
        })
      }else{
        scaning_response=[]
      }
      scaning_response_free=[]
      scaning_response_free=GetData("scaning_response_free",'j')
      if (scaning_response_free !== null) {
        scaning_response_free=scaning_response_free
        scaning_response_free.map(i=>{
          i.free=true
          $("#scaning_response_list_free").prepend(FillTemplate(i))
        })
      }else{
        scaning_response_free=[]
      }

      if (current_option !== null) {
        for (i of all_vue_obj.filter(item=> item.name === current_option)) {
            i.show()
        }
      }else {
        form_select_user.show()
      }
      load_doc.response = current_doc
      form_doc.current_doc  = load_doc.response.Ссылка.Наименование
      check_doc.current_doc = load_doc.response.Ссылка.Наименование
      if(GetData("user_documents","j")==null){
		      SetData("user_documents",[])
	    }
    }else if(prod_doc !== null) {
        getting_prod_load.show()
        getting_prod_load.output_response(prod_doc)
        prod_list      = GetData("prod_list","j")
        if (prod_list!==null) {
          getting_prod_form.show()

        }else{
          prod_list=[]
        }
    }
    else if(GetData('scaning_response_free','j')!==null){

      scaning_response_free = GetData('scaning_response_free','j')
      for (i of scaning_response_free) {
          i.free=true
          $("#scaning_response_list_free").prepend(FillTemplate(i))
        }
      form_doc_free.count_scaning = scaning_response_free.length
      mode=GetData('no_order_mode')
      if(mode==="Остатки"){
        form_doc_free.show()
      }
      if(mode==="ИнфоЛист"){
        form_doc_free.show("ИнфоЛист")
      }
      if(mode===null){
        form_doc_free.show()
      }

    }else{
      form_menu.show();
    }
  }else{
    form_select_user.show();
  }
  try{
    getStorage( (data) =>{
      torgovie_seti = data
      if(data.length){
        torgovie_seti = data[0].data
      }
      
      check_doc_free.torgovie_seti = torgovie_seti
      if(torgovie_seti===null||torgovie_seti===[]){
        SetTorgovieSeti()
      }
    },'torgovie_seti','torgovie_seti')


  }catch(e){
    SetTorgovieSeti()
  }

  getStorage( (data) =>{
    data.map((item)=>{custom_log.unshift(item)})
  },'log','log')


}
$(document).ready(()=>{
  Load()
  mian_order = GetData('main_order','j')
  if(mian_order===null){
    main_order = "Основной склад не назначен" 
  }else{
    main_order = mian_order.Наименование
  }


  
})

Vue.component('scaning-tmp',{
  props:['item','obj'],
  methods:{
    ev(param){
      //alert(param);
      return eval(eval(param[0])+'.'+param[1]+`(${JSON.stringify(param[2])})`)
    }
  },

  template:`<div :class="item.Палетная" role="alert" :name="item.IDSec">
      <div class="col-md-10 col-sm-10 col-xs-10">
          <div class="row">
              <div :class="'col-md-12 col-sm-12 col-xs-12 articul'+item.Артикул"><b>{{item.Артикул}}</b> {{item.Номенклатура.Наименование}}
              </div>
          </div>
          <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12">
                  {{item.Характеристика.Наименование}}
              </div>
          </div>
          <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12">{{item.Серия.Наименование}}</div>
          </div>
          <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12"></b>ПЛУ : {{item.ПЛУ}}</b></div>
          </div>
          <div class="row">
              <div class="col-md-12 col-sm-12 col-xs-12"><b>{{item.Количество}}</b> <b>кг.</b></div>
              <div class="col-md-12 col-sm-12 col-xs-12"><b>{{item.КоличествоВЕдиницахИзмерения}}</b> <b>{{item.ЕдиницаИзмерения}}.</b></div>
              <div class="col-md-12 col-sm-12 col-xs-12"><b>{{item.Грузоместа}}</b> <b>кор.</b></div>
          </div>
      </div>
      <div class="col-md-2 col-sm-2 col-xs-2">
          <button type="button" class="btn btn-danger" @click='ev([obj,"delete_scaning_quest",{"id":item.IDSec}])'>Х</button>
      </div>
  </div>`
})

document.addEventListener('keyup', (event) =>{
  if (!admin.use_clip_board) {
    return
  }
  if(event.code=="F13"){
    if (form_select_user.seen ) {

        cordova.plugins.clipboard.paste(
           (text)=> {
            if (text!=="") {
                form_select_user.barcode=text
                form_select_user.get_user()
            }
            cordova.plugins.clipboard.clear()
          })

    }

    else if (load_doc.seen) {

        cordova.plugins.clipboard.paste(
           (text)=> {
            if (text!=="") {
                load_doc.load_doc_bc=text
                load_doc.barcode = text
                load_doc.get_document_order()
            }
            cordova.plugins.clipboard.clear()
          })

    }

    else if (getting_prod_load.seen) {

      cordova.plugins.clipboard.paste(
         (text)=> {
          if (text!=="") {
              getting_prod_load.barcode=text
              getting_prod_load.get_document_order()
          }
          cordova.plugins.clipboard.clear()
        })

  }

  else if (HandAddItem.seen) {

      cordova.plugins.clipboard.paste(
         (text)=> {
          if (text!=="") {
            HandAddItem.ШК=text
            HandAddItem.Scaning()
          }
          cordova.plugins.clipboard.clear()
        })

  }

  else if (form_doc.seen) {

        cordova.plugins.clipboard.paste(
           (text)=> {
            if (text!=="") {
                form_doc.barcode=text
                form_doc.scaning()
            }
            cordova.plugins.clipboard.clear()
          })

    }

    else if (form_doc_free.seen) {

        cordova.plugins.clipboard.paste(
           (text)=> {
            if (text!=="") {
                form_doc_free.barcode=text
                form_doc_free.scaning()
            }
            cordova.plugins.clipboard.clear()
          })

    }



    else if (getting_prod_form.seen) {

        cordova.plugins.clipboard.paste(
           (text)=> {
            if (text!=="") {
                getting_prod_form.barcode=text
                getting_prod_form.scaning()
            }
            cordova.plugins.clipboard.clear()
          })

    }
    console.log(event)
  }
})
this_android=false