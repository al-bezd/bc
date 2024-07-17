//try{
let barcodes = []
let app_status = []
let scaning_response_free = []
let scaning_response = []


SetData('url_to_base', url_to_base)

function SetData(name, value) {
  if (typeof (value) !== typeof ("")) {
    localStorage.setItem(name, JSON.stringify(value));
  } else {
    localStorage.setItem(name, value);
  }
}
// Read (Single)
function GetData(name, j) {
  if (j === "JSON" || j === 'json' || j === 'j') {
    return JSON.parse(localStorage.getItem(name));
  } else {
    return localStorage.getItem(name);
  }
}
// Delete
function RemoveData(name) {
  localStorage.removeItem(name);
}

function DeleteData(name) {
  RemoveData(name);
}

function setCookie(name, value, exdays) {
  if (typeof (value) !== typeof ("")) {
    value = JSON.stringify(value);
  }
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(сname, j) {
  var name = сname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      //return c.substring(name.length, c.length);
      if (j === "JSON" || j === 'json' || j === 'j') {
        return JSON.parse(c.substring(name.length, c.length));
      } else {
        return c.substring(name.length, c.length);
      }
    }
  }
  return "";
}




function GetCount(Таблица, Параметр) {
  Количество = 0
  for (i of Таблица) {
    Количество = Количество + Number(i[Параметр])
  }
  return Количество
}

let audio = new Audio();
audio.autoplay = true;

function soundClick(Path) {
  //var audio = new Audio(); // Создаём новый элемент Audio
  audio.src = Path; // Указываем путь к звуку "клика"
  // Автоматически запускаем
  audio.play();
}

function circumference(r) {
  return parseFloat(r) * 2.0 * Math.PI;
}



$("#current_connect").click(function () {
  if (current_connect.hidden) {
    current_connect.hidden = false;
  } else {
    current_connect.hidden = true;
  }
})

function GetListSortBy(list, param) {
  if (param === 'Articul') {
    list.sort( (a, b)=> {return a.Артикул - b.Артикул}) 
  }else if (param === 'History') {
    list.sort( (a, b)=> {return a.IDSec - b.IDSec})
  }
  return list
}

function UpadateInHistory(list) {
  current_doc = GetData('current_doc', 'j')
  history_obj = GetData('user_documents', 'j')
  for (i of history_obj) {
    if (i.document.Ссылка.Ссылка === current_doc.Ссылка.Ссылка) {
      i.scaning = list
      break
    }
  }
  SetData('user_documents', history_obj)
}

function DeleteHistory(current_doc, history_obj) {
}



/////////////////////////////////////////////////////  INDEX DB
function SetContainers() {
  axios.get(
    url_to_base + '/barcode2020/hs/barcode/execute',
    {
      params: { 'get_containers': true },
    }
  ).then(function (response) {
    SetData('containers', response.data)
    cu = GetData('current_user', 'j')
    cu.containers = response.data
    SetData('current_user', cu)

  }).catch(function (e) {
    swal(String(e));
  })
}
//SetContainers();

function SetBarcods(file) {

  status_bar.msgs.push("ИДЕТ ЗАГРУЗКА ДАННЫХ!");
  t1 = Date.now();

  if (file === undefined) {
    axios.get(
      url_to_base + '/barcode2020/hs/barcode/execute',
      {
        params: { 'get_barcods': true },
      }
    ).then(function (response) {


      t2 = ((Date.now() - t1) / 1000) / 60;
      console.log(`база загружена за ${t2.toFixed(2)} мин.`);
      status_bar.msgs = [];
      swal(`База обновлена за ${t2.toFixed(2)} мин.`);
      WriteDataInDB(response.data);
    })
  }
  else {

    WriteDataInDB(file)
  }

}





//////////////////////////////////////////////////////////////////

function Date1C(date1, date2) {
  d1 = date1.slice(4, 6);
  m1 = date1.slice(2, 4);
  y1 = date1.slice(0, 2);
  d2 = date2.slice(4, 6);
  m2 = date2.slice(2, 4);
  y2 = date2.slice(0, 2);
  return `от ${d1}.${m1}.${y1} до ${d2}.${m2}.${y2}`;
}

