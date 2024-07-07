import { NotificationManager } from "./NotificationManager";
interface IDBDataRecord {
  id: string
  data: any
}
export class DBManager {
  //   static indexedDB =
  //     window.indexedDB ||
  //     window.mozIndexedDB ||

  //static IDBTransaction = window.IDBTransaction 


  // static baseName = "1c";
  // static storeName = "barcodes";

  static async init() {
    // //DBManager.connectDB(()=>{},this.baseName,'test')
    // const setRes = await this.setFileAsync({ id: 0, data: "test message1" }, 'test', 'test')
    // console.log(setRes)
    // const res = await this.getFileAsync(0, 'test', 'test')
    // console.log(res)
    // alert(res.data)
  }

  static async setData(key:string, data:any) : Promise<IDBValidKey>{
    const result = await this.setFileAsync({ id: "0", data: data }, key, key)
    return result
  }

  static async getData(key:string) : Promise<any|null> {
    const result = await this.getFileAsync("0", key, key)
    if(result===null){
      return null
    }
    return result.data
  }

  static removeData(key:string){
    this.deleteDatabase(key)
  }

  /// процедура вызывается когда в операции с локальной бд происходит ошибка
  static logerr(err: any) {
    NotificationManager.swal(JSON.stringify(err.error));
  }
  /// Удаляет базу
  static deleteDatabase(name: string) {
    indexedDB.deleteDatabase(name);
  }
  /// Конектится с базой если базы нет то создает базу и конекстится с ней
  static connectDB(callback: any, base: string, store: string) {

    const request = indexedDB.open(base, 1);
    request.onerror = DBManager.logerr;

    request.onsuccess = () => {
      callback(request.result, base, store);
    };

    request.onupgradeneeded = (e: any) => {
      e.currentTarget.result
        .createObjectStore(store, { keyPath: "id" })
        .createIndex("id", "id", { unique: true });
      DBManager.connectDB(callback, base, store);
    };
  }

  static async getFileAsync(id: string, base: string, store: string): Promise<IDBDataRecord|null> {

    return new Promise((resolve, reject) => {
      try {
        DBManager.connectDB(
          (db: any, base: string, store: string) => {
            const request = db
              .transaction([store], "readonly")
              .objectStore(store)
              .get(id);
            request.onerror = (err: any) => {
              DBManager.logerr(err)
              reject(err)
            };
            request.onsuccess = () => {
              resolve(request.result ? request.result : null)
            };
          },
          base,
          store
        );
      } catch (err) {
        reject(err)
      }

    })

  }

  static getFile(id: string, callback: any, base: string, store: string) {

    DBManager.connectDB(
      (db: any, base: string, store: string) => {
        const request = db
          .transaction([store], "readonly")
          .objectStore(store)
          .get(id);
        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
          callback(request.result ? request.result : -1);
        };
      },
      base,
      store
    );

  }

  static getStorage(callback: any, base: string, store: string) {
    DBManager.connectDB(
      (db: any, base: string, store: string) => {


        const rows: any[] = [];
        const objectStore = db.transaction([store], "readonly").objectStore(store);

        if ("mozGetAll" in objectStore)
          objectStore.mozGetAll().onsuccess = (e: any) => {
            callback(e.target.result);
          };
        else
          objectStore.openCursor().onsuccess = (e: any) => {
            const cursor = e.target.result;
            if (cursor) {
              rows.push(cursor.value);
              cursor.continue();
            } else {
              callback(rows);
            }
          };
      },
      base,
      store
    );
  }
  static async setFileAsync(file: IDBDataRecord, base: string, store: string):Promise<IDBValidKey> {

    return new Promise((resolve, reject) => {
      try {

        DBManager.connectDB(
          (db: IDBDatabase, base: string, store: string) => {
            const request = db
              .transaction([store], "readwrite")
              .objectStore(store)
              .put(file);
            request.onerror = (err) => {

              DBManager.logerr(err)
              reject(err)
            };
            request.onsuccess = () => {
              resolve(request.result)
              return request.result;
            };
          },
          base,
          store
        );
      } catch (err) {
        reject(err)
      }
    })


  }

  static setFile(file: IDBDataRecord, base: string, store: string) {
    DBManager.connectDB(
      (db: IDBDatabase, base: string, store: string) => {
        const request = db
          .transaction([store], "readwrite")
          .objectStore(store)
          .put(file);
        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
          return request.result;
        };
      },
      base,
      store
    );
  }

  static delFile(file: any, base: any, store: any) {

    DBManager.connectDB(
      (db: any, base: any, store: any) => {
        const request = db
          .transaction([store], "readwrite")
          .objectStore(store)
          .delete(file);
        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
          console.log("File delete from DB:", file);
        };
      },
      base,
      store
    );
  }

  static WriteDataInDB(data: any[]) {
    try {
      data.map(i => DBManager.setFile({ data: i, id: i.Наименование }, 'barcodes', 'barcodes'))
    } catch (e) {
      NotificationManager.swal(String(e))
    }
  }
}
