/**import { DB2Manager } from "./DB2Manager";
import { NotificationManager } from "./NotificationManager";
export interface IDBDataRecord {
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

  static async setData(key: string, data: any): Promise<IDBValidKey> {
    return await DB2Manager.instance.local!.set(key,data)
    // await DBManager.deleteDatabase(key);
    // const result = await this.setFileAsync({ id: "0", data: data }, key, key)
    // return result
  }

  static async getData<T>(key: string): Promise<any | null> {
    return await DB2Manager.instance.local!.get<T>(key)
    // const result = await this.getFileAsync("0", key, key)
    // if (result === null) {
    //   return null
    // }
    // return result.data
  }

  static removeData(key: string) {
    this.deleteDatabase(key)
  }

  /// процедура вызывается когда в операции с локальной бд происходит ошибка
  static logerr(err: any) {
    NotificationManager.swal(JSON.stringify(err.error), "error");
  }
  /// Удаляет базу
  static async deleteDatabase(name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = (event) => {
        resolve(true)
      }
      request.onerror = (event) => {
        reject(false)
      }
    })

  }
  /// Конектится с базой если базы нет то создает базу и конекстится с ней
  static connectDB(callback: (data: IDBDatabase, base: string, store: string) => void, base: string, store: string) {

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

  static async getFileAsync(id: string, base: string, store = ''): Promise<IDBDataRecord | null> {
    if (store == '') {
      store = base
    }
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

  /// Получаем все записи из БД
  // static async getFilesAsync(base: string): Promise<IDBDataRecord[] | null> {

  //   return new Promise((resolve, reject) => {
  //     try {
  //       DBManager.connectDB(
  //         (db: any, base: string, store: string) => {
  //           const request = db
  //             .transaction([store], "readonly")
  //             .objectStore(store)
  //             .getAll();
  //           request.onerror = (err: any) => {
  //             DBManager.logerr(err)
  //             reject(err)
  //           };
  //           request.onsuccess = () => {
  //             resolve(request.result ? request.result : null)
  //           };
  //         },
  //         base,
  //         base
  //       );
  //     } catch (err) {
  //       reject(err)
  //     }

  //   })

  // }

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

  static async setFileAsync(file: IDBDataRecord, base: string, store: string): Promise<IDBValidKey> {

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

  /// Запись в локальную бд итерируемого объекта
  static async WriteDataInDB(key: string, data: IDBDataRecord[],): Promise<boolean> {
    await DBManager.deleteDatabase(key);
    const db = await this.openDatabase(key, key);
    const transaction = db.transaction(key, 'readwrite');
    const objectStore = transaction.objectStore(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Все записи успешно добавлены.');
        resolve(true);
      };

      transaction.onerror = (event) => {
        console.error('Ошибка при добавлении записей:', event);
        reject(event);
      };

      for (const item of data) {
        const request = objectStore.add(item);
        //console.log('item ',item,'request ',request)
        //request.onerror=(e)=>{
        //  console.log('request error',e)
        //}
      }
    });


    // return new Promise((resolve,reject)=>{
    //   DBManager.connectDB(()=>{

    //   },key,key)
    // })
    // try {
    //   const writeOperations = data.map(i => DBManager.setFileAsync({ data: i, id: i.Наименование }, key, key))
    //   // Дожидаемся записи всех
    //   await Promise.all(writeOperations)
    //   return true
    // } catch (e) {
    //   NotificationManager.swal(String(e),'error')
    //   return false
    // }
  }

  static async clear() {

    // Получить доступ к API IndexedDB
    const indexedDB = window.indexedDB;
    let databases:string[] = []
    // Получить список всех баз данных
    if((indexedDB as any).databases){
      const tmp = await indexedDB.databases();
      databases = tmp.map(x=>x.name!)
    } else {
      databases = await DBManager.getDataBasesNames()
    }
   

    // Удалить каждую базу данных по имени
    for (const name of databases) {
      if (name) {
        await DBManager.deleteDatabase(name);
      }
    }

  }

  static async getDataBasesNames():Promise<string[]>{
    return new Promise((resolve,reject)=>{
      if ((indexedDB as any).webkitGetDatabaseNames) {
        const request = (indexedDB as any).webkitGetDatabaseNames();
        request.onsuccess = function(event:any) {
            resolve(event.target.result)
        };
        request.onerror = function(event:any) {
          reject(event)
        };
    } else {
      reject("webkitGetDatabaseNames is not supported in this browser.") 
    }
    })
  }



  // Функция для открытия соединения с IndexedDB
  private static openDatabase(dbName: string, storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = (event) => {
        console.error('Ошибка при открытии базы данных:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          // db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          db .createObjectStore(storeName, { keyPath: "id" })
        .createIndex("id", "id", { unique: true });
        }
      };
    });
  }
} */


