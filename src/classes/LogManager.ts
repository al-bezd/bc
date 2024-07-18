import { Ref, ref, toRaw } from "vue";
import { BaseManager, ILoadableManager } from "./BaseManager";
import { DB2Manager } from "./DB2Manager";
//import { DBManager } from "./DBManager";
interface ILogItem {
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

    public customLog: Ref<any[]> = ref([])
    public maxSizeLog = 1000


    load() {

        const old_function_log = console.log


        console.log = (...data: any[]) => {
            if (this.customLog.value.length > this.maxSizeLog) {
                this.customLog.value.length = 0
            }
            const item: ILogItem = {
                arguments: data,
                dateCreate: new Date(),
                logType: "log"
            }

            this.customLog.value.unshift(JSON.stringify(item))
            old_function_log.apply(console, data)
            this.saveLog()

        }
        console.error = (...data: any[]) => {
            if (this.customLog.value.length > this.maxSizeLog) {
                this.customLog.value.length = 0
            }
            const item: ILogItem = {
                arguments: data,
                dateCreate: new Date(),
                logType: "log"
            }
            this.customLog.value.unshift(item)
            old_function_log.apply(console, data)
            //setFile({ id: "1", data: JSON.stringify(custom_log) }, 'log', 'log')
            this.saveLog()
        }


        window.addEventListener('error', function (e) { 
            console.log(e.error)
        })
    }

    private saveLog() {
        DB2Manager.setData('log',toRaw(this.customLog.value))
    }

}