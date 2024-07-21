import { Ref, ref, toRaw } from "vue";
import { BaseManager, ILoadableManager } from "./BaseManager";
import { DB2Manager } from "./DB2Manager";
import { v4 as uuidv4 } from "uuid";
export interface ILogItem {
    key:string,
    arguments: any[]
    dateCreate: Date
    logType: string

}
export class LogManager extends BaseManager implements ILoadableManager {
    constructor() {
        super()
        if (!LogManager.instance) {
            LogManager.instance = this
        }
    }
    static instance: LogManager
    static init() {
        new LogManager()
    }

    public customLog: Ref<ILogItem[]> = ref([])
    public maxSizeLog = 1000


    async load() {
        this.customLog.value = (await DB2Manager.instance.log?.getAll())??[]
        const old_function_log = console.log


        console.log = (...data: any[]) => {
            if (this.customLog.value.length > this.maxSizeLog) {
                
                this.clear()
            }
            const item: ILogItem = {
                key:uuidv4(),
                arguments: data,
                dateCreate: new Date(),
                logType: "log"
            }

            
            this.add(item)
            old_function_log.apply(console, data)
            //this.saveLog()

        }
        console.error = (...data: any[]) => {
            if (this.customLog.value.length > this.maxSizeLog) {
                this.customLog.value.length = 0
            }
            const item: ILogItem = {
                key:uuidv4(),
                arguments: data,
                dateCreate: new Date(),
                logType: "log"
            }
            
            this.add(item)
            old_function_log.apply(console, data)
            //setFile({ id: "1", data: JSON.stringify(custom_log) }, 'log', 'log')
            //this.saveLog()
        }


        window.addEventListener('error', function (e) { 
            console.log(e.error)
        })
    }
    async clear() {
        this.customLog.value.length = 0
        await DB2Manager.instance.log!.clear()
    }
    async add(item: ILogItem) {
        this.customLog.value.unshift(item)
        await DB2Manager.instance.log!.add(item)
    }

   

}