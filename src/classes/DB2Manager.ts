



import Dexie, { EntityTable } from "dexie";
import { BaseManager } from "./BaseManager";
import { IScaning } from "@/interfaces/IScaning";
import { IContainer } from "@/interfaces/IStore";
import { IDocument, IUser, IНоменклатура, IХарактеристика } from "@/interfaces/IDocument";
import { ITorgovieSeti } from "@/interfaces/ITorgovieSeti";
import { IInfoList } from "@/interfaces/IInfoList";
import { ILogItem } from "./LogManager";

export interface IlocalData {
    id: string;
    data: any
}
export interface IBarcodeLinkedObject{
    Номенклатура:IНоменклатура
    Характеристика:IХарактеристика
    ПЛУ:string
}

export interface IBarcode {
    Наименование: string
    Ссылка: IBarcodeLinkedObject        
}

type IShipmentScaningStore = { shipmentCurrentScanings: EntityTable<IScaning, 'IDSec'> }
type IGettingScaningStore = { gettingCurrentScanings: EntityTable<IScaning, 'IDSec'> }
type IContainerStore = { containers: EntityTable<IContainer, 'id'> }
type IUserStore = { user: EntityTable<IUser, 'ФИО'> }
type IBarcodeStore = { barcodes: EntityTable<IBarcode, 'Наименование'> }
type ITorgovieSetiStore = { torgovieSeti: EntityTable<ITorgovieSeti, 'Код'> }
type ILocalStore = { localStore: EntityTable<IlocalData, 'id'> }
type IOrdersStore = { orders: EntityTable<IDocument, 'ШК'> }
type IInfoSheetsStore = { infoSheets: EntityTable<IInfoList, 'ШК'> }
type IUserDocumentsStore = { userDocuments: EntityTable<IDocument, 'ШК'> }
type ILogStore = {log:EntityTable<ILogItem,'key'>}

interface ILocalStoreController {
    store: EntityTable<IlocalData, "id">,
    get<T>(key: string): Promise<T | null>,
    set(key: string, value: any): Promise<any>,
    delete: (key: string) => any
}

interface IUserStoreController {
    store: EntityTable<IUser, 'ФИО'>,
    set(value: IUser): Promise<string | null>,
    get(): Promise<IUser | null>,
    delete(value: IUser): Promise<void>
}

interface IContainerStoreController {
    store: EntityTable<IContainer, 'id'>,
    setAll(value: IContainer[]): Promise<number>,
    getAll(): Promise<IContainer[]>
}

interface IScaningStoreController{
    store: EntityTable<IScaning, 'IDSec'>,
    addScaning(scaning: IScaning): Promise<number>,
    setScanings(scanings: IScaning[]): Promise<number>,
    deleteScaning(scaning: IScaning): Promise<void>,
    getScanings(): Promise<IScaning[]>,
    clearScanings(): Promise<void>
    
}

interface IBarcodeStoreController{
    store: EntityTable<IBarcode, 'Наименование'>,
    setAll(barcodes: IBarcode[]): Promise<string>,
    get(key: string): Promise<IBarcode | undefined>,
    count(): Promise<number>
}

interface ITorgovieSetiStoreController{
    store: EntityTable<ITorgovieSeti, 'Код'>,
    setAll(values: ITorgovieSeti[]): Promise<string>,
    getAll(): Promise<ITorgovieSeti[]>,
    get(Код: string): Promise<ITorgovieSeti | undefined>
}

interface IOrdersStoreController{
    store: EntityTable<IDocument, 'ШК'>,
    setAll(values: IDocument[]): Promise<string>,
    getAll(): Promise<IDocument[]>,
    get(ШК: string): Promise<IDocument | undefined>,
    count(): Promise<number>
}

interface IInfoSheetsStoreController{
    store: EntityTable<IInfoList, 'ШК'>,
    setAll(values: IInfoList[]): Promise<string>,
    addAll(values: IInfoList[]): Promise<string>,
    getAll(): Promise<IInfoList[]>,
    get(ШК: string): Promise<IInfoList | null>,
    count(): Promise<number>
}

