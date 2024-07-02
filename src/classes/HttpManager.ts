export class HttpManager {
  static host = "http://lyra.reftp.ru";
  static pathToServer = "/barcode2020/hs/barcode/";
  static init() {
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
}

export interface IResponse {
  success: boolean;
  data: any;
  error: any;
}
