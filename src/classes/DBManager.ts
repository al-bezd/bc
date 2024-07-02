import { NotificationManager } from "./NotificationManager";

export class DBManager {
//   static indexedDB =
//     window.indexedDB ||
//     window.mozIndexedDB ||

  //static IDBTransaction = window.IDBTransaction 


  static baseName = "1c";
  static storeName = "barcodes";

  static init(){
    //
  }

  static logerr(err: any) {
    NotificationManager.swal(JSON.stringify(err.error));
  }

  static deleteDatabase(name: string) {
    indexedDB.deleteDatabase(name);
  }

  static connectDB(f:any, base:string, store:string) {
    let baseName = base;
    let storeName = store;

    if (base === undefined) {
      baseName = "1c";
    }
    if (store === undefined) {
      storeName = "barcodes";
    }
    //SetData('baseName',base)
    //SetData('storeName',store)

    const request = indexedDB.open(baseName, 1);

    request.onerror = DBManager.logerr;

    request.onsuccess = () => {
      f(request.result, base, store);
    };

    request.onupgradeneeded = (e:any) => {
      //storeName = GetData("storeName")
      //baseName  = GetData("baseName")
      e.currentTarget.result
        .createObjectStore(storeName, { keyPath: "id" })
        .createIndex("id", "id", { unique: true });
      DBManager.connectDB(f, baseName, storeName);

      //RemoveData('baseName',base)
      //RemoveData('storeName',store)
    };
  }

  static getFile(id:string, callback:any, base:string, store:string) {
    let baseName:string = base;
    let storeName:string = store;
    if (base === undefined) {
      baseName = "1c";
    }
    if (store === undefined) {
      storeName = "barcodes";
    }

    DBManager.connectDB(
      (db:any, base:string, store:string) => {
        let baseName = base;
        let storeName = store;
        if (base === undefined) {
          baseName = "1c";
        }
        if (store === undefined) {
          storeName = "barcodes";
        }

        const request = db
          .transaction([storeName], "readonly")
          .objectStore(storeName)
          .get(id);

        //RemoveData('baseName',base)
        //RemoveData('storeName',store)

        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
            callback(request.result ? request.result : -1);
        };
      },
      baseName,
      storeName
    );
  }

  static getStorage(f:any, base:string, store:string) {
    let baseName = base;
    let storeName = store;
    if (base === undefined) {
      baseName = "1c";
    }
    if (store === undefined) {
      storeName = "barcodes";
    }
    DBManager.connectDB(
      (db:any, baseName:string, storeName:string) => {
        //setTimeout( ()=> {
        //baseName=GetData('baseName')
        //storeName=GetData('storeName')

        if (baseName === undefined) {
          baseName = "1c";
        }

        if (storeName === undefined) {
          storeName = "barcodes";
        }

        const rows: any[] = [];
        const objectStore = db.transaction([storeName], "readonly").objectStore(storeName);

        if ("mozGetAll" in objectStore)
            objectStore.mozGetAll().onsuccess = (e:any) => {
            f(e.target.result);
          };
        else
        objectStore.openCursor().onsuccess = (e:any) => {
            const cursor = e.target.result;
            if (cursor) {
              rows.push(cursor.value);
              cursor.continue();
            } else {
              f(rows);
            }
          };
        //}, 100)
      },
      baseName,
      storeName
    );
  }

  static setFile(file:any, base:string, store:string) {
    let baseName = base;
    let storeName = store;
    if (base === undefined) {
      baseName = "1c";
    }
    if (store === undefined) {
      storeName = "barcodes";
    }

    DBManager.connectDB(
      (db:any, base:string, store:string) => {
        let baseName = base;
        let storeName = store;
        if (base === undefined) {
          baseName = "1c";
        }
        if (store === undefined) {
          storeName = "barcodes";
        }

        const request = db
          .transaction([storeName], "readwrite")
          .objectStore(storeName)
          .put(file);
        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
          return request.result;
        };
      },
      baseName,
      storeName
    );
  }

  static delFile(file:any, base:any, store:any) {
    let baseName = base;
    let storeName = store;
    if (base === undefined) {
      baseName = "1c";
    }
    if (store === undefined) {
      storeName = "barcodes";
    }
    DBManager.connectDB(
      (db:any, baseName:any, storeName:any) => {
        const request = db
          .transaction([storeName], "readwrite")
          .objectStore(storeName)
          .delete(file);
        request.onerror = DBManager.logerr;
        request.onsuccess = () => {
          console.log("File delete from DB:", file);
        };
      },
      baseName,
      storeName
    );
  }

  static WriteDataInDB(data:any[]) {
    try {
      data.map(i => DBManager.setFile({ data: i, id: i.Наименование }, '1c', 'barcodes'))
    } catch (e) {
      NotificationManager.swal(String(e))
    }
  }
}
