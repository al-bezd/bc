
<template>
    <div class="reft_modal" v-if="seen">
        <h3>Панель администратора</h3>
        <div class="col-md-12 col-sm-12 col-xs-12" >
          <div class="alert alert-info" role="alert">
            HOST:<b>{{host}}</b>
          </div>
        </div>
        <div v-if="UserManager.instance.user.value" class="col-md-12 col-sm-12 col-xs-12" >
          <div class="alert alert-success" role="alert">
            <b>{{UserManager.instance.user.value.ФИО}}</b>
          </div>
        </div>

        <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
                <a :class="getNavClass('nav-barcode')" @click="setTab('nav-barcode')" >ШК</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-app')" @click="setTab('nav-app')">Приложение</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-storage')" @click="setTab('nav-storage')">Хранилище</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-orders')"  @click="setTab('nav-orders')">Заказы</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-scaner')"  @click="setTab('nav-scaner')">Сканер</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-other')"  @click="setTab('nav-other')">Прочее</a>
            </li>
            <li class="nav-item">
                <a :class="getNavClass('nav-log')"  @click="()=>{setTab('nav-log');showLog();}">Логи</a>
            </li>
        </ul>

        <div class="tab-content">
            <div :class="getTabClass('nav-barcode')">
                
                <div class="col-md-12 col-sm-12 col-xs-12" >
                    <div class="alert alert-info" role="alert">
                        <input type="file" id="file"><br>
                        <button class="btn btn-primary text-uppercase w-100 mt-3"
                        onclick="readFile(document.getElementById('file'))">Загрузить ШК из
                        файла</button>
                        <div id="out"></div>
                    </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12"  hidden>
                    <div class="alert alert-info" role="alert">
                        <div class="btn btn-primary text-uppercase w-100" @click="EXECUTE(`DB_GetData(1)`)">Загрузить ШК из базы</div>
                    </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12" >
                    <div class="alert alert-info" role="alert">
                        <button class="btn btn-primary text-uppercase w-100" onclick="SetBarcods()">Загрузить ШК(с сервера)</button>
                    </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12" >
                    <div class="alert alert-info" role="alert">
                        <div class="btn btn-primary text-uppercase w-100"
                        @click="EXECUTE(`getStorage(function(res){alert(res.length)},'1c','barcodes')`)">Количество
                        загруженных
                        ШК</div>
                    </div>
                </div>
            </div>
            <div :class="getTabClass('nav-app')">
                <div class="col-md-12 col-sm-12 col-xs-12" >
                    <div class="alert alert-info text-uppercase" role="alert">
                        <div v-if="thisAndroid">
                            <div class="btn btn-primary" @click="updateApp">Обновить приложение</div><br>
                        </div>

                        <div class="text-uppercase" v-if="!thisAndroid">
                            <a 
                            class="btn btn-primary text-uppercase w-100" 
                            :title="HttpManager.getAppLink()"
                            :href="HttpManager.getAppLink()" 
                            download 
                            style=" margin-top: 15px; ">Обновить приложение (ссылка)</a>
                        </div>

                        <br>
                        <div>
                            <button class="btn btn-primary text-uppercase w-100"
                                onclick="swal(GetData('date_update')==null?'Неизвестно':GetData('date_update'))">Дата
                                обновления</button>
                        </div>
                    </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12"  v-if="!isWindows">
                    <div class="alert alert-info" role="alert">
                        <a class="btn btn-primary text-uppercase w-100" @click="openInWeb">Открыть в браузере</a>
                    </div>
                </div>
            </div>
            <div :class="getTabClass('nav-storage')">
                <div class="col-md-12 col-sm-12 col-xs-12" >
                <div class="alert alert-info" role="alert">
                <BootstrapSwitcher
                label="Использовать локальное хранилище"
                v-model:value="UserManager.instance.useLocalDb.value"
                @update="(x)=>UserManager.instance.setUseLocalDb(x)"
                />
                    


                </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12" >
                <div class="alert alert-info" role="alert">
                    <div class="btn btn-danger text-uppercase w-100" @click="clearStorage">Очистить хранилище</div>
                </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12" >
                <div class="alert alert-info" role="alert">
                    <div class="btn btn-primary text-uppercase w-100" @click="testDB">Проверка функционирования БД</div>
                </div>
                </div>
            </div>
            <div :class="getTabClass('nav-orders')">
                <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
              <BootstrapSwitcher 
              label="Использовать локальное хранилище для поиска заказов" 
              v-model:value="UserManager.instance.useLocalOrders.value"
              @update="(x)=>UserManager.instance.setUseLocalOrders(x)"
               />
                


              </div>
            </div>

            <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <div class="btn btn-primary text-uppercase w-100"
                  @click="EXECUTE(`getStorage(function(res){alert(res.length)},'orders','orders')`)">Количество
                  загруженных
                  заказов</div>
              </div>
            </div>


            <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <div class="btn btn-primary text-uppercase w-100" @click="EXECUTE(`load_doc.ShowLoadOrders()`)">Загрузить
                  Заказы</div>
              </div>
            </div>

            <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <div class="btn btn-primary text-uppercase w-100" onclick="SetTorgovieSeti()">Загрузить Торговые Сети</div>
              </div>
            </div>
            </div>
            <div :class="getTabClass('nav-scaner')">

              <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                  <BootstrapSwitcher 
                  label="Использовать буфер обмена для сканирования" 
                  v-model:value="ScanerManager.instance.useClipBoard.value"
                  @update="(x)=>ScanerManager.instance.setUseClipBoard(x)" />  
                


              </div>
            </div>

                <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <p>Сервисная кнопка после сканирования</p>
                <div class="form-group">
                  <input 
                  v-model="ScanerManager.instance.scanKey.value" 
                  @change="ScanerManager.instance.setScanKey(ScanerManager.instance.scanKey.value)"
                  type="text" 
                  class="form-control" 
                  
                    placeholder="scanKey">
                </div>
                
              </div>
              
            </div>
            </div>
            <div :class="getTabClass('nav-other')">
                <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <BootstrapSwitcher 
                  label="Контроль будущей даты
                    производства" 
                  v-model:value="UserManager.instance.controlFutureDate.value"
                  @update="(x)=>UserManager.instance.setControlFutureDate(x)" /> 
                


              </div>
            </div>

            




            <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">
                <p>Настройки сервера</p>
                <div class="form-floating mb-3">
                  <input
                    class="form-control"
                    id="hostID" 
                    v-model="host" 
                    type="text" 
                    @change="HttpManager.setHost(host)"
                    placeholder="СХЕМА://ХОСТ:ПОРТ">
                  <label for="hostID">Адрес сервера</label>
                </div>
                
                <div class="form-floating mb-3">
                  <input 
                  id="routePathID"
                  v-model="routePath" 
                  type="text" 
                  class="form-control" 
                  @change="HttpManager.setPath(routePath)"
                  placeholder="СХЕМА://ХОСТ:ПОРТ">
                  <label for="routePathID">Путь на сервере</label>
                </div>

                <div class="alert alert-warning alert-dismissible fade show text-start mb-3" role="alert">
                  <strong>Полный путь:</strong> {{host}}{{routePath}}/экшен
                </div>

                <div 
                :class="`alert alert-${connectionStatus=='УСПЕХ'?'success':'danger'} alert-dismissible fade show text-start mb-3`" 
                role="alert"
                @click="testConnectionToServer()"
                >
                  <strong>Статус подключения:</strong> 
                  <br>
                  <span v-if="isStartTest">loading</span>
                  <span v-else>
                    <span v-if="connectionStatus==''">Нажми что бы проверить</span>
                  <span v-else>{{connectionStatus}}</span>
                  </span>
                  
                </div>
                

                
               
                

                

              </div>
            </div>


            <div class="col-md-12 col-sm-12 col-xs-12" >
              <div class="alert alert-info" role="alert">


                <div class="form-group mb-3">

                  <textarea class="form-control" rows="3" v-model="executeCommand"></textarea>
                </div>
                <div class="btn btn-primary text-uppercase w-100 w-100" @click="EXECUTE(executeCommand)">Выполнить код</div>
              </div>
            </div>
            </div>
            <div :class="getTabClass('nav-log')">
                <div id="log-application" style="max-height: 400px;overflow: scroll;">
              <div v-for=" i in log" v-bind:key="i">{{i}}</div>
            </div>
            </div>
        </div>


          <div class="space"></div> 
        
       
        <button class="btn btn-outline-primary close_btn" @click="close">ЗАКРЫТЬ</button>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { UserManager } from '../managers/user/UserManager'
