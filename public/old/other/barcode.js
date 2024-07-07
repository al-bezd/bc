
try {
  var form_select_user = new Vue({
    el: '#form_select_user',
    data: {
      name: "form_select_user", // имя формы
      seen: true, // параметр видимости
      barcode: "", // поле ввода шк пользователя
      go_button: false 
    },
    methods: {
      show() {
        setTimeout( ()=> {if (!admin.use_clip_board) {barcode_user.focus()}}, 100) // конструкция устанавливает фокус на элемент barcode_user через 0,1 сек
        $('#scaning_response_list_free').html('') // очищаем содержимое тега с id scaning_response_list_free
        $('#scaning_response_list').html('')// очищаем содержимое тега с id scaning_response_list
        SetData('current_option', this.name) // запсываем в локальное хранилище инфу о текущей опции(имя текущего окна)
        all_vue_obj.map(i => i.seen = false) // обход массива функцией map и устанавливаем видимость false
        this.seen = true // устанавливаем видимость true
        this.barcode = "" // очищаем поле ввода ШК
        this.go_button = false 
      },
      show_bild_orders() {
        load_doc.show() // показать форму меню сборки продукции
      },
      show_getting_prod() {
        getting_prod_load.show() // показать форму меню прием продукции
      },
      closeq() {
        qw.show("Вы уверенны что хотите перейти обратно?", form_menu.show, form_menu.show, {}) // вызов формы с вопросом
      },
      

      get_user() {
        axios.get(url_to_base + '/barcode2020/hs/barcode/get_user', // отправляем запрос на сервер , параметры ID шк пользователя 
          {
            params: {
              "ID": PodgotovitBarcode(this,this.barcode)// Заменяем все вхождения " " на ""
            }
          })
          .then( (response) =>{
            RemoveData('scaningN') // Обнуляем счетчик сканирования у form_doc
            RemoveData('scaningN_free')// Обнуляем счетчик сканирования у form_doc_free
            if (response.data.РезультатПроверки) {
              SetBarcods()// UPDATE BARCODE скачиваем все ШК с сервера 1С
              SetTorgovieSeti() // Скачиваем все установленные к выбору Торговые сети (необходимо для создания информационного листа)
              SetMainOrder() // Обновляем информацию по основному складу
              SetData("current_user", response.data) // запись в локальное хранилище информации о текущем пользователе
              getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> { // поиск в базе user_docs документов по данному пользователю
                if (res === -1) {// если не найден, то создать запись
                  setFile(
                    {
                      data: { docs: [] },
                      id: GetData('current_user', 'j').Ссылка.Ссылка
                    }, 'user_docs', 'user_docs')
                }
              }, 'user_docs', 'user_docs')
              form_select_user.go_button = true
              form_menu.fio = response.data // заполняем ФИО на форме form_menu
              form_menu.show() // открытие формы form_menu
              soundClick("resurse/GOOD.mp3") 
            } else {
              swal(response.data.Текст) // показываем ошибку с сервера
              form_select_user.show() // показываем форму выбора пользователя
              soundClick("resurse/ERROR.mp3")
            }
          })
          .catch( (error)=> {
            swal(error)
            form_select_user.show()
            soundClick("resurse/ERROR.mp3")
          })
        this.barcode = "" // очищаем поле ШК на форме авторизации пользователя
      },
      
      close() {
        this.seen = false
        this.barcode = ""
        this.go_button = false
      }
    }
  })

  var form_menu = new Vue({
    el: '.form_menu',
    data: {
      name: "form_menu",
      seen: false,
      fio: "",
      msgs: [], // сообщения

    },
    methods: {
      show() {
        SetData('current_option', this.name)
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
        if (GetData("current_user", 'j') === null) { // проверка на авторизацию пользователя, если нет то открываем форму авторизации
          form_select_user.show()
        } else {
          this.fio = GetData("current_user", 'j').Наименование
        }
        RemoveData('prod_doc') // очищаем лок хран от массива сканирований приемки
        form_doc_free.mode = 'Остатки' // режим сканирования без документа по умолчанию
      },

      close() {
        this.fio = ""
        this.seen = false
        Remove("user_documents")
      },
      show_bild_orders() {
        load_doc.show()
      },
      show_getting_prod() {
        getting_prod_load.show()
      },
      exit() {
        qw.show(
          "Вы действительно хотите выйти?",  
          ()=> { form_select_user.show(); RemoveData("current_user"); }, 
          form_menu.show, {})
      }
    }
  })
  //swal('form_menu loaded');
  var load_doc = new Vue({
    el: '#load_doc',
    data: {
      main: main,
      name: "load_doc",
      seen: false,
      barcode: "",
      response: {},
      input: load_doc_bc,
      documents: [],
      add_orders:
      {
        ДатаНачала: "",
        ДатаОкончания: "",
        Склад: main_order,
        Заголовок: "Загрузка заказов"
      },


    },
    methods: {

      close() {
        this.barcode = ""
        this.seen = false
        this.response = {}
      },
      Scan() {
        cordova.plugins.barcodeScanner.scan(
           (result) =>{
            this.barcode = result.text
            this.get_document_order()
          },
           (error) =>{
            swal("Scanning failed: " + error)
          }
        )
      },
      get_document_order() {
        bc = PodgotovitBarcode(this,this.barcode)
        this.barcode = ""
        qwe = this.documents.filter(i => i.ШК === bc)
        if (qwe.length > 0) {
          this.load_document(qwe[0].Ссылка.Ссылка)
          this.barcode = ""
          return
        }
        if (admin.use_local_orders) {

          getFile(bc, (response)=> {
            if (response === -1) {
              swal(`Данный заказ не найден в хранилище,
                попробуйте загрузить заказы и снова отсканируйте лист сборки, или отключите поиск заказов в хранилище и отсканируйте заказ снова,
              но убедитесь что находитесь в зоне WiFi`)
              return
            }
            response.data.ШК = bc;
            if ((response.data.рсТоварыДляЛимитов.length == 0) && (response.data.Ссылка.Вид === "ЗаказКлиента")) {
              swal("Товары для лимитов не заполнены в " + response.data.Ссылка.Наименование)
              load_doc.show()
              soundClick("resurse/ERROR.mp3")
            } else {
              SetData("current_doc", response.data)

              load_doc.output_response(response.data)
              soundClick("resurse/GOOD.mp3")
            }
          }, 'orders', 'orders')
        } else {
          axios.get(url_to_base + '/barcode2020/hs/barcode/get_order',
            {
              params: {
                "ID": bc
              }
            })
            .then( (response)=> {
              if (response.data.РезультатПроверки) {
                if ((response.data.рсТоварыДляЛимитов.length == 0) && (response.data.Ссылка.Вид === "ЗаказКлиента")) {
                  swal("Товары для лимитов не заполнены в " + response.data.Ссылка.Наименование)
                  load_doc.show()
                  soundClick("resurse/ERROR.mp3")
                } else {
                  SetData("current_doc", response.data)
                  load_doc.output_response(response.data)
                  soundClick("resurse/GOOD.mp3")
                }
              } else {
                swal(response.data.Текст)
                this.show()
                soundClick("resurse/ERROR.mp3")
              }
            })
            .catch( (error)=> {
              swal(JSON.stringify(error))
              this.show()
            })
        }
      },
      output_response(response) {
        scaning_response = []
        this.response = response
        form_doc.current_doc = response.Ссылка.Наименование
        check_doc.current_doc = response.Ссылка.Наименование
        form_doc.show()
      },
      show() {
     
        setTimeout( ()=> {
          if (!admin.use_clip_board) {
            load_doc_bc.focus()
          }
        }, 100)
        SetData('current_option', this.name)
        RemoveData("current_doc")
        RemoveData("scaning_response")
        RemoveData("scaning_response_free")
        RemoveData("scaningN")
        RemoveData("scaningN_free")
        RemoveData("СтруктураШК")
        RemoveData("no_order_mode")
        $('#scaning_response_list_free').html('')
        $('#scaning_response_list').html('')
        form_doc_free.mode = 'Остатки'
        all_vue_obj.map(i => i.seen = false)
        this.seen = true

        getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> {
          if (res !== -1) {
            load_doc.documents = res.data.docs.filter((item) => { return item.Наименование.toLowerCase().indexOf("заказ") >= 0 })
          }
        }, 'user_docs', 'user_docs')
      },
      closeq() {
        qw.show("Вы уверенны что хотите перейти обратно?", form_menu.show, load_doc.show, {})
      },
      delete_document(Ссылка) {
        getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> {
          for (i of res.data.docs) {
            if (i.Ссылка.Ссылка === Ссылка) {
              res.data.docs.splice(res.data.docs.indexOf(i), 1)
              setFile(res, 'user_docs', 'user_docs')
              load_doc.show()
            }
            continue
          }
        }, 'user_docs', 'user_docs')
      },
      load_document(Ссылка) {
        getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> {
          for (i of res.data.docs) {
            if (i.Ссылка.Ссылка === Ссылка) {
              SetData("current_doc", i)
              if (i.scanings == null) {
                SetData('scaning_response', [])
                scaning_response = []
              } else {
                SetData('scaning_response', i.scanings)
                scaning_response = i.scanings
              }
              form_doc.scaning_response_set = $.isEmptyObject(i.scanings_set) ? new Set() : new Set(i.scanings_set)
              form_doc.show()
            }
            continue
          }

        }, 'user_docs', 'user_docs')
      },
      StartScaning() {
        main.form_doc_free.show();
      },
      ShowLoadOrders() {
        if(this.add_orders.Склад==""){
          main_order_data = GetData('main_order','j')
          if(main_order_data!==null){
            this.add_orders.Склад = main_order_data.Наименование
          }
        }
        $("#LoadOrders").modal('show')
      },
      LoadOrdersClose() {
        $("#LoadOrders").modal('hide')
        this.add_orders.ДатаНачала = ""
        this.add_orders.ДатаОкончания = ""

      },
      LoadOrdersExecute(type) {
        if (this.add_orders.ДатаОкончания == "") {
          this.add_orders.ДатаОкончания = this.add_orders.ДатаНачала
        }

        if(type==='orders'){
          status_bar.msgs.push("ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!")
          GetOrders(new Date(this.add_orders.ДатаНачала) / 1, new Date(this.add_orders.ДатаОкончания) / 1, this.add_orders.Склад)
        }else if(type==='info_sheets'){
          status_bar.msgs.push("ИДЕТ ЗАГРУЗКА ИНФ. ЛИСТОВ!")
          GetInfoList(new Date(this.add_orders.ДатаНачала) / 1, new Date(this.add_orders.ДатаОкончания) / 1, this.add_orders.Склад)
        }

        this.LoadOrdersClose()
      }
    },
  })
  //swal('load_doc loaded');

  var form_doc = new Vue({
    el: '#form_doc',
    data: {
      name: "form_doc",
      seen: false,
      current_doc: "",
      barcode: "",
      it_palet: false,
      it_info_list: false,
      scaning_response: [],
      response: {},
      input: form_doc_bc,
      scaning_response_set: new Set(),
      bc: '',
      scaningN: 0,
      count_scaning: 0,
      box_in_order: 0,
      box_in_order: 0,

    },
    methods: {
      closeq() {
        qw.show("Вы уверенны что хотите перейти обратно?", load_doc.show, form_doc.show, {})
      },
      close() {
        this.seen = false
        load_doc.show()
        RemoveData("current_doc")
        RemoveData("scaning_response")
        this.type_order = ""
        this.number_order = ""
        this.barcode = ""
        scaning_response = []
        this.response = {}
      },
      check() {
        check_doc.show()
      },
      show() {
        SetData('current_option', this.name)
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
        GetCount(GetData("current_doc", "j").Товары, "рсГрузоместа")
        this.current_doc = GetData("current_doc", "j").Ссылка.Наименование
        $("#scaning_response_list").html('')
        if (scaning_response != null) {
          for (i of scaning_response) {
            i.free = false
            $("#scaning_response_list").prepend(FillTemplate(i))
          }
        }
        setTimeout(() => {
          if (!admin.use_clip_board) {
            form_doc_bc.focus()
          }
          this.count_scaning = scaning_response.length
          if (scaning_response != null) {
            this.box_in_order = GetCount(scaning_response, "Грузоместа")
          } else {
            this.box_in_order = 0
          }
        }, 100)
      },
      Scan() {
        cordova.plugins.barcodeScanner.scan(
          (result) => {
            this.barcode = result.text
            this.scaning()
          },
          (error) => {
            swal("Scanning fail: " + "" + error)
          }
        )
      },
      scaning() {
        this.barcode = PodgotovitBarcode(this,this.barcode)
        if (this.barcode === "") {
          return
        }
       
        this.bc = PodgotovitBarcode(this,this.barcode)
        Штрихкод = this.bc.slice(2, 16)
        Количество = Number(this.bc.slice(20, 26)) / 1000
        ДатаПроизводства = this.bc.slice(28, 34)
        ГоденДо = this.bc.slice(36, 42)

        if (admin.control_future_date === true) {
          date = new Date()
          bdate = new Date('20' + ДатаПроизводства.slice(0, 2), Number(ДатаПроизводства.slice(2, 4)) - 1, ДатаПроизводства.slice(4, 6))
          if (bdate > date) {
            future_date = bdate.toLocaleDateString()
            current_date = date.toLocaleDateString()
            swal(`Текущая дата ${current_date},\n дата производства на коробке ${future_date} коробка из будущего \nСКАНИРОВАНИЕ НЕ ДОБАВЛЕНО`)
            this.barcode = ""
            return
          }
        }
        Структура = { Штрихкод: Штрихкод, Количество: Количество, ДатаПроизводства: ДатаПроизводства, ГоденДо: ГоденДо }

        if (admin.use_local_db) {
          if (this.it_info_list) {
            getFile(this.bc,  (res)=> {
              if (res === -1) {
                swal('Информационный лист не найден')
                this.barcode = ""
                return
              }
              //scaning_response = res.data
              scaning_response=scaning_response.concat(res.data)
              form_doc.show()
            }, 'info_lists', 'info_lists')

          } else {

            getFile(Структура.Штрихкод,  (res)=> {
              if (res === -1) {
                swal('Продукция с таким штрих кодом не найдена')
                this.barcode = ""
                return
              }
              res.Штрихкод = Структура.Штрихкод
              CheckScaning(this, res.data, Структура.Количество, Структура.ДатаПроизводства, Структура.ГоденДо)

            }, '1c', 'barcodes')
          }
        } else {
          if (this.it_info_list) {
            axios.get(url_to_base + '/barcode2020/hs/barcode/execute', {
              params: {
                get_info_list: true,
                ID: this.bc
              },
            })
              .then(response => {
                for (i of response.data) {
                  scaning_response = i.list
                }
                form_doc.show()
              })
          } else {
            params = {
              "barcode": this.bc,
              "Наименование": load_doc.response.Ссылка.Наименование,
              "Тип": load_doc.response.Ссылка.Тип,
              "Вид": load_doc.response.Ссылка.Вид,
              "Ссылка": load_doc.response.Ссылка.Ссылка
            }
            axios.get(url_to_base + '/barcode2020/hs/barcode/scaning_barcode', {
              params: params
            }).then(response => {
              if (response.data.РезультатПроверки) {
                СтруктураШК = { Ссылка: response.data }
                CheckScaning(this, СтруктураШК, Количество, ДатаПроизводства, ГоденДо)
              } else {
                swal(response.data.Текст)
                this.show()
                soundClick("resurse/ERROR.mp3")
              }
            }).catch( (error)=> {
              swal(error)
              this.show()
            })
          }
        }
        setTimeout( ()=> {
          if (!admin.use_clip_board) {
            form_doc_bc.focus()
          }
        }, 100)
      },
      delete_scaning_quest(id) {
        delete_scaning_quest(scaning_response, id, this.delete_scaning,
          form_doc.show, id)
        form_doc_free.count_scaning = scaning_response_free.length
        form_doc.count_scaning = scaning_response.length

      },
      delete_scaning(param) {
        if(param === undefined){
          this.show()
          return
        }
        for (i in scaning_response) {
          if (scaning_response[i].IDSec === param.id) {
            scaning_response.splice(i, 1)
            $('#' + param.id).remove()
            break
          }
        }
        SetData("scaning_response", scaning_response)
        this.show()
      },
      clear_quest() {
        qw.show("Вы уверенны что хотите УДАЛИТЬ все ОТСКАНИРОВАННОЕ", form_doc.clear, form_doc.show, {})
      },
      clear() {
        scaning_response = []
        RemoveData("scaning_response")
        $('#scaning_response_list_free').html('')
        $('#scaning_response_list').html('')
        this.show()
      },
      OrderBy(param) {
        if (param === 'Артикул') {
          scaning_response = GetListSortBy(scaning_response, 'Articul')
        }
        if (param === 'История') {
          scaning_response = GetListSortBy(scaning_response, 'History')
        }
        SetData("scaning_response", scaning_response);
        form_doc.show()
      }
    },
  })

  var document_container = new Vue({
    data: {
      name: 'document_container',
      seen: false,
      containers: []
    },
    methods: {
      show() {
        this.seen = true
        doc = GetData("current_doc", "j")
        params = {
          "Тип": doc.Ссылка.Тип,
          "Вид": doc.Ссылка.Вид,
          "Ссылка": doc.Ссылка.Ссылка,
          "СтатусЗапроса": "Получить"
        }
        axios({
          method: "post",
          url: url_to_base + '/barcode2020/hs/barcode/document_container',
          data: JSON.parse(JSON.stringify(params)),
        }).then((response) => {

          if (response.data.РезультатПроверки) {

            this.containers = response.data.Текст
            table = scaning_response

            for (y of this.containers) {
              y.Количество = 0
              y.Вес = 0
              тара = GetData('containers', 'j').filter(item => item.Наименование === y.Тара.Наименование)
              if (тара.length > 0) {
                y.ВесШт = тара[0].Вес
              }
            }

            for (i of table) {
              for (y of this.containers) {
                if (i.Характеристика.рсТипКоробки.Наименование === y.Тара.Наименование) {
                  y.Вес += y.ВесШт * i.Грузоместа
                  y.Количество += i.Грузоместа
                }
              }
            }
            SetData("document_container", response.data.Текст)
          }

        }).catch((err) => {
          swal(String(err))
        })

      },
      close() {
        this.seen = false
      },
      save() {
        current_doc = GetData("current_doc", "j")
        params = {
          "Тип": current_doc.Ссылка.Тип,
          "Вид": current_doc.Ссылка.Вид,
          "Ссылка": current_doc.Ссылка.Ссылка,
          "Тара": this.containers,
          "СтатусЗапроса": "Записать"
        }
        axios({
          method: "post",
          url: url_to_base + '/barcode2020/hs/barcode/document_container',
          data: params,
        }).then((response) => {
          if (response.data.РезультатПроверки) {
            this.containers = response.data.Текст
            SetData("document_container", response.data.Текст)
            swal('Информация по таре записана')
            check_doc.show()
          }
        }).catch((err) => {
          swal(err)
        })
      },
      UpdateWeight(item) {
        item.Вес = item.Количество * item.ВесШт
      }
    }
  })

  var check_doc = new Vue({
    el: '#check_doc',
    data: {
      name: "check_doc",
      seen: false,
      type_order: form_doc.type_order,
      number_order: form_doc.number_order,
      barcode: "",
      current_doc: form_doc.current_doc,
      item_order: load_doc.response.data, //**
      all_item: [],
      КвантыНеСоблюдены: false,
      item_from_send: [],
      box_count: 0,
      weight_count: 0,
      articul_list_seen: false,
      scaning_response: scaning_response,
      CountThisArticul: 0,
      document_container: document_container,
      sending: false,
      add_item: {
        Заголовок: '',
        Номенклатура: {},
        Характеристика: {},
        Серия: {
          ДатаПроизводства: "01010001",
          ГоденДо: "01010001",
          Наименование: "",
          Ссылка: `${this.ДатаПроизводства}${this.ГоденДо}`
        },
        Количество: undefined,
        КоличествоВЕдиницахИзмерения: undefined,
        ЕдиницаИзмерения: 'кг',
        Артикул: "",
        Грузоместа: 1,
        Палетная: "row alert alert-info",
        bc: "",
        ПЛУ: ""
      }
    },
    methods: {
      closeq() {
        form_doc.show()
      },
      close() {
        form_doc.show()
        this.type_order = form_doc.type_order
        this.number_order = form_doc.number_order
        this.barcode = ""
        this.item_order = load_doc.response.data //**
        this.all_item = []
        this.КвантыНеСоблюдены = false
      },
      sendq() {
        if (this.КвантыНеСоблюдены) {
          qw.show("Вы уверенны что хотите записать заказ С НАРУШЕНИЕМ КВАНТОВ??? ", check_doc.send, check_doc.show, {})
        } else {
          qw.show("Вы уверенны что хотите записать заказ? ", check_doc.send, check_doc.show, {})
        }
      },
      send(Режим) {
        if (Режим.Режим == "запись") {
          $('#ok_button_id').hide()
          qw.question_window_text = 'Ожидайте записи документа!!!'
        }
        if (this.sending === true) {
          swal('Операция записи документа еще выполняется')
          return
        }
        this.sending = true

        doc = GetData("current_doc", "j");
        params = {
          "Наименование": doc.Ссылка.Наименование,
          "Тип": doc.Ссылка.Тип,
          "Вид": doc.Ссылка.Вид,
          "Ссылка": doc.Ссылка.Ссылка,
          "Товары": this.item_from_send,
          "КвантыНеСоблюдены": this.КвантыНеСоблюдены,
          "Пользователь": GetData("current_user", 'j'),
          "Режим": Режим.Режим
        }
        axios({
          method: 'post',
          url: url_to_base + '/barcode2020/hs/barcode/check_and_write_doc',
          data: JSON.parse(JSON.stringify(params))
        }).then( (response)=> {
          // handle success
          this.sending = false
          if (response.data.РезультатПроверки) {
            if (Режим.Режим == "проверка") {
              qw.show(response.data.Текст, check_doc.send, check_doc.show, { "Режим": "запись" })
            } else {
              swal(response.data.Текст)
              qw.seen = false
              load_doc.show()
              $('#ok_button_id').show()
              qw.question_window_text = ''
              params = {
                "Наименование": doc.Ссылка.Наименование,
                "Тип": doc.Ссылка.Тип,
                "Вид": doc.Ссылка.Вид,
                "Ссылка": doc.Ссылка.Ссылка,
                "Товары": scaning_response,
                "set_scaning_in_order": true
              }
              axios({
                method: 'post',
                url: url_to_base + '/barcode2020/hs/barcode/execute',
                data: JSON.parse(JSON.stringify(params))
              }).then((response) => {
                console.log(response.data.Текст)
                //swal(response.data.Текст);
              }).catch((response) => {
                swal(response)
              })
            }
          } else {
            this.sending = false
            swal(response.data.Текст)
            check_doc.show()
          }
        })
          .catch((response) => {
            this.sending = false
            swal(response.data.Текст)
            this.show()
          })
      },
      show() {
        $('#ok_button_id').show()
        this.sending = false
        if (GetData("current_doc", 'j') == null) {
          load_doc.show()
        } else {
          this.current_doc = GetData("current_doc", 'j').Ссылка.Наименование
        }
        this.box_count = 0
        this.weight_count = 0
        SetData('current_option', this.name)
        this.КвантыНеСоблюдены = false
        this.item_order = GetData("current_doc", 'j')
        this.all_item = this.item_order.Товары
        this.articul_list_seen = false
        arr_item = []
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
        for (i of scaning_response) {
          form_doc.scaning_response_set.add(
            i.Номенклатура.Ссылка.Ссылка
            + i.Характеристика.Ссылка.Ссылка
            + i.Серия.Наименование
          )
        }
        if (form_doc.scaning_response_set === null) {
          swal("Не найдено ни одного сканирования")
          form_doc.show()
        }
        scaning_response_set = Array.from(form_doc.scaning_response_set)
        scaning = [] // Все сканирования
        err = []
        for (i of scaning_response_set) {
          for (y of scaning_response) {
            if (y.Номенклатура.Ссылка.Ссылка === undefined) {
              nom = y.Номенклатура.Ссылка
              har = y.Характеристика.Ссылка
              ser = y.Серия.Наименование
            }
            if (i === y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Наименование) {
              if (err.indexOf(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Наименование) === -1) {
                scaning.push(Object.assign({}, y))
                err.push(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Наименование)
              }
            }
          }
        }
        // собираем массив для отображения сборки массива номенкл хар-ка
        for (i of this.all_item) {
          i.КоличествоКоробок = 0
          i.ТекущееКоличество = 0
          i.ТекущееКоличествоВЕдиницахИзмерения = 0
          i.Артикул = ""
          i.Номенклатура.ЕдиницаИзмерения = { "Наименование": "" }
          for (y of scaning_response) {
            if ((i.Номенклатура.Наименование === y.Номенклатура.Наименование) &&
              (i.Характеристика.Наименование === y.Характеристика.Наименование)) {

              i.Номенклатура.ЕдиницаИзмерения = y.Номенклатура.ЕдиницаИзмерения
              i.ТекущееКоличество += y.Количество
              i.ТекущееКоличество = rounded(i.ТекущееКоличество)
              i.Артикул = y.Артикул
              i.ПЛУ = y.ПЛУ
              i.ТекущееКоличествоВЕдиницахИзмерения += y.КоличествоВЕдиницахИзмерения
              i.ТекущееКоличествоВЕдиницахИзмерения = rounded(i.ТекущееКоличествоВЕдиницахИзмерения)
              if (i.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
                i.ТекущееКоличествоВЕдиницахИзмерения = rounded(i.ТекущееКоличествоВЕдиницахИзмерения, 0)
              }
              i.КоличествоВЕдиницахИзмерения = i.Количество / rounded(y.Номенклатура.ВесЧислитель)
              i.КоличествоВЕдиницахИзмерения = rounded(i.КоличествоВЕдиницахИзмерения)
              i.КоличествоКоробок += y.Грузоместа
              //this.box_count += y.Грузоместа
              y.ВЗаказе = true

            }
          }
        }

        // Сортировка
        this.all_item.sort((a, b) => {
          return a.Артикул - b.Артикул
        })

        for (i of this.all_item) {
          ВПроцСоотношении = Math.round((100 / i.КоличествоУпаковок) * i.ТекущееКоличествоВЕдиницахИзмерения)

          if (String(ВПроцСоотношении) === "NaN") {
            ВПроцСоотношении = 0
          }
          if (ВПроцСоотношении === 100) {
            i.cls = " alert alert-success "
          }

          if (ВПроцСоотношении > 100) {
            i.cls = " alert alert-warning "
            this.КвантыНеСоблюдены = true
          }
          if (ВПроцСоотношении < 100) {
            i.cls = " alert alert-info "
          }
          if (ВПроцСоотношении === 0) {
            i.cls = " alert alert-danger "
          }
          if (ВПроцСоотношении > 110) {
            i.cls = " alert alert-orange "
          }
          i.ВПроцСоотношении = ВПроцСоотношении
          //this.weight_count += i.ТекущееКоличество
        }
        //this.weight_count = rounded(this.weight_count)

        if (this.all_item.filter(i => i.cls === ' alert alert-success ').length === this.all_item.length) {
          doc = GetData("current_doc", 'j')
          doc.completed = true
          SetData("current_doc", doc)
        } else {
          doc = GetData("current_doc", 'j')
          doc.completed = false
          SetData("current_doc", doc)
        }

        //this.item_from_send=arr_item;
        // заполняем массив для отправки номенкл хар серия
        for (i of scaning) {
          i.ТекущееКоличество = 0
          i.ТекущееКоличествоВЕдиницахИзмерения = 0
          Грузоместа = 0
          for (y of scaning_response) {
            if ((i.Номенклатура.Наименование === y.Номенклатура.Наименование) &&
              (i.Характеристика.Наименование === y.Характеристика.Наименование) &&
              (i.Серия.Наименование === y.Серия.Наименование)) {
              Грузоместа += y.Грузоместа
              i.ТекущееКоличество += rounded(y.Количество)
              i.ТекущееКоличествоВЕдиницахИзмерения += rounded(y.КоличествоВЕдиницахИзмерения)
              if (i.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {
                i.ТекущееКоличествоВЕдиницахИзмерения = rounded(i.ТекущееКоличествоВЕдиницахИзмерения, 0)
              }
            }
          }
          i.Грузоместа = Грузоместа
        }
        this.item_from_send = scaning

        this.box_count    = GetCount(scaning_response, "Грузоместа")
        this.weight_count = rounded(GetCount(scaning_response, "Количество"))
      },
      SearchPosition(Артикул) {
        SetData("find", ".articul" + Артикул)
        form_doc.show()
      },
      OpenThisArticul(Номенклатура) {
        this.articul_list_seen = true
        arr_res = []
        arr = scaning_response
        for (i of arr.filter(item => item.Номенклатура.Наименование === Номенклатура)) {
          arr_res.push(i)
        }
        this.scaning_response = arr_res
        this.CountThisArticul = arr_res.length
        window.scrollTo(0, 0)
      },
      delete_scaning_quest(id) {
        delete_scaning_quest(this.scaning_response, id, this.delete_scaning,
          check_doc.show, id)
        setTimeout( ()=> {
          check_doc.articul_list_seen = true
        }, 100)
      },
      delete_scaning(param) {
        table = scaning_response
        for (i of table) {
          if (i.IDSec === param.id) {
            article = i.Номенклатура.Наименование
            table.splice(table.indexOf(i), 1)
            $('#' + param.id).remove()
            break
          }
        }
        SetData("scaning_response", table)
        check_doc.CountThisArticul = check_doc.scaning_response.length
        check_doc.show()
        check_doc.OpenThisArticul(article)
      },
      AddItemShow(item) {
        itemOrder = GetData('current_doc', 'j').Товары.filter(i =>
          i.Номенклатура.Наименование == item.Номенклатура.Наименование &&
          i.Характеристика.Наименование == item.Характеристика.Наименование)

          this.add_item.Заголовок = `Добавление \n${item.Номенклатура.Наименование} \n${item.Характеристика.Наименование}  ${item.ПЛУ === undefined ? '' : 'ПЛУ:' + item.ПЛУ}`
          this.add_item.Номенклатура = itemOrder[0].Номенклатура
          this.add_item.Характеристика = itemOrder[0].Характеристика
          this.add_item.ЕдиницаИзмерения = this.add_item.Номенклатура.ЕдиницаИзмерения
          this.add_item.Артикул = this.add_item.Номенклатура.Артикул
          this.add_item.Грузоместа = 1
          this.add_item.Палетная = "row alert alert-info"
          this.add_item.bc = ""
          this.add_item.ПЛУ = item.ПЛУ === undefined ? '' : item.ПЛУ
        if (this.add_item.ЕдиницаИзмерения === 'шт') {
          f = scaning_response.filter(i => i.Характеристика.Наименование == item.Характеристика.Наименование && i.Характеристика.Наименование == item.Характеристика.Наименование)
          if (f.length > 0) {
            this.add_item.КоличествоВЕдиницахИзмерения = f[0].КоличествоВЕдиницахИзмерения
          }
        }
        $('#AddItemModal').modal('show')
      },
      AddItemClose() {
        this.add_item = {
          Заголовок: '',
          Номенклатура: {},
          Характеристика: {},
          Серия: {
            ДатаПроизводства: "01010001",
            ГоденДо: "01010001",
            Наименование: "",
            Ссылка: `${this.ДатаПроизводства}${this.ГоденДо}`
          },
          Количество: 0,
          КоличествоВЕдиницахИзмерения: this.Количество,
          ЕдиницаИзмерения: 'кг',
          Артикул: "",
          Грузоместа: 1,
          Палетная: "row alert alert-info",
          bc: ""
        }
        check_doc.show()
      },
      AddItemSave() {
        valid = 'Поля '
        if (this.add_item.Серия.ДатаПроизводства === '01010001') {
          valid += '"Дата производства" '
        }
        if (this.add_item.Серия.ГоденДо === '01010001') {
          valid += '"Годен до" '
        }
        if (this.add_item.Количество === undefined || this.add_item.Количество === 0) {
          valid += '"Вес на коробке" '
        }
        if (this.add_item.КоличествоВЕдиницахИзмерения === undefined || this.add_item.КоличествоВЕдиницахИзмерения === 0) {
          valid += '"Количество в единицах измерения" '
        }
        if (this.add_item.Грузоместа === undefined || this.add_item.Грузоместа === 0) {
          valid += 'Количество коробок '
        }
        if (valid !== 'Поля ') {
          valid += 'не заполнены'
          swal(valid);
          return
        }


        this.add_item.Серия.ДатаПроизводства = this.add_item.Серия.ДатаПроизводства.slice(2).replace(/-/g, '')
        this.add_item.Серия.ГоденДо = this.add_item.Серия.ГоденДо.slice(2).replace(/-/g, '')
        this.add_item.Серия.Ссылка = this.add_item.Серия.ДатаПроизводства + this.add_item.Серия.ГоденДо
        this.add_item.Серия.Наименование = Date1C(this.add_item.Серия.ДатаПроизводства, this.add_item.Серия.ГоденДо)

        this.add_item.КоличествоВЕдиницахИзмерения = rounded(this.add_item.КоличествоВЕдиницахИзмерения)
        this.add_item.Количество = rounded(this.add_item.Количество)

        ДатаПроизводства = this.add_item.Серия.ДатаПроизводства
        Грузоместа = this.add_item.Грузоместа
        Палетная = "row alert alert-info"

        if (Number(this.add_item.Грузоместа) > 1) {
          Грузоместа = this.add_item.Грузоместа
          Палетная = "row alert alert-warning"
        }
        current_doc = GetData('current_doc', 'j')

        in_order = current_doc.Товары.filter(item =>
          this.add_item.Номенклатура.Наименование == item.Номенклатура.Наименование &&
          this.add_item.Характеристика.Наименование == item.Характеристика.Наименование)

        ЧтоЕсть = current_doc.Товары.filter(item =>
          this.add_item.Номенклатура.Наименование == item.Номенклатура.Наименование)

        in_order = in_order.length > 0 ? true : false


        КоличествоВЕдиницахИзмерения = this.add_item.КоличествоВЕдиницахИзмерения
       
        response = {
          ID: '',
          Номенклатура: this.add_item.Номенклатура,
          Характеристика: this.add_item.Характеристика,
          Серия: {
            Наименование: Date1C(this.add_item.Серия.ДатаПроизводства, this.add_item.Серия.ГоденДо),
            Ссылка: `${this.add_item.Серия.ДатаПроизводства}${this.add_item.Серия.ГоденДо}`
          },
          Количество: this.add_item.Количество,
          КоличествоВЕдиницахИзмерения: this.add_item.КоличествоВЕдиницахИзмерения,
          ЕдиницаИзмерения: this.add_item.ЕдиницаИзмерения.Наименование,
          Артикул: this.add_item.Артикул,
          Грузоместа: this.add_item.Грузоместа,
          Палетная: this.add_item.Палетная,
          bc: "",
          ПЛУ: this.add_item.ПЛУ
        }

        form_doc.scaningN += 1
        SetData("scaningN", form_doc.scaningN)

        response.IDSec = response.ID + Date.now()
        response.scaningN = form_doc.scaningN
        scaning_response.unshift(response)

        SetData("scaning_response", scaning_response)

        if (current_doc.Ссылка.Вид === "ЗаказКлиента") {
          ost = GetOstDate(current_doc.Товары, response.Номенклатура, response.Характеристика)
          if (new Date(
            20 + ДатаПроизводства.slice(0, 2),
            ДатаПроизводства.slice(2, 4),
            ДатаПроизводства.slice(4, 6),
            0, 0, 0
          ) < new Date(ost)) {
            qw.show2(`Нарушение остаточного срока годности, отгрузить не позднее ${formatDate(SecInDate(ost))} вы точно хотите отгрузить данную продукцию?`,
              {
                func: form_doc.show
              },
              {
                func: form_doc.delete_scaning,
                params: {
                  id: response.IDSec
                }
              })
          }
        }
        soundClick("resurse/GOOD.mp3")
        СтруктураШК = {}
        Количество = 0
        ДатаПроизводства = '01010001'
        ГоденДо = '01010001'
        $('#AddItemModal').modal('hide')
        this.AddItemClose()
      },
      save() {
        getFile(GetData('current_user', 'j').Ссылка.Ссылка,  (res)=> {
          mach = false
          for (i of res.data.docs) {
            if (i.Ссылка.Ссылка === GetData('current_doc', 'j').Ссылка.Ссылка) {
              i = GetData('current_doc', 'j')
              i.scanings = GetData('scaning_response', 'j')
              setFile(res, 'user_docs', 'user_docs')
              swal('Сохранено')
              mach = true
            }
            continue
          }
          if (!mach) {
            ob = GetData('current_doc', 'j')
            ob.scanings = GetData('scaning_response', 'j')
            res.data.docs.unshift(ob)
            setFile(res, 'user_docs', 'user_docs')
            swal('Сохранено')
          }
        }, 'user_docs', 'user_docs')
      }
    },
    computed: {
      count_items() {
        return this.item_from_send.length + " / " + this.all_item.length
      }
    }
  })

  var form_doc_free = new Vue({
    el: '#form_doc_free',
    data: {
      name: "form_doc_free",
      seen: false,
      main: main,
      it_palet: false,
      barcode: "",
      scaning_response_free: [],
      response_free: {},
      input_free: form_doc_bc_free,
      scaning_response_set_free: new Set(),
      scaningN_free: 0,
      bc: '',
      count_scaning: 0,
      mode: 'Остатки',
      add_item: {
        Заголовок: '',
        Номенклатура: {},
        Характеристика: {},
        Серия: {
          ДатаПроизводства: "01010001",
          ГоденДо: "01010001",
          Наименование: "",
          Ссылка: `${this.ДатаПроизводства}${this.ГоденДо}`
        },
        Количество: undefined,
        КоличествоВЕдиницахИзмерения: undefined,
        ЕдиницаИзмерения: 'кг',
        Артикул: "",
        Грузоместа: 1,
        Палетная: "row alert alert-info",
        bc: "",
        ПЛУ: ""
      }
    },
    methods: {
      closeq() {
        qw.show("Вы уверенны что хотите перейти обратно?", load_doc.show, form_doc_free.show, {})
      },
      close() {
        this.seen = false
        load_doc.show()
        RemoveData("scaning_response_free")
        this.barcode = ""
        scaning_response_free = []
        this.response_free = {}
      },
      check() {
        check_doc_free.show()
      },
      ClearScaning(){
        scaning_response_free.length=0
        $("#scaning_response_list_free").html('')
      },
      show(mode) {
		if (mode === undefined){
			mode = this.mode
		}
        this.mode = mode
        
        SetData('no_order_mode', mode)
        setTimeout( ()=> {
          if (!admin.use_clip_board) {
            form_doc_bc_free.focus()
          }
        }, 100)
        SetData('current_option', this.name)
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
        $("#scaning_response_list_free").html('')
        scaning_response_free.map(i => {
          i.free = true
          $("#scaning_response_list_free").prepend(FillTemplate(i))
        })
        form_doc_free.count_scaning = scaning_response_free.length
      },
      Scan() {
        cordova.plugins.barcodeScanner.scan(
          (result) => {
            this.barcode = result.text
            this.scaning()
          },
          (error) => {
            swal("Scanning failed: " + error)
          }
        )
      },
      scaning(sleep) {
        this.barcode = PodgotovitBarcode(this,this.barcode)
        if (this.barcode === "") {
          return
        }
        this.bc = PodgotovitBarcode(this,this.barcode)
        
        let Штрихкод = this.bc.slice(2, 16)
        let Количество = Number(this.bc.slice(20, 26)) / 1000
        let ДатаПроизводства = this.bc.slice(28, 34)
        let ГоденДо = this.bc.slice(36, 42)
        Структура = { Штрихкод: Штрихкод, Количество: Количество, ДатаПроизводства: ДатаПроизводства, ГоденДо: ГоденДо }
        if (admin.use_local_db) {
          getFile(Структура.Штрихкод,  (res) =>{
            if (res === -1) {
              swal('Продукция с таким штрих кодом не найдена')
              this.barcode === ""
              return
            }
            res.Штрихкод = Структура.Штрихкод
            CheckScaningFREE(this, res.data, Структура.Количество, Структура.ДатаПроизводства, Структура.ГоденДо)
          }, '1c', 'barcodes')
        } else {
          params = {
            "barcode": this.bc,
            'free': true
          }
          axios.get(url_to_base + '/barcode2020/hs/barcode/scaning_barcode', { params: params })
            .then((response) => {
              if (response.data.РезультатПроверки) {
                let СтруктураШК = { Ссылка: response.data }
                CheckScaningFREE(this, СтруктураШК, Количество, ДатаПроизводства, ГоденДо)
              } else {
                swal(response.data.Текст)
                this.show()
                soundClick("resurse/ERROR.mp3")
              }
            }).catch((error) => {
              swal(String(error))
              this.show()
            })
        }
        if (!admin.use_clip_board) {
          form_doc_bc_free.focus()
        }
      },
      delete_scaning_quest(id) {
        delete_scaning_quest(scaning_response_free, id, this.delete_scaning, form_doc_free.show, id)
        form_doc_free.count_scaning = scaning_response_free.length
        form_doc.count_scaning = scaning_response.length

      },
      delete_scaning(param) {
        for (i of scaning_response_free) {
          if (i.IDSec === param.id) {
            scaning_response_free.splice(scaning_response_free.indexOf(i), 1)
            $('#' + param.id).remove()
            break
          }
        }
        SetData("scaning_response_free", scaning_response_free)
        this.show()
      },
      clear_quest() {
        qw.show("Вы уверенны что хотите УДАЛИТЬ все ОТСКАНИРОВАННОЕ", form_doc_free.clear, form_doc_free.show, {})
      },
      clear() {
        scaning_response_free = []
        RemoveData("scaning_response_free")
        $('#scaning_response_list_free').html('')
        $('#scaning_response_list').html('')
        this.show()
      },
      OrderBy(param) {
        if (param === 'Артикул') {
          scaning_response_free = GetListSortBy(scaning_response_free, 'Articul')
        }
        if (param === 'История') {
          scaning_response_free = GetListSortBy(scaning_response_free, 'History')
        }
        SetData("scaning_response_free", scaning_response_free)
        form_doc_free.show()
      },
      AddItemShow(item) {
        itemOrder = GetData('current_doc', 'j').Товары.filter(i =>
          i.Номенклатура.Наименование === item.Номенклатура.Наименование &&
          i.Характеристика.Наименование === item.Характеристика.Наименование)

          this.add_item.Заголовок = `Добавление в ручную`
          this.add_item.Номенклатура = itemOrder[0].Номенклатура
          this.add_item.Характеристика = itemOrder[0].Характеристика
          this.add_item.ЕдиницаИзмерения = this.add_item.Номенклатура.ЕдиницаИзмерения
          this.add_item.Артикул = this.add_item.Номенклатура.Артикул
          this.add_item.Грузоместа = 1
          this.add_item.Палетная = "row alert alert-info"
          this.add_item.bc = ""
          this.add_item.ПЛУ = item.ПЛУ === undefined ? '' : item.ПЛУ
        if (this.add_item.ЕдиницаИзмерения === 'шт') {
          f = scaning_response_free.filter(i => i.Характеристика.Наименование === item.Характеристика.Наименование && i.Характеристика.Наименование === item.Характеристика.Наименование)
          if (f.length > 0) {
            this.add_item.КоличествоВЕдиницахИзмерения = f[0].КоличествоВЕдиницахИзмерения
          }
        }
        $('#AddItemModal').modal('show')

      },
      AddItemClose() {
        this.add_item = {
          Заголовок: '',
          Номенклатура: {},
          Характеристика: {},

          Серия: {
            ДатаПроизводства: "01010001",
            ГоденДо: "01010001",
            Наименование: "",
            Ссылка: `${this.ДатаПроизводства}${this.ГоденДо}`
          },
          Количество: 0,
          КоличествоВЕдиницахИзмерения: this.Количество,
          ЕдиницаИзмерения: 'кг',
          Артикул: "",
          Грузоместа: 1,
          Палетная: "row alert alert-info",
          bc: ""
        }
        form_doc_free.show()
      },
      AddItemSave() {
        valid = 'Поля '
        if (this.add_item.Серия.ДатаПроизводства === '01010001') {
          valid += '"Дата производства" '
        }
        if (this.add_item.Серия.ГоденДо === '01010001') {
          valid += '"Годен до" '
        }
        if (this.add_item.Количество === undefined || this.add_item.Количество === 0) {
          valid += '"Вес на коробке" '
        }
        if (this.add_item.КоличествоВЕдиницахИзмерения === undefined || this.add_item.КоличествоВЕдиницахИзмерения === 0) {
          valid += '"Количество в единицах измерения" '
        }
        if (this.add_item.Грузоместа === undefined || this.add_item.Грузоместа === 0) {
          valid += 'Количество коробок '
        }
        if (valid !== 'Поля ') {
          valid += 'не заполнены'
          swal(valid)
          return
        }
        this.add_item.Серия.ДатаПроизводства = this.add_item.Серия.ДатаПроизводства.slice(2).replace(/-/g, '')
        this.add_item.Серия.ГоденДо = this.add_item.Серия.ГоденДо.slice(2).replace(/-/g, '')
        this.add_item.Серия.Ссылка = this.add_item.Серия.ДатаПроизводства + this.add_item.Серия.ГоденДо
        this.add_item.Серия.Наименование = Date1C(this.add_item.Серия.ДатаПроизводства, this.add_item.Серия.ГоденДо)
        this.add_item.КоличествоВЕдиницахИзмерения = rounded(this.add_item.КоличествоВЕдиницахИзмерения)
        this.add_item.Количество = rounded(this.add_item.Количество)
        ДатаПроизводства = this.add_item.Серия.ДатаПроизводства
        Грузоместа = this.add_item.Грузоместа
        Палетная = "row alert alert-info"
        if (Number(this.add_item.Грузоместа) > 1) {
          Грузоместа = this.add_item.Грузоместа
          Палетная = "row alert alert-warning"
        }
        КоличествоВЕдиницахИзмерения = this.add_item.КоличествоВЕдиницахИзмерения
        response = {
          ID: '',
          Номенклатура: this.add_item.Номенклатура,
          Характеристика: this.add_item.Характеристика,
          Серия: {
            Наименование: Date1C(this.add_item.Серия.ДатаПроизводства, this.add_item.Серия.ГоденДо),
            Ссылка: `${this.add_item.Серия.ДатаПроизводства}${this.add_item.Серия.ГоденДо}`
          },
          Количество: this.add_item.Количество,
          КоличествоВЕдиницахИзмерения: this.add_item.КоличествоВЕдиницахИзмерения,
          ЕдиницаИзмерения: this.add_item.ЕдиницаИзмерения.Наименование,
          Артикул: this.add_item.Артикул,
          Грузоместа: this.add_item.Грузоместа,
          Палетная: this.add_item.Палетная,
          bc: "",
          ПЛУ: this.add_item.ПЛУ
        }

        form_doc_free.scaningN += 1
        response.IDSec = response.ID + Date.now()
        response.scaningN = form_doc_free.scaningN
        scaning_response.unshift(response)
        SetData("scaning_response_free", scaning_response_free)
        soundClick("resurse/GOOD.mp3")
        $('#AddItemModal').modal('hide')
        this.AddItemClose()
      },
    },
  })
  //swal('form_doc_free loaded');
  var check_doc_free = new Vue({
    el: '#check_doc_free',
    data: {
      name: "check_doc_free",
      seen: false,
      barcode: "",
      all_item_free: [],
      scaning_free: [],
      box_count_free: 0,
      weight_count_free: 0,
      articul_list_seen_free: false,
      scaning_response_free: scaning_response_free,
      CountThisArticul_free: 0,
      nxc_status: '',
      nx_status: '',
      n_status: '',
      sklad: [main_order, "Склад готовой продукции Птицефабрики "],
      selected_sklad: main_order,
      torgovie_seti: torgovie_seti,
      selected_torgovaya_set: '',
      НомерПоддона: "",
      ВесПоддона: 0,
    },
    methods: {
      closeq() {
        qw.show("Вы уверенны что хотите перейти обратно?", form_doc_free.show, check_doc_free.show, {})
      },
      close() {
        form_doc_free.show()
        this.barcode = ""
        this.all_item_free = []
      },
      show_with_mode(mode) {
        this.box_count_free = 0
        this.weight_count_free = 0
        SetData('current_option', this.name)

        this.articul_list_seen_free = false
        arr_item = []
        all_vue_obj.map(i => i.seen = false)
        this.seen = true

        if (mode === 'nxc') {
          this.nxc_status = 'disabled'
          this.nx_status = ''
          this.n_status = ''

          for (i of scaning_response_free) {
            form_doc_free.scaning_response_set_free.add(i.Номенклатура.Ссылка.Ссылка + i.Характеристика.Ссылка.Ссылка + i.Серия.Ссылка)
          }

          if (form_doc_free.scaning_response_set_free === null) {
            swal("Ненайдено ни одного сканирования")
            form_doc_free.show()
          }
          scaning_response_set_free = Array.from(form_doc_free.scaning_response_set_free)
          scaning_response_free = Array.from(scaning_response_free)
          scaning = [] // Все сканирования
          err = []

          // init array scaning_response_set
          for (i of scaning_response_set_free) {
            for (y of scaning_response_free) {
              if (i === y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Ссылка) {
                if (err.indexOf(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Ссылка) === -1) {
                  scaning.push(Object.assign({}, y))
                  err.push(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка + y.Серия.Ссылка)
                }
              }
            }
          }
          // собираем массив для отображения сборки массива номенкл хар-ка
          for (i of scaning) {
            i.КоличествоКоробок = 0
            i.ТекущееКоличество = 0
            i.ТекущееКоличествоВЕдиницахИзмерения = 0
            i.Артикул = ""
            for (y of scaning_response_free) {
              if ((i.Номенклатура.Наименование === y.Номенклатура.Наименование) &&
                (i.Характеристика.Наименование === y.Характеристика.Наименование) &&
                (i.Серия.Наименование === y.Серия.Наименование)
              ) {
                i.ТекущееКоличество += y.Количество
                i.ТекущееКоличество = rounded(i.ТекущееКоличество)
                i.Артикул = y.Номенклатура.Артикул
                i.ТекущееКоличествоВЕдиницахИзмерения += rounded(y.КоличествоВЕдиницахИзмерения)
                i.КоличествоВЕдиницахИзмерения = i.Количество / rounded(y.Номенклатура.ВесЧислитель)
                i.КоличествоВЕдиницахИзмерения = rounded(i.КоличествоВЕдиницахИзмерения)
                i.КоличествоКоробок += y.Грузоместа
                //this.box_count_free += y.Грузоместа
              }
            }
            this.cls = 'violet'
            //this.weight_count_free += i.ТекущееКоличество
            //this.weight_count_free = rounded(this.weight_count_free)
          }
        }
        if (mode === 'nx') {
          this.nxc_status = ''
          this.nx_status = 'disabled'
          this.n_status = ''
          for (i of scaning_response_free) {
            form_doc_free.scaning_response_set_free.add(i.Номенклатура.Ссылка.Ссылка + i.Характеристика.Ссылка.Ссылка)
          }
          if (form_doc_free.scaning_response_set_free === null) {
            swal("Ненайдено ни одного сканирования")
            form_doc_free.show()
          }
          scaning_response_set_free = Array.from(form_doc_free.scaning_response_set_free)
          scaning_response_free = Array.from(scaning_response_free)
          scaning = [] // Все сканирования
          err = []

          // init array scaning_response_set
          for (i of scaning_response_set_free) {
            for (y of scaning_response_free) {
              if (i === y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка) {
                if (err.indexOf(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка) == -1) {
                  scaning.push(Object.assign({}, y))
                  err.push(y.Номенклатура.Ссылка.Ссылка + y.Характеристика.Ссылка.Ссылка)
                }
              }
            }
          }
          // собираем массив для отображения сборки массива номенкл хар-ка
          for (i of scaning) {
            i.КоличествоКоробок = 0
            i.ТекущееКоличество = 0
            i.ТекущееКоличествоВЕдиницахИзмерения = 0
            i.Артикул = ""
            for (y of scaning_response_free) {
              if ((i.Номенклатура.Наименование === y.Номенклатура.Наименование) &&
                (i.Характеристика.Наименование === y.Характеристика.Наименование)
              ) {
                i.ТекущееКоличество += y.Количество
                i.ТекущееКоличество = rounded(i.ТекущееКоличество)
                i.Артикул = y.Номенклатура.Артикул
                i.ТекущееКоличествоВЕдиницахИзмерения += rounded(y.КоличествоВЕдиницахИзмерения)
                i.КоличествоВЕдиницахИзмерения = i.Количество / rounded(y.Номенклатура.ВесЧислитель)
                i.КоличествоВЕдиницахИзмерения = rounded(i.КоличествоВЕдиницахИзмерения)
                i.КоличествоКоробок += y.Грузоместа
                //this.box_count_free += y.Грузоместа
              }
            }
            this.cls = 'violet'
            //this.weight_count_free += i.ТекущееКоличество
            //this.weight_count_free = rounded(this.weight_count_free)
          }
        }
        this.scaning_free = scaning
        this.box_count_free    = GetCount(scaning_response_free, "Грузоместа")
        this.weight_count_free = rounded(GetCount(scaning_response_free, "Количество"))
      },
      show(mode = 'Остатки') {
        if (mode === 'Остатки' || mode == null) {
          form_doc_free.mode = 'Остатки'
        } else {
          form_doc_free.mode = 'ИнфоЛист'
        }
        this.show_with_mode('nx')
        $('#button_save_in_1c').show()
      },
      SearchPosition(Артикул) {
        SetData("find", ".articul" + Артикул);
        form_doc_free.show();
      },
      OpenThisArticul(Номенклатура) {
        this.articul_list_seen_free = true
        arr_res = []
        arr = scaning_response_free
        for (i of arr.filter(item => item.Номенклатура.Наименование === Номенклатура)) {
          arr_res.push(i)
        }
        this.scaning_response_free = arr_res
        this.CountThisArticul_free = arr_res.length
        window.scrollTo(0, 0)
      },
      delete_scaning_quest(id) {
        delete_scaning_quest(scaning_response_free, id, this.delete_scaning,
          () => { check_doc_free.articul_list_seen_free = true }, id)
      },
      delete_scaning(param) {
        table = scaning_response_free
        for (i of table) {
          if (i.IDSec === param.id) {
            article = i.Номенклатура.Наименование
            table.splice(table.indexOf(i), 1)
            break
          }
        }
        SetData("scaning_response_free", scaning_response_free)
        check_doc_free.CountThisArticul_free = check_doc_free.scaning_response_free.length
        check_doc_free.show()
        check_doc_free.OpenThisArticul(article)
      },
      SaveIn1C(mode) {
        params = {
          "Склад": this.selected_sklad,
          "scaning": scaning_response_free,
          "Пользователь": GetData('current_user', 'j'),
          "ID": "" + Date.now()
        }
        if (mode === 'ИнфоЛист') {
          if (this.НомерПоддона === ""
            || this.ВесПоддона == 0
            || this.selected_sklad === ""
            || this.selected_torgovaya_set === "") {
            swal('Не все параметры заполнены')
            return
          }
          params.save_in_1c_info_sheets = true
          params.Сеть = this.selected_torgovaya_set
          params.НомерПоддона = this.НомерПоддона
          params.ВесПоддона = this.ВесПоддона

        } else if (mode === 'Остатки') {
          params.save_in_1c = true
        }

        $('#button_save_in_1c').hide()
        axios({
          method: "post",
          url: url_to_base + '/barcode2020/hs/barcode/execute',
          data: JSON.parse(JSON.stringify(params)),
        })
          .then(response => {
            swal(response.data.Текст)
            $('#button_save_in_1c').show()

            scaning_response_free = []
            SetData('scaning_response_free', [])
            //this.selected_sklad         = ""
            this.selected_torgovaya_set = ""
            this.НомерПоддона = ""
            this.ВесПоддона = ""
            load_doc.show()
          })
          .catch(error => {
            console.log(error)
            swal(String(error))
            $('#button_save_in_1c').show()
          })
          .catch(error => {
            $('#button_save_in_1c').show()
          })
        $('#button_save_in_1c').show()
      }

    },
    computed: {
      count_items() {
      }
    }
  })

  //Функция вызова диалогового окна
  var admin = new Vue({
    el: '#admin',
    data: {
      name: 'admin',
      seen: false,
      url: url_to_base,
      fio: form_menu.fio,
      use_local_db: true,
      user_param: "",
      use_clip_board: true,
      use_local_orders: true,
      this_android: false,
      use_test_server: false,
      control_future_date: true,
      log: [],

      //use_sounds:use_sounds
    },
    methods: {
      show() {
        this.this_android = this_android
        this.url = GetData('url_to_base')
        admin.seen = true
        user = GetData('current_user', 'j')
        if (user != null) {
          this.fio = user.Наименование
        }
      },
      close() {
        admin.seen = false
      },
      UpdateApp() {
        try {
          UploadApp()
          SetData('date_update', '' + new Date())
        } catch (e) {
          swal(JSON.stringify(e))
        }
      },
      UseServer(serv) {
        if (serv === 'ikar') {
          SetData('url_to_base', 'http://ikar.reftp.ru:7000')
        }
        if (serv === 'lyra') {
          SetData('url_to_base', 'http://lyra.reftp.ru')
        }
        this.url = GetData('url_to_base')
        url_to_base = this.url

      },
      IsAndroid() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent))
      },
      EXECUTE(param) {
        try {
          eval(param)
        } catch (e) {
          alert(e)
        }
      },
      TestDB() {
        setFile({ data: "This test message! test success", id: 99 })
        getFile(99, (r) => { alert(r.data) })

      },
      OpenInWeb() {
        var ref = cordova.InAppBrowser.open(this.url + "/barcode2020/hs/barcode/index.html", '_blank', 'location=yes')
      },
      ClearStorage() {
        localStorage.clear()
        indexedDB.deleteDatabase('1c')
        indexedDB.deleteDatabase('user_docs')
        indexedDB.deleteDatabase('orders')
        indexedDB.deleteDatabase('torgovie_seti')
        indexedDB.deleteDatabase('info_lists')
        indexedDB.deleteDatabase('log')
        RemoveData('containers')
        RemoveData('prod_doc')
        RemoveData('current_doc')
        RemoveData('current_user')
        //indexedDB.deleteDatabase('user_docs');
        $('#scaning_response_list_free').html('')
        $('#scaning_response_list').html('')
        swal('очищено')
        form_select_user.show()
      },
      ShowLog() {
        this.log = custom_log

        /*try {
          getFile("1", (response) => {
            custom_log.length = 0
            if (response !== -1) {
              JSON.parse(response.data).map((i) => { custom_log.unshift(i) })
            }
            this.log = custom_log
          }, "log", "log")
    
        } catch(e){
          console.log(e)
        }*/

      }
    }

  })
  //swal('admin loaded');
  var main = new Vue({
    data: {
      name: 'main',
      form_menu: form_menu,
      form_select_user: form_select_user,
      load_doc: load_doc,
      form_doc: form_doc,
      check_doc: check_doc,
      form_doc_free: form_doc_free,
      check_doc_free: check_doc_free,
      qw: qw,
      msg: msg,
      loading_holder: loading_holder,
      document_container: document_container,
      admin: admin
    },
    methods: {
      show_admin() {
        this.admin.show()
      },
    }
  })

  var qw = new Vue({
    el: '#qw',
    data: {
      name: "qw",
      seen: false,
      question_window_text: "",
      param: {},
      param_ok: {},
      param_cancel: {},
      arr_cancel: [],
      arr_ok: []
    },
    methods: {
      show(text, func_as_yes, func_as_no, param) {
        //процедура открытия модального окна
        this.param = param
        this.question_window_text = text
        this.attr_cancel = func_as_no
        this.attr_ok = func_as_yes
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
      },
      show2(text, as_yes, as_no) {
        this.question_window_text = text
        this.attr_ok = as_yes.func
        this.attr_cancel = as_no.func
        this.param_ok = as_yes.params
        this.param_cancel = as_no.params
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
      },
      cancel() {
        if (Object.keys(this.param_cancel).length != 0) {
          this.attr_cancel(this.param_cancel)
        } else {
          if (Object.keys(this.param).length == 0) {
            this.attr_cancel()
          } else {
            this.attr_cancel(this.param)
          }
        }
        if (Object.keys(this.param).length == 0) {
          this.attr_cancel()
        }
      },
      ok() {
        if (Object.keys(this.param).length == 0) {
          this.attr_ok()
        } else {
          if (this.param_ok === undefined) {
            this.attr_ok(this.param)
          }
          if (Object.keys(this.param_ok).length != 0) {
            this.attr_ok(this.param_ok)
          } else {
            this.attr_ok(this.param)
          }
        }
      },
      attr_ok() { },
      attr_cancel() { },
      close() { this.seen = false },
    }
  })
  var msg = new Vue({
    el: '#msg',
    data: {
      name: "msg",
      seen: false,
      question_window_text: "",
      param: {}

    },
    methods: {
      show(text, func_as_ok, param) {
        //процедура открытия модального окна
        this.param = param
        this.question_window_text = text
        this.attr_ok = func_as_ok
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
      },
      ok() {
        if (Object.keys(this.param).length == 0) {
          this.attr_ok()
        } else {
          this.attr_ok(this.param)
        }
      },
      attr_ok() { },
      close() { this.seen = false },
    }
  })
  //swal('msg loaded');
  var loading_holder = new Vue({
    el: '#loading_holder',
    data: {
      name: "loading_holder",
      seen: false,
    },
    methods: {
      show() {
        all_vue_obj.map(i => i.seen = false)
        this.seen = true
      },
      close() {
        this.seen = false
      }
    }
  })

  var status_bar = new Vue({
    el: '#status_bar_id',
    data: {
      msgs: []
    }
  })

  var HandAddItem = new Vue({
    el: '#AddItemModalWindowVue',
    data: {
      seen:false,
      much:false,
      ДатаПроизводства: "",
      ГоденДо: "",
      Количество: "",
      КоличествоВЕдиницахИзмерения: "",
      Грузоместа: "",
      ШК: "",
      Артикул:"",
      Номенклатура: "",
      Характеристика: "",
      ПЛУ: "",
      ЕдиницаИзмерения:"",
      Объект: {},
      form:"",
      СтруктураШК:"",
      ШтрихкодПродукции:""
    },
    methods: {
      Show(form) {
        this.seen = true
        this.form = form
        $("#AddItemModalWindow").modal()
        ШК.focus()
      },
      Scaning() {
        this.ШтрихкодПродукции = this.ШК.slice(2, 16)
        getFile(this.ШтрихкодПродукции,  (res)=> {
          if (res === -1) {
            swal('Продукция с таким штрих кодом не найдена')
            this.ШК = ""
            return
          }
          this.СтруктураШК      = res.data
          this.much             = true // Если true то скрывает элементы на форме
          this.Номенклатура     = res.data.Ссылка.Номенклатура.Наименование
          this.Характеристика   = res.data.Ссылка.Характеристика.Наименование
          this.Артикул          = res.data.Ссылка.Номенклатура.Артикул
          this.ЕдиницаИзмерения = res.data.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование
          this.ПЛУ              = res.data.Ссылка.ПЛУ
          this.Объект           = res.data.Ссылка
        }, '1c', 'barcodes')

      },
      Add(){
        this.ДатаПроизводства = this.ДатаПроизводства.replace(/-/gi,'').slice(2, 8) // Подгоняем дату под формат ШК
        this.ГоденДо          = this.ГоденДо.replace(/-/gi,'').slice(2, 8)// Подгоняем дату под формат ШК

        if((""+this.КоличествоВЕдиницахИзмерения).length ===1 ){
          this.КоличествоВЕдиницахИзмерения = "00"+this.КоличествоВЕдиницахИзмерения
        }else if((""+this.КоличествоВЕдиницахИзмерения).length ===2 ){
          this.КоличествоВЕдиницахИзмерения = "0"+this.КоличествоВЕдиницахИзмерения
        }

        //if((""+this.Грузоместа).length === 1){
        //  this.Грузоместа = "00"+this.Грузоместа
        //}else if((""+this.Грузоместа).length === 2){
        //  this.Грузоместа = "0"+this.Грузоместа
        //}

        var Кол=(this.Количество/100).toFixed(5).replace('.','').replace(',','')
        
        КастомныйШК = `01${this.ШтрихкодПродукции}3103${Кол}11${this.ДатаПроизводства}17${this.ГоденДо }10${"001"}37${this.КоличествоВЕдиницахИзмерения}91001`
        this.СтруктураШК
        if (this.form === 'form_doc'){
          form_doc.barcode = КастомныйШК
          form_doc.scaning()
        }
        if (this.form === 'form_doc_free'){
          form_doc_free.barcode = КастомныйШК
          form_doc_free.scaning()
        }
        if (this.form === 'prod_list'){
          getting_prod_form.barcode= КастомныйШК
          getting_prod_form.scaning()
        }
        this.Close()
      },
      Close(){
        $("#AddItemModalWindow").modal('hide')
        this.seen             = false 
        this.СтруктураШК      = ""
        this.much             = false // Если true то скрывает элементы на форме
        this.Номенклатура     = ""
        this.Характеристика   = ""
        this.Артикул          = ""
        this.ЕдиницаИзмерения = ""
        this.ПЛУ              = ""
        this.Объект           = ""
        this.ШК = ""
        this.ДатаПроизводства = ""
        this.ГоденДо = ""
        this.Количество = ""
        this.КоличествоВЕдиницахИзмерения = ""
        this.Грузоместа = ""
        this.ЕдиницаИзмерения = ""
        this.Объект = ""
        this.form =""
      }

    }
    
  })

} catch (e) {
  console.log(JSON.stringify(e))
}

$('#AddItemModalWindow').on('hidden.bs.modal', (e) =>{
  HandAddItem.Close()
})