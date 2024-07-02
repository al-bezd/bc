import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';


import { createPinia } from 'pinia';
import { LocalStorageManager } from './classes/LocalStorageManager';
import { MainManager } from './classes/MainManager';
import { ShipmentManager } from './managers/shippment/ShipmentManager';
import { GettingManager } from './managers/getting/GettingManager';
import { UserManager } from './managers/user/UserManager';
import { DBManager } from './classes/DBManager';
import { HttpManager } from './classes/HttpManager';

const app = createApp(App);
const pinia = createPinia();

ShipmentManager.init()
GettingManager.init()
UserManager.init()
DBManager.init()
LocalStorageManager.init()
HttpManager.init()
MainManager.init()
// eslint-disable-next-line
if(window.hasOwnProperty('cordova')){
    MainManager.instance.cordova = (window as any)['cordova']
    app.config.globalProperties.$cordova = MainManager.instance.cordova;
}



MainManager.instance.load()

app.use(pinia);

app.mount('#app');