function SecInDate(date) {
  return new Date(+date * 1000)
}

function formatDate(date) {

  var dd = date.getDate();
  if (dd < 10) dd = '0' + dd;

  var mm = date.getMonth() + 1;
  if (mm < 10) mm = '0' + mm;

  var yy = date.getFullYear() % 100;
  if (yy < 10) yy = '0' + yy;

  return dd + '.' + mm + '.' + yy;
}

function GetOstDate(table, Номенклатура, Характеристика) {
  return table.filter(item => item.Номенклатура.Ссылка.Ссылка == Номенклатура.Ссылка.Ссылка && item.Характеристика.Ссылка.Ссылка == Характеристика.Ссылка.Ссылка)[0].ОстаточныйСрокГодности
}

function scan() {
  cordova.plugins.barcodeScanner.scan(
    function (result) {
      swal("We got a barcode\n" +
        "Result: " + result.text + "\n" +
        "Format: " + result.format + "\n" +
        "Cancelled: " + result.cancelled);
    },
    function (error) {
      swal("Scanning failed: " + error);
    }
  );
}

function FindGM(barcode) {
  //str.indexOf
  //Первый метод — str.indexOf(substr, pos).
  //Он ищет подстроку substr в строке str, начиная с позиции pos,
  //и возвращает позицию, на которой располагается совпадение, либо -1 при отсутствии совпадений.
  try {
    start = barcode.indexOf('91', barcode.length - 5);
    end = barcode.indexOf('91', barcode.length - 5) + 5;
    if (start == -1 || end == -1) {
      throw "Штрих код не является палетной этикеткой (отсутствует идентификатор 91)";
    }
    return Number(barcode.slice(start + 2, end));
  } catch (e) {
    swal(e);
    return 1;
  }
}

$('.fast_window').css('height', $(document).height());

function CheckScaning(self, СтруктураШК, Количество, ДатаПроизводства, ГоденДо) {
  bc = self.bc
  Грузоместа = 1
  Палетная = "row alert alert-info"
  СтруктураШК.bc = bc
  if (self.it_palet == true) {
    Грузоместа = FindGM(self.bc)
    Палетная = "row alert alert-warning"
  }
  current_doc = GetData('current_doc', 'j')

  in_order = current_doc.Товары.filter(item =>
    СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование &&
    СтруктураШК.Ссылка.Характеристика.Наименование == item.Характеристика.Наименование)

  ЧтоЕсть = current_doc.Товары.filter(item =>
    СтруктураШК.Ссылка.Номенклатура.Наименование == item.Номенклатура.Наименование)

  in_order = in_order.length > 0 ? true : false

  if (!in_order) {
    //
    text = `Продукции \n\n ${СтруктураШК.Ссылка.Номенклатура.Наименование} ${СтруктураШК.Ссылка.Характеристика.Наименование}  ПЛУ: ${СтруктураШК.Ссылка.ПЛУ}  \n\n нет в заказе`
    if (ЧтоЕсть.length > 0) {
      text += `, нужна\n\n`
      for (i of ЧтоЕсть) {
        text = text + `${i.Номенклатура.Наименование} ${i.Характеристика.Наименование}  ПЛУ: ${i.ПЛУ}  \n\nили `
      }
      text = text.substring(0, text.length - 3)
    } else {
      text
    }
    swal(text)
    soundClick('resurse/ERROR.mp3')
    return
  }
  КоличествоВЕдиницахИзмерения = GetCountFromBarcode(СтруктураШК, Грузоместа, Количество)

  response = {
    ID: '',
    Номенклатура: СтруктураШК.Ссылка.Номенклатура,
    Характеристика: СтруктураШК.Ссылка.Характеристика,
    ПЛУ: СтруктураШК.Ссылка.ПЛУ === undefined ? "" : СтруктураШК.Ссылка.ПЛУ,
    Серия: {
      Наименование: Date1C(ДатаПроизводства, ГоденДо),
      Ссылка: `${ДатаПроизводства}${ГоденДо}`
    },
    Количество: Количество,
    КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
    ЕдиницаИзмерения: СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
    Артикул: СтруктураШК.Ссылка.Номенклатура.Артикул,
    Грузоместа: Грузоместа,
    Палетная: Палетная,
    bc: form_doc.barcode_box
  }


  self.scaningN += 1;
  SetData("scaningN", self.scaningN)

  response.IDSec = response.ID + Date.now()
  response.scaningN = self.scaningN
  scaning_response.unshift(response)

  SetData("scaning_response", scaning_response)



  if (current_doc.Ссылка.Вид === "ЗаказКлиента") {
    date = new Date("1970.01.01")
    date.setSeconds(GetOstDate(current_doc.Товары, response.Номенклатура, response.Характеристика))
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)

    if (new Date(`20${ДатаПроизводства.slice(0, 2)}.${ДатаПроизводства.slice(2, 4)}.${ДатаПроизводства.slice(4, 6)}`) <= date) {
      qw.show2(`Нарушение остаточного срока годности, отгрузить не позднее ${formatDate(date)} вы точно хотите отгрузить данную продукцию?`,
        {
          func: form_doc.show
        },
        {
          func: form_doc.delete_scaning,
          params: {
            id: response.IDSec
          }
        });
      //qw.show(text,self.delete_scaning,form_doc.show,{"id":id});
    }
  }
  if (scaning_response.length > 1) {
    if (scaning_response[1].bc === bc) {
      soundClick("resurse/REPEAT_ARIAL.mp3")
    } else {
      soundClick("resurse/GOOD.mp3")
    }
  } else {
    soundClick("resurse/GOOD.mp3")
  }
  response.free = false
  $("#scaning_response_list").prepend(FillTemplate(response))

  form_doc.count_scaning = scaning_response.length
  if (scaning_response != null) {
    form_doc.box_in_order = GetCount(scaning_response, "Грузоместа")
  } else {
    form_doc.box_in_order = 0
  }
}