import { HttpManager } from '@/classes/HttpManager';
import { ScanerManager } from '@/classes/ScannerManager';
import BootstrapSwitcher from '@/components/widgets/BootstrapSwitcher.vue'

const seen = ref(false)
const host = HttpManager.host
const routePath = HttpManager.pathToServer


const thisAndroid = ref(false)
const connectionStatus = ref('')


const executeCommand = ref("")
const isWindows = ref(navigator.platform.indexOf('Win') !== -1)

const log = ref([])
const currentTab = ref('nav-barcode')


UserManager.instance.connect('showAdminPage', (data) => { show() })
function show() {
    seen.value = true
}

function close(){
    seen.value = false
}

function showLog(){
    //
}

function EXECUTE(command:string){
    //
}

function updateApp(){
    //
}

function openInWeb(){
    //
}

function clearStorage(){
    //
}

function testDB(){
    //
}

// function setScanKey(){
//     ScanerManager.instance.setScanKey(scanKey.value)
// }

// function setServer(host:string){
//     //
//     HttpManager.setHost(host)
// }

// function setRoutePath(path:string){
//     //
//     HttpManager.setPath(path)
// }
const isStartTest = ref(false)
async function testConnectionToServer(){
  if(isStartTest.value)return
  isStartTest.value = true
  const params={
    test_connection:"HelloWorld"
  }
  const response = await HttpManager.get('/execute', params)
  isStartTest.value = false
  if(response.success){
      connectionStatus.value = response.data
  }else{
      connectionStatus.value = "ОШИБКА"
  }
        
}

function getNavClass(value:string){
  return `nav-link ${currentTab.value === value ? 'active' : ''}`
  //return 'nav-link ' + currentTab === value ? 'active' : '' 
}

function getTabClass(value:string){
  return `tab-pane fade ${currentTab.value === value ? 'show active' : ''}`
  //'tab-pane fade ' + currentTab=='nav-barcode'?'show active':'' 
}

function setTab(value:string){
    currentTab.value = value
}
</script>