interface IResponse {
  success: boolean;
  data: any;
  error: any;
}
export class HttpManager {
  static host = "http://lyra.reftp.ru";
  static pathToServer = "/barcode2020/hs/barcode/";
  static init(){
    //
  }
  static getHeaders() {
    return {
      "Content-Type": "application/json", // Указание типа содержимого
    };
  }
  static async get(action: string, params = {}): Promise<IResponse> {
    const opt = {
      method: "get",
      params: params,
      headers: this.getHeaders(),
    };
    try {
      const response = await fetch(this.host + this.pathToServer + action, opt);
      const json = await response.json();
      return { success: true, data: json } as IResponse;
    } catch (e) {
      return { success: false, data: null, error: e } as IResponse;
    }
  }

  static async post(action: string, data: any): Promise<IResponse> {
    const params = {
      method: "post",
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    };
    try {
      const response = await fetch(
        this.host + this.pathToServer + action,
        params
      );
      const json = await response.json();
      return { success: true, data: json } as IResponse;
    } catch (e) {
      return { success: false, data: null, error: e } as IResponse;
    }
  }
}