function CheckScaningFREE(self, СтруктураШК, Количество, ДатаПроизводства, ГоденДо) {
  bc = self.bc
  Грузоместа = 1
  Палетная = "row alert alert-info"
  СтруктураШК.bc = bc

  if (self.it_palet == true) {
    Грузоместа = FindGM(self.bc)
    Палетная = "row alert alert-warning"
  }
  КоличествоВЕдиницахИзмерения = GetCountFromBarcode(СтруктураШК, Грузоместа, Количество)

  response = {
    ID: '',
    Номенклатура: СтруктураШК.Ссылка.Номенклатура,
    Характеристика: СтруктураШК.Ссылка.Характеристика,
    ПЛУ: СтруктураШК.Ссылка.ПЛУ === undefined ? "" : СтруктураШК.Ссылка.ПЛУ,
    Серия: {
      Наименование: Date1C(ДатаПроизводства, ГоденДо),
      Ссылка: `${ДатаПроизводства}${ГоденДо}`
    },
    Количество: Количество,
    КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
    ЕдиницаИзмерения: СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование,
    Артикул: СтруктураШК.Ссылка.Номенклатура.Артикул,
    Грузоместа: Грузоместа,
    Палетная: Палетная,
    bc: bc
  }


  self.scaningN += 1


  response.IDSec = response.ID + Date.now()
  response.scaningN = self.scaningN_free
  scaning_response_free.unshift(response)

  SetData("scaningN_free", self.scaningN)
  SetData("scaning_response_free", scaning_response_free)


  if (scaning_response_free.length > 1) {
    if (scaning_response_free[1].bc === bc) {
      soundClick("resurse/REPEAT_ARIAL.mp3")
    } else {
      soundClick("resurse/GOOD.mp3")
    }
  } else {
    soundClick("resurse/GOOD.mp3")
  }
  response.free = true
  $("#scaning_response_list_free").prepend(FillTemplate(response))
  form_doc_free.count_scaning = scaning_response_free.length

}