interface IUserDocumentsStoreController{
    store: EntityTable<IDocument, 'ШК'>,
    setAll(values: IDocument[]): Promise<string>,
    getAll(): Promise<IDocument[]>,
    get(ШК: string): Promise<IDocument | null>,
    count(): Promise<number>,
    delete(value: IDocument): Promise<void>
}

interface ILogStoreController{
    store: EntityTable<ILogItem, 'key'>,
    getAll(): Promise<ILogItem[]>,
    add(item:ILogItem): Promise<string>,
    clear(): Promise<void>
    
}


export class DB2Manager extends BaseManager {
    public static instance: DB2Manager




    constructor() {
        super()
        DB2Manager.instance = this
    }

    static init() {
        new DB2Manager()
    }

    public db: Dexie | null = null

    //public user: IUserStoreController | null = null
    public containers: IContainerStoreController | null = null
    public shiping: IScaningStoreController | null = null
    public getting: IScaningStoreController | null = null
    public barcodes: IBarcodeStoreController | null = null
    public torgovieSeti: ITorgovieSetiStoreController | null = null
    public orders: IOrdersStoreController | null = null
    public infoSheets: IInfoSheetsStoreController | null = null
    public userDocuments: IUserDocumentsStoreController | null = null
    public log:ILogStoreController | null = null
    public local: ILocalStoreController | null = null

    async fillManager() {
        // this.user = {
        //     store: (DB2Manager.instance.db! as Dexie & IUserStore).user,
        //     async set(value: IUser):Promise<string|null> {
        //         await this.delete(value)
        //         return await this.store.add(value)
        //     },
        //     async get() {
        //         const tmp = await this.store.toArray()
        //         if (tmp.length == 0) {
        //             return null
        //         }
        //         return tmp[0]
        //     },
        //     async delete(value:IUser){
        //         return await this.store.delete(value.ФИО)
        //     }
        // }

        this.containers = {
            store: (DB2Manager.instance.db! as Dexie & IContainerStore).containers,
            async setAll(value: IContainer[]) {
                await this.store.clear()
                return await this.store.bulkAdd(value)
            },
            async getAll() {
                return (await this.store.toArray()) ?? []
            }
        }

        this.shiping = {
            store: (DB2Manager.instance.db! as Dexie & IShipmentScaningStore).shipmentCurrentScanings,
            async addScaning(scaning: IScaning) {
                return await this.store.add(scaning)
            },
            async setScanings(scanings: IScaning[]) {
                //const store = (DB2Manager.instance.db! as Dexie & IShipmentScaningStore).shipmentCurrentScanings
                await this.store.clear()
                return await this.store.bulkAdd(scanings)
            },
            async deleteScaning(scaning: IScaning) {
                return await this.store.delete(scaning.IDSec)
            },
            async getScanings() {
                return (await this.store.toArray()) ?? []
            },
            async clearScanings() {
                return await this.store.clear()
            }
        }

        this.getting = {
            store: (DB2Manager.instance.db! as Dexie & IGettingScaningStore).gettingCurrentScanings,
            async addScaning(scaning: IScaning) {
                return await this.store.add(scaning)
            },
            async setScanings(scanings: IScaning[]) {
                await this.store.clear()
                return await this.store.bulkAdd(scanings)
            },
            async deleteScaning(scaning: IScaning) {
                return await this.store.delete(scaning.IDSec)
            },
            async getScanings() {
                return (await this.store.toArray()) ?? []
            },
            async clearScanings() {
                await this.store.clear()
            }

        }

        this.barcodes = {
            store: (DB2Manager.instance.db! as Dexie & IBarcodeStore).barcodes,
            async setAll(barcodes: IBarcode[]) {
                await this.store.clear()
                return await this.store.bulkAdd(barcodes)
            },
            async get(key: string) {
                return await this.store.get(key)
            },
            async count() {
                return await this.store.count()
            }
        }

        this.torgovieSeti = {
            store: (DB2Manager.instance.db! as Dexie & ITorgovieSetiStore).torgovieSeti,
            async setAll(values: ITorgovieSeti[]) {
                await this.store.clear()
                return await this.store.bulkAdd(values)
            },
            async getAll() {
                return (await this.store.toArray()) ?? []

            },
            async get(Код: string) {
                return await this.store.get(Код)
            },
        }

        this.orders = {
            store: (DB2Manager.instance.db! as Dexie & IOrdersStore).orders,
            async setAll(values: IDocument[]) {
                
                await this.store.clear()
                return await this.store.bulkAdd(values)
            },
            async getAll() {
                return await this.store.toArray()
            },

            async get(ШК: string) {
                return await this.store.get(ШК)
            },
            async count() {
                return await this.store.count()
            }

        }

        this.infoSheets = {
            store: (DB2Manager.instance.db! as Dexie & IInfoSheetsStore).infoSheets,
            async setAll(values: IInfoList[]) {
                await this.store.clear()
                return await this.store.bulkAdd(values)
            },

            async addAll(values: IInfoList[]) {
                return await this.store.bulkPut(values)
            },

            async getAll() {
                return await this.store.toArray()
            },

            async get(ШК: string) {
                return (await this.store.get(ШК))??null
            },
            async count() {
                return await this.store.count()
            }
        }

        this.userDocuments = {
            store: (DB2Manager.instance.db! as Dexie & IUserDocumentsStore).userDocuments,
            async count() {
                return await this.store.count()
            },async get(ШК: string) {
                return (await this.store.get(ШК))??null
            },
            async setAll(values: IDocument[]) {
                await this.store.clear()
                return await this.store.bulkAdd(values)
            },

            async getAll() {
                return await this.store.toArray()
            },
            async delete(value:IDocument){
                return await this.store.delete(value.ШК)
            }

        }

        this.log = {
            store:(DB2Manager.instance.db! as Dexie & ILogStore).log,
            async add(item:ILogItem) {
                return await this.store.add(item)
            },
            async getAll() {
                return (await this.store.toArray())??[]
            },
            async clear() {
                return await this.store.clear()
            }
            
        }

        this.local = {
            store: (DB2Manager.instance.db! as Dexie & ILocalStore).localStore,
            async set(key: string, value: any) {
                await this.store.delete(key)
                //return await this.store.add({ 'id': key, "data": value })
                return await this.store.put({ 'id': key, "data": value })
            },
            async get<T>(key: string): Promise<T | null> {
                const tmp = await this.store.get(key)
                if (tmp) {
                    return tmp?.data as T
                }
                return null

                //return () as T
            },
            async delete(key:string):Promise<void>{
                return await this.store.delete(key)
            }

        }
    }


