<template>
  <div class="reft_modal p-1" v-if="seen">
    <h6>Панель администратора</h6>
    <div class="">
      <div class="alert alert-info p-1 mb-1" role="alert">
        <span
          >HOST:<b>{{ host }}</b></span
        ><br />
        <span v-if="UserManager.instance.user.value"
          >USER:<b>{{ UserManager.instance.user.value.ФИО }}</b>
        </span>
        <br />
        <span>VERSION: 3</span>
      </div>
    </div>

    <ul class="nav nav-tabs mb-1" style="min-height: 8rem">
      <li class="nav-item">
        <a :class="getNavClass('nav-barcode')" @click="setTab('nav-barcode')">ШК</a>
      </li>
      <li class="nav-item">
        <a :class="getNavClass('nav-app')" @click="setTab('nav-app')">Приложение</a>
      </li>
      <li class="nav-item">
        <a :class="getNavClass('nav-storage')" @click="setTab('nav-storage')"
          >Хранилище</a
        >
      </li>
      <li class="nav-item">
        <a :class="getNavClass('nav-orders')" @click="setTab('nav-orders')">Заказы</a>
      </li>
      <li class="nav-item">
        <a :class="getNavClass('nav-scaner')" @click="setTab('nav-scaner')">Сканер</a>
      </li>
      <li class="nav-item">
        <a :class="getNavClass('nav-other')" @click="setTab('nav-other')">Прочее</a>
      </li>
      <li class="nav-item">
        <a
          :class="getNavClass('nav-log')"
          @click="
            () => {
              setTab('nav-log');
              //showLog();
            }
          "
          >Логи</a
        >
      </li>
    </ul>

    <div class="tab-content">
      <div :class="getTabClass('nav-barcode')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <input type="file" id="file" /><br />
            <button
              class="btn btn-primary text-uppercase w-100 mt-3"
              @click="loadBarcodesFromFile()"
            >
              Загрузить ШК из файла
            </button>
            <div id="out"></div>
          </div>
        </div>

        <!--<div class="" hidden>
          <div class="alert alert-info" role="alert">
            <div
              class="btn btn-primary text-uppercase w-100"
              @click="loadBarcodesFromDB()"
            >
              Загрузить ШК из базы
            </div>
          </div>
        </div>-->

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <button
              class="btn btn-primary text-uppercase w-100"
              @click="loadBarcodesFromServer"
            >
              Загрузить ШК(с сервера)
            </button>
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <button
              role="button"
              class="btn btn-primary text-uppercase w-100"
              @click="showCountLoadedBarcodes()"
            >
              Количество загруженных ШК
            </button>
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-app')">
        <div class="">
          <div class="alert alert-info p-1 mb-1 text-uppercase" role="alert">
            <div v-if="thisAndroid">
              <div class="btn btn-primary" @click="updateApp">Обновить приложение</div>
            </div>

            <div class="text-uppercase mb-1" v-if="!thisAndroid">
              <a
                class="btn btn-primary text-uppercase w-100"
                :title="HttpManager.getAppLink()"
                :href="HttpManager.getAppLink()"
                download
                >Обновить приложение (ссылка)</a
              >
            </div>

            <div>
              <button
                class="btn btn-primary text-uppercase w-100"
                @click="showDataUpdateApp"
              >
                Дата обновления
              </button>
            </div>
          </div>
        </div>

        <div class="" v-if="!isWindows">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <a class="btn btn-primary text-uppercase w-100" @click="openInWeb"
              >Открыть в браузере</a
            >
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-storage')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <BootstrapSwitcher
              label="Использовать локальное хранилище"
              v-model:value="UserManager.instance.useLocalDb.value"
              @tap="(x) => UserManager.instance.setUseLocalDb(x)"
            />
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div class="btn btn-danger text-uppercase w-100" @click="clearStorage">
              Очистить хранилище
            </div>
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div class="btn btn-primary text-uppercase w-100" @click="testDB">
              Проверка функционирования БД
            </div>
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-orders')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <BootstrapSwitcher
              label="Использовать локальное хранилище для поиска заказов"
              v-model:value="UserManager.instance.useLocalOrders.value"
              @tap="(x) => UserManager.instance.setUseLocalOrders(x)"
            />
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div
              class="btn btn-primary text-uppercase w-100"
              @click="showCountLoadedShipmentOrders()"
            >
              Количество загруженных заказов
            </div>
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div
              class="btn btn-primary text-uppercase w-100"
              @click="MainManager.instance.uploadTorgovieSeti()"
            >
              Загрузить Торговые Сети
            </div>
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-scaner')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <BootstrapSwitcher
              label="Использовать буфер обмена для сканирования"
              v-model:value="ScanerManager.instance.useClipBoard.value"
              @tap="(x) => ScanerManager.instance.setUseClipBoard(x)"
            />
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <p>Сервисная кнопка после сканирования</p>
            <div class="form-group">
              <input
                v-model="ScanerManager.instance.scanKey.value"
                @change="
                  ScanerManager.instance.setScanKey(ScanerManager.instance.scanKey.value)
                "
                type="text"
                class="form-control"
                placeholder="scanKey"
              />
            </div>
          </div>
        </div>
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <p>Задержка перед рендером (в мс)</p>
            <div class="form-group">
              <input
                v-model="MainManager.instance.scaningSpeed.value"
                @change="
                  MainManager.instance.setScaningSpeed(
                    MainManager.instance.scaningSpeed.value
                  )
                "
                type="text"
                class="form-control"
              />
            </div>
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-other')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <BootstrapSwitcher
              label="Контроль будущей даты
                    производства"
              v-model:value="UserManager.instance.controlFutureDate.value"
              @tap="(x) => UserManager.instance.setControlFutureDate(x)"
            />
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div class="form-floating mb-1">
              <label for="hostID">Адрес сервера</label>
              <input
                class="form-control"
                id="hostID"
                v-model="host"
                type="text"
                @change="HttpManager.setHost(host)"
                placeholder="СХЕМА://ХОСТ:ПОРТ"
              />
            </div>

            <div class="form-floating mb-1">
              <label for="routePathID">Путь на сервере</label>
              <input
                id="routePathID"
                v-model="routePath"
                type="text"
                class="form-control"
                @change="HttpManager.setPath(routePath)"
                placeholder="СХЕМА://ХОСТ:ПОРТ"
              />
            </div>

            <div
              class="alert alert-warning alert-dismissible fade show text-start mb-1"
              role="alert"
            >
              <strong>Полный путь:</strong> {{ host }}{{ routePath }}/экшен
            </div>

            <div
              :class="`alert alert-${
                connectionStatus == 'УСПЕХ' ? 'success' : 'danger'
              } alert-dismissible fade show text-start mb-1`"
              role="alert"
              @click="testConnectionToServer()"
            >
              <strong>Статус подключения:</strong>
              <br />
              <span v-if="isStartTest">loading</span>
              <span v-else>
                <span v-if="connectionStatus == ''">Нажми что бы проверить</span>
                <span v-else>{{ connectionStatus }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <div class="form-group mb-1">
              <textarea class="form-control" rows="3" v-model="executeCommand"></textarea>
            </div>
            <div
              class="btn btn-primary text-uppercase w-100 w-100"
              @click="EXECUTE(executeCommand)"
            >
              Выполнить код
            </div>
          </div>
        </div>
      </div>
      <div :class="getTabClass('nav-log')">
        <div class="">
          <div class="alert alert-info p-1 mb-1" role="alert">
            <button
              class="btn btn-danger text-uppercase w-100"
              @click="
                () => {
                  LogManager.instance.clear();
                }
              "
            >
              Очистить логи
            </button>
          </div>
        </div>
        <div id="log-application" style="max-height: 400px; overflow: scroll">
          <div v-for="i in log" v-bind:key="i.key" class="fs-8">
            <div class="d-flex-direction-column">
              <span>Key:{{ i.key }}</span>
              <span>Type:{{ i.logType }}</span>
              <span>Date:{{ i.dateCreate }}</span>
              <span>Message:{{ i.arguments }}</span>
            </div>

            <hr />
          </div>
        </div>
      </div>
    </div>

    <div class="space"></div>

    <button class="btn btn-warning btn-block close_btn mb-0" @click="close">
      <b>ЗАКРЫТЬ</b>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { UserManager } from "../managers/user/UserManager";
import { HttpManager } from "@/classes/HttpManager";
import { ScanerManager } from "@/classes/ScanerManager";
import BootstrapSwitcher from "@/components/widgets/BootstrapSwitcher.vue";
import { LogManager } from "@/classes/LogManager";
import { LocalStorageManager } from "@/classes/LocalStorageManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { MainManager } from "@/classes/MainManager";
// import { DBManager, IDBDataRecord } from "@/classes/DBManager";
import { RoutingManager } from "@/classes/RoutingManager";
import { FileManager } from "@/classes/FileManager";
import { DB2Manager } from "@/classes/DB2Manager";

const seen = ref(false);
const host = HttpManager.host;
const routePath = HttpManager.pathToServer;

const thisAndroid = ref(false);
const connectionStatus = ref("");

const executeCommand = ref("");
const isWindows = ref(navigator.platform.indexOf("Win") !== -1);

const log = LogManager.instance.customLog;
const currentTab = ref("nav-barcode");

UserManager.instance.connect("showAdminPage", (data) => {
  show();
});
function show() {
  seen.value = true;
}

function close() {
  seen.value = false;
}

function EXECUTE(command: string) {
  try {
    eval(command);
  } catch (e) {
    alert(e);
  }
}

function updateApp() {
  try {
    //UploadApp()
    LocalStorageManager.set("date_update", "" + new Date());
  } catch (e) {
    NotificationManager.swal(JSON.stringify(e), "error");
  }
}

function openInWeb() {
  try {
    MainManager.instance.cordova.InAppBrowser.open(
      HttpManager.getMainPath() + "/index.html",
      "_blank",
      "location=yes"
    );
  } catch (e) {
    NotificationManager.error(JSON.stringify(e));
  }
}

async function clearStorage() {
  try {
    LocalStorageManager.clear();
    //await DBManager.clear();
    await DB2Manager.instance.clear();
    NotificationManager.success("Локальное хранилище очищено");
    RoutingManager.instance.pushName(RoutingManager.route.selectUser);
  } catch (e: any) {
    NotificationManager.error(e.toString());
  }
}

async function testDB() {
  const key = "dbTest";
  const writeResult = await DB2Manager.setData(key, "Тест базы прошел успешно!");
  if (writeResult) {
    const readResult = await DB2Manager.getData<string>(key);
    if (readResult) {
      NotificationManager.swal(readResult, "success");
      return;
    }
  }
  NotificationManager.swal("Тест прошел не удачно", "error");
}

const isStartTest = ref(false);

async function testConnectionToServer() {
  if (isStartTest.value) return;
  try {
    isStartTest.value = true;
    const params = {
      test_connection: "HelloWorld",
    };
    const response = await HttpManager.get("/execute", params);
    isStartTest.value = false;
    if (response.success) {
      connectionStatus.value = response.data;
    } else {
      connectionStatus.value = "ОШИБКА";
    }
  } catch (e) {
    isStartTest.value = false;
    connectionStatus.value = "ОШИБКА";
  }
}

function getNavClass(value: string) {
  return `nav-link ${currentTab.value === value ? "active" : ""}`;
  //return 'nav-link ' + currentTab === value ? 'active' : ''
}

function getTabClass(value: string) {
  return `tab-pane fade ${currentTab.value === value ? "show active" : ""}`;
  //'tab-pane fade ' + currentTab=='nav-barcode'?'show active':''
}

function setTab(value: string) {
  currentTab.value = value;
}

/// показываем пользователю сколько заказов на отгрузку сейчас загружено в БД
async function showCountLoadedShipmentOrders() {
  //EXECUTE(`getStorage(function(res){alert(res.length)},'orders','orders')`)
  //const res = await DBManager.getFilesAsync(MainManager.keys.orders);
  const res = await DB2Manager.instance.orders!.count();
  NotificationManager.success(res.toString());
  // if (res) {
  //   const records = res ?? [];
  //   NotificationManager.swal(res, "success");
  //   return;
  // }
  // NotificationManager.swal("Данные по запросу не были найдены", "error");
}

async function loadShipmentOrders() {
  //
}

/// Показываем пользователю сколько ШК сейчас загружено в бд
async function showCountLoadedBarcodes() {
  //EXECUTE(`getStorage(function(res){alert(res.length)},'1c','barcodes')`)
  //const res = await DBManager.getFilesAsync(MainManager.keys.barcodes);
  const res = await DB2Manager.instance.barcodes!.count();
  NotificationManager.success(res.toString());
  // if (res) {
  //   const records = res ?? [];
  //   NotificationManager.swal(records.length.toString(), "success");
  //   return;
  // }
  // NotificationManager.error("Данные по запросу не были найдены");
}

async function loadBarcodesFromFile() {
  //readFile()
  NotificationManager.info("Загрузка ШК в локальную базу начата");
  try {
    const fileReadRes = await FileManager.readFile(document.getElementById("file"));
    if (fileReadRes) {
      const data = JSON.parse(fileReadRes as string);
      // const tmp: IDBDataRecord[] = data.map((x: any) => {
      //   return { id: x.ШК, data: x };
      // });
      //await DBManager.WriteDataInDB(MainManager.keys.barcodes, tmp);
      await DB2Manager.instance.barcodes!.setAll(data);
    }
    NotificationManager.info("Загрузка ШК в локальную базу завершена");
  } catch (e) {
    NotificationManager.error(
      "Загрузка ШК в локальную базу завершена с ошибкой\n" + `${e}`
    );
  }
}

async function loadBarcodesFromServer() {
  NotificationManager.info("Загрузка ШК в локальную базу начата");
  await MainManager.instance.uploadBarcodes();
  NotificationManager.info("Загрузка ШК в локальную базу завершена");
}

function showDataUpdateApp() {
  //swal(GetData('date_update')==null?'Неизвестно':GetData('date_update'))
  const data = LocalStorageManager.get("date_update");
  NotificationManager.swal(data ?? "Неизвестно");
}
</script>