function GetCountFromBarcode(СтруктураШК, Грузоместа, Количество) {
  var barcode = СтруктураШК.bc
  var count = barcode.slice(barcode.length - 5)
  var КоличествоВЕдиницахИзмерения = Количество

  var mutch = false

  if (СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование === "шт") {

    if (count.slice(0, 2) === '37') {
      КоличествоВЕдиницахИзмерения = count.slice(count.length - 3)
      mutch = true
    }

    if (count.slice(0, 2) === '91') {
      count = barcode.slice(barcode.length - 10)
      if (count.slice(0, 2) === '37') {
        КоличествоВЕдиницахИзмерения = count.slice(2, 5)
        mutch = true
      }
    }


  }
  //return (1 * КоличествоВЕдиницахИзмерения)

  if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1] !== undefined && СтруктураШК.Ссылка.Номенклатура.ЕдиницаИзмерения.Наименование==="шт") {
    if (СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Свойство.Наименование==="Количество(хар)" && !mutch) {
      КоличествоВЕдиницахИзмерения = СтруктураШК.Ссылка.Характеристика.ДополнительныеРеквизиты[1].Значение * Грузоместа
    }
  }

  return (1 * КоличествоВЕдиницахИзмерения)
}


function delete_scaning_quest(scanings, id, delete_scaning_func, yes_func, param) {
  for (obj of scanings.filter(item => item.IDSec == id.id)) {
    text = `Вы уверены что хотите удалить  ${obj.Номенклатура.Наименование}
    ${obj.Характеристика.Наименование} ${obj.Серия.Наименование} ${obj.Количество}?`
    qw.show(text, delete_scaning_func, yes_func, param)
    break
  }


}

function delete_scaning_quest_jquery(param) {
  scaning_response.filter(i => form_doc.delete_scaning_quest(param))
  scaning_response_free.filter(i => form_doc_free.delete_scaning_quest(param))
  prod_list.filter(i => delete_scaning_quest(prod_list, param, getting_prod_form.delete_scaning,
    getting_prod_form.show, param))

}

/////////////////////////////////////////////////////  INDEX DB

function readFile(object) {
  var file = object.files[0]
  var reader = new FileReader()
  reader.onload = function () {
    SetBarcods(JSON.parse(reader.result))
  }
  reader.readAsText(file)
}

function CreateCollection(db, name, primarykey) {
  db.createObjectStore(name, { keyPath: primarykey })
}

function WriteDataInDB(data) {
  try {
    data.map(i => setFile({ data: i, id: i.Наименование }, '1c', 'barcodes'))
  } catch (e) {
    swal(String(e))
  }
}



function FillTemplate(response) {
  return `<div class="${response.Палетная}" role="alert" name="${response.ID}" id="${response.IDSec}">
        <div class="col-md-10 col-sm-10 col-xs-10">
            <div class="row">
                <div :class="'col-md-12 col-sm-12 col-xs-12 articul'+item.Артикул"><b>${response.Номенклатура.Артикул}</b> ${response.Номенклатура.Наименование}
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 col-sm-12 col-xs-12">
                    ${response.Характеристика.Наименование}
                </div>
            </div>
            <div class="row">
                <div class="col-md-12 col-sm-12 col-xs-12">${response.Серия.Наименование}</div>
            </div>
            <div class="row">
                <div class="col-md-12 col-sm-12 col-xs-12"><b>ПЛУ : ${response.ПЛУ}</b></div>
            </div>
            <div class="row">
                <div class="col-md-12 col-sm-12 col-xs-12"><b>${response.Количество}</b> <b>кг.</b></div>
                <div class="col-md-12 col-sm-12 col-xs-12"><b>${response.КоличествоВЕдиницахИзмерения}</b> <b>${response.ЕдиницаИзмерения}.</b></div>
                <div class="col-md-12 col-sm-12 col-xs-12"><b>${response.Грузоместа}</b> <b>кор.</b></div>
            </div>
        </div>
        <div class="col-md-2 col-sm-2 col-xs-2">
            <button type="button" class="btn btn-danger" onclick='delete_scaning_quest_jquery({"id":String(${response.IDSec}),"free":${response.free}})'>Х</button>
        </div>
    </div>`

}



