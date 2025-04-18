import { BaseManager, ILoadableManager } from "./BaseManager";
import { LocalStorageManager } from "./LocalStorageManager";

interface IRoutingMap {
    selectUser: string
    mainMenu: string
    gettingProductionLoad: string
    gettingProductionForm: string
    gettingProductionCheck: string

    shipmentLoad:string
    shipmentForm:string
    shipmentCheck:string

    shipmentCreateInfoListForm:string
    shipmentCreateInfoListCheck:string
    shipmentUploadInfoListByBarcode:string

    shipmentReflectionStoreForm:string
    shipmentReflectionStoreCheck:string
    
    sohShipmentLoad:string
    sohShipmentForm:string
    sohShipmentCheck:string

    sohGettingLoad:string
    sohGettingForm:string
    sohGettingCheck:string
    
}

export class RoutingManager extends BaseManager implements ILoadableManager {
    static instance: RoutingManager

    static route: IRoutingMap = {
        selectUser: "selectUser",
        mainMenu: "mainMenu",
        gettingProductionLoad: "gettingProductionLoad",
        gettingProductionForm: "gettingProductionForm",
        gettingProductionCheck: "gettingProductionCheck",

        shipmentLoad: "shipmentLoad",
        shipmentForm: "shipmentForm",
        shipmentCheck: "shipmentCheck",

        shipmentCreateInfoListForm:"shipment__Create_InfoList__Form",
        shipmentCreateInfoListCheck:"shipment__Create_InfoList__Check",
        shipmentUploadInfoListByBarcode:"shipment__Upload_InfoList__ByBarcode",

        shipmentReflectionStoreForm:"shipment__ReflectionStore__Form",
        shipmentReflectionStoreCheck:"shipment__ReflectionStore__Check",

        sohShipmentLoad:"sohShipmentLoad",
        sohShipmentForm:"sohShipmentForm",
        sohShipmentCheck:"sohShipmentCheck",

        sohGettingLoad:"sohGettingLoad",
        sohGettingForm:"sohGettingForm",
        sohGettingCheck:"sohGettingCheck"

    }

    public currentScreen: string = RoutingManager.route.selectUser; /// Текущее активированное окно

    constructor() {
        super()
        RoutingManager.instance = this
    }

    static init() {
        new RoutingManager()
    }

    afterReload() {
        if (this.currentScreen) {
            this.pushName(this.currentScreen)
        }
    }

    load() {
        this.currentScreen = LocalStorageManager.get("currentScreen");
        this.afterReload()
    }

    pushName(key: string) {
        
        //this.emit("go", [this.currentScreen]);
        this.emit('pushName', [key])
    }

    /// Регистрируем экран в системе роутинга
    registry(key: string, show: () => void, close: () => void,) {
        document.addEventListener('pushName', (event: any) => {
            if (event.detail[0] === key) {
                this.setCurrentScreen(key)
                show()
            } else {
                close()
            }
        })
    }

    setCurrentScreen(value: string) {
        this.currentScreen = value
        LocalStorageManager.set("currentScreen", value);
        this.emit('setCurrentScreen', [value])
    }
}