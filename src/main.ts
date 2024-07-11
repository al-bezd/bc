import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';


import { createPinia } from 'pinia';
import { LocalStorageManager } from './classes/LocalStorageManager';
import { MainManager } from './classes/MainManager';
import { ShipmentManager } from './managers/shipment/ShipmentManager';
import { GettingManager } from './managers/getting/GettingManager';
import { UserManager } from './managers/user/UserManager';
import { DBManager } from './classes/DBManager';
import { HttpManager } from './classes/HttpManager';
import { ScanerManager } from './classes/ScanerManager';
import { NotificationManager } from './classes/NotificationManager';
import { RoutingManager } from './classes/RoutingManager';
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { LogManager } from './classes/LogManager';
import { FileManager } from './classes/FileManager';



const app = createApp(App);
app.use(Vue3Toasity)
const pinia = createPinia();


FileManager.init()
LogManager.init()
ShipmentManager.init()
GettingManager.init()
UserManager.init()
DBManager.init()
LocalStorageManager.init()
HttpManager.init()
ScanerManager.init()
NotificationManager.init()
RoutingManager.init()


MainManager.init()
// eslint-disable-next-line
if(window.hasOwnProperty('cordova')){
    MainManager.instance.cordova = (window as any)['cordova']
    app.config.globalProperties.$cordova = MainManager.instance.cordova;
}


FileManager.instance.load()
LogManager.instance.load()
MainManager.instance.load()
GettingManager.instance.load()
ShipmentManager.instance.load();
HttpManager.instance.load()
ScanerManager.instance.load()
UserManager.instance.load()

NotificationManager.instance.load()
RoutingManager.instance.load()


app.use(pinia);

app.mount('#app');
