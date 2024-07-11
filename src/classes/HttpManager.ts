import { Ref, ref } from "vue";
import { LocalStorageManager } from "./LocalStorageManager";
import { BaseManager, ILoadableManager } from "./BaseManager";

export interface IWithCheckup{
  РезультатПроверки:boolean
}

export class HttpManager extends BaseManager implements ILoadableManager {
  constructor(){
    super()
    if(!HttpManager.instance){
      HttpManager.instance = this
    }
  }
  static instance:HttpManager
  static host= ref("http://lyra.reftp.ru");
  static pathToServer = ref("/barcode2020/hs/barcode/");

  static init() {
    new HttpManager()
  }

  load() {
   
    HttpManager.host.value = LocalStorageManager.get('host')??HttpManager.host.value
    HttpManager.pathToServer.value = LocalStorageManager.get('pathToServer')??HttpManager.pathToServer.value
  }

  static getHeaders() {
    return {
      //"Content-Type": "application/json", // Указание типа содержимого
    };
  }

  static getMainPath(){
    return `${this.host.value}${this.pathToServer.value}`
  }

  static async get(action: string, params = {}): Promise<IResponse> {
    const queryString = new URLSearchParams(Object.assign({},params)).toString();

    // Формирование полного URL с параметрами запроса
    const url = `${HttpManager.getMainPath()}${action}?${queryString}`;
    console.log('get url ', url)
    const opt = {
      method: "get",
      // params: params,
      headers: this.getHeaders(),
    };
    try {
      const response = await fetch(url, opt);
      const json = await response.json();
      return { success: true, data: json } as IResponse;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Caught an error:", error.message);
      } else {
        console.error("Caught an unknown error:", error);
      }
      throw error
      //return { success: false, data: null, error: e } as IResponse;
    }
  }

  static async post(action: string, data: any, params={}): Promise<IResponse> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${HttpManager.getMainPath()}${action}?${queryString}`;
    const opt = {
      method: "post",
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    try {
      const response = await fetch(
        url,
        opt
      );
      const json = await response.json();
      return { success: true, data: json } as IResponse;
    } catch (error) {
      //return { success: false, data: null, error: e } as IResponse;
      if (error instanceof Error) {
        console.error("Caught an error:", error.message);
      } else {
        console.error("Caught an unknown error:", error);
      }
      throw error
    }
  }

  static setHost(host:string){
    this.host.value = host
    LocalStorageManager.set('host',host)
  }

  static setPath(path:string){
    this.pathToServer.value = path
    LocalStorageManager.set('pathToServer', path)
  }

  static getAppLink(){
    return this.host.value+this.pathToServer.value+'/app-debug.apk'
  }
}

export interface IResponse {
  success: boolean;
  data: any;
  error: any;
}
