import { BaseManager, ILoadableManager } from "./BaseManager"

export class FileManager extends BaseManager implements ILoadableManager {
    static instance: FileManager
    constructor() {
        super()
        if (!FileManager.instance) {
            FileManager.instance = this
        }
    }

    static init() {
        new FileManager()
    }
    
    static async readFile(object: any ): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const file = object.files[0]
            const reader = new FileReader()
            reader.onload = function () {
                resolve(reader.result)
            }
            reader.readAsText(file)
        })
        // var file = object.files[0]
        // var reader = new FileReader()
        // reader.onload = function () {
        //   SetBarcods(JSON.parse(reader.result))
        // }
        // reader.readAsText(file)
    }

    load() {
        //
    }
}