    async clear(){
        await this.db!.delete();
        this.createDb('1c')
    }




    async load() {
        this.createDb('1c')
        await this.fillManager()
    }

    createDb(dbname: string) {

        this.db = new Dexie(dbname) as Dexie &
            ILocalStore &
            IShipmentScaningStore &
            IGettingScaningStore &
            IContainerStore &
            IUserStore &
            IBarcodeStore &
            ITorgovieSetiStore &
            IOrdersStore &
            IUserDocumentsStore &
            IInfoSheetsStore &
            ILogStore

        this.db.version(1).stores({
            localStore: '++id, data', // primary key "id" (for the runtime!),
            shipmentCurrentScanings: '++IDSec, data',
            gettingCurrentScanings: '++IDSec, data',
            containers: '++id, data',
            user: '++id, data',
            barcodes: '++Наименование, data',
            torgovieSeti: '++Код, data',
            orders: '++ШК, data',
            userDocuments: '++ШК, data',
            infoSheets: '++ШК, data',
            log: '++key, data'
        });
    }

    static async setData(key: string, data: any): Promise<IDBValidKey> {
        await this.removeData(key)
        const result = await DB2Manager.instance.local!.set(key, data)
        //const result = await this.setFileAsync({ id: "0", data: data }, key, key)
        return result
    }

    static async getData<T>(key: string): Promise<T | null> {
        const result = await DB2Manager.instance.local!.get<T>(key)
        //const result = await this.getFileAsync("0", key, key)
        if (result === null) {
            return null
        }
        return result
    }

    static async removeData(key:string):Promise<void>{
        return await DB2Manager.instance.local!.delete(key)
    }



}