//////////////////////////////////////////////////////////////////

var rounded = (number, param)=> {
  if (typeof (number) !== "number") {
    if (number === undefined) {
      number = 0
    } else {
      number = Number(number)
    }
  }

  if (param !== undefined) {
    return +number.toFixed(param)
  }
  return +number.toFixed(3)
}

//let clip_text;

function GetOrders(ДатаНачала, ДатаОкончания, Склад) {
  indexedDB.deleteDatabase('orders')
  SetContainers()
  params = {
    get_orders: true,
    ДатаНачала: ДатаНачала,
    ДатаОкончания: ДатаОкончания,
    Склад: Склад
  }
  axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
    .then(function (response) {
      response.data.map(i => setFile({ data: i, id: i.ШК }, 'orders', 'orders'))
      swal(`В систему загруженно ${response.data.length} заказа(ов)`)
      status_bar.msgs = status_bar.msgs.filter(i => i !== 'ИДЕТ ЗАГРУЗКА ЗАКАЗОВ!')
    })
}

function GetInfoList(ДатаНачала, ДатаОкончания, Склад) {

  indexedDB.deleteDatabase('info_lists')
  params = {
    get_info_list: true,
    ДатаНачала: ДатаНачала,
    ДатаОкончания: ДатаОкончания,
    Склад: Склад
  }
  axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
    .then(function (response) {
      response.data.map(i => setFile({ data: i.list, id: i.ID.replace(/ /g, '') }, 'info_lists', 'info_lists'))
      swal(`В систему загруженно ${response.data.length} информационных листа`)
      status_bar.msgs = status_bar.msgs.filter(i => i !== 'ИДЕТ ЗАГРУЗКА ИНФ. ЛИСТОВ!')
    })
}

function SetTorgovieSeti() {

  const params = {
    get_torgovie_seti: true
  }
  axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
    .then((response) => {
      //indexedDB.deleteDatabase('torgovie_seti')
      indexedDB.deleteDatabase('torgovie_seti')
      check_doc_free.torgovie_seti = response.data
      setFile({ id: Date.now(), data: response.data }, 'torgovie_seti', 'torgovie_seti')
      swal(`Информация по торговым сетям загружена`)
      torgovie_seti = response.data
      check_doc_free.torgovie_seti = torgovie_seti

    })
    .catch(error => {
      console.log('SetTorgovieSeti ', error)
      swal('Ошибка при загрузке торговых сетей')
    })
}

function AddItemInList(param){// функция открытия модального окна для 
  HandAddItem.Show(param)
}

function SetMainOrder(){
  params={
    execute_text:"ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());"
  }
  // В строке выше мы передаем закодированный метод на языке 1С который возвращает нам основной склад птицефабрики
  //ТекстРезультат=РФИТ_Функции.рсСериализацияСсылкиВСтруктуруПростойОбъект(РФИТ_Функции.ПолучитьСсылкуОсновногоСкладаНаСервере());
  axios.get(url_to_base + '/barcode2020/hs/barcode/execute', { params: params })
  .then((response) =>{
    SetData("main_order",response.data) 
    ОсновнойСклад = response.data.Наименование
    check_doc_free.selected_sklad = ОсновнойСклад
    check_doc_free.sklad[0]       = ОсновнойСклад
    load_doc.add_orders.Склад     = ОсновнойСклад

  })
  .catch(error=>{
    console.log(error)
    swal("Произошла ошибка в методе SetMainOrder")
  })
}

function PodgotovitBarcode(self,bc){
  bc = bc.replace(/ /gi,'')
  self.barcode=""
  if (bc.indexOf('-')>=0){
    var text_error = `В штрихкоде "${bc}" присутствует недопустимый символ "-" `
    swal(text_error)
    console.log(text_error)
    throw text_error
  }
  return bc.replace(/-/gi,'0')
}

