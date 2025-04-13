

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { computed, createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LocalStorageManager } from './classes/LocalStorageManager';
import { MainManager } from './classes/MainManager';
import { ShipmentManager } from './managers/shipment/ShipmentManager';
import { GettingManager } from './managers/getting/GettingManager';
import { UserManager } from './managers/user/UserManager';

import { HttpManager } from './classes/HttpManager';
import { ScanerManager } from './classes/ScanerManager';
import { NotificationManager } from './classes/NotificationManager';
import { RoutingManager } from './classes/RoutingManager';
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { LogManager } from './classes/LogManager';
import { FileManager } from './classes/FileManager';
import { DB2Manager } from './classes/DB2Manager';
import { SohShipmentManager } from './managers/soh/SohShipmentManager';
import { SohGettingManager } from './managers/soh/SohGettingManager';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VueVirtualScroller from 'vue-virtual-scroller';
import { RecycleScroller,DynamicScroller } from 'vue-virtual-scroller';


const app = createApp(App);
app.use(VueVirtualScroller)
//app.component('RecycleScroller', RecycleScroller)
//app.component('DynamicScroller', DynamicScroller)
app.use(Vue3Toasity)

//const pinia = createPinia();
DB2Manager.init()


FileManager.init()
LogManager.init()
ShipmentManager.init()
GettingManager.init()

SohShipmentManager.init()
SohGettingManager.init()

UserManager.init()
//DBManager.init()
LocalStorageManager.init()
HttpManager.init()
ScanerManager.init()
NotificationManager.init()
RoutingManager.init()


MainManager.init()
MainManager.load=async()=>{
    
    await DB2Manager.instance.load()
    FileManager.instance.load()
    LogManager.instance.load()
    MainManager.instance.load()
    GettingManager.instance.load()
    ShipmentManager.instance.load();
    SohShipmentManager.instance.load(),
    SohGettingManager.instance.load(),
    HttpManager.instance.load()
    ScanerManager.instance.load()
    UserManager.instance.load()
    NotificationManager.instance.load()
    RoutingManager.instance.load()
    
}

// eslint-disable-next-line
if(window.hasOwnProperty('cordova')){
    MainManager.instance.cordova = (window as any)['cordova']
    app.config.globalProperties.$cordova = MainManager.instance.cordova;
}




MainManager.load()

app.mount('#app');

