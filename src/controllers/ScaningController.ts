
import { DB2Manager } from "@/classes/DB2Manager";
import { HttpManager, IResponse } from "@/classes/HttpManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { ScanerManager } from "@/classes/ScanerManager";
import { Date1C } from "@/functions/Date1C";
import { FindGM, IsBarcodePalet } from "@/functions/FindGruzoMesta";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { IНоменклатура, IСерия, IХарактеристика } from "@/interfaces/IDocument";
import { IScaning } from "@/interfaces/IScaning";
import { GettingManager } from "@/managers/getting/GettingManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { SohGettingManager } from "@/managers/soh/SohGettingManager";
import { SohShipmentManager } from "@/managers/soh/SohShipmentManager";
import { UserManager } from "@/managers/user/UserManager";


interface IBarcodeStructure {
    Штрихкод: string
    Количество: number
    ДатаПроизводства: string
    ГоденДо: string
}

export class ScaningController {
    constructor(manager: ShipmentManager | GettingManager | SohShipmentManager | SohGettingManager, isFree = false) {

        this.isFree = isFree
        this.manager = manager
    }

    /// параметр отвечающий за привязку к документу
    public isFree = false
    public manager: ShipmentManager | GettingManager | SohShipmentManager | SohGettingManager

    public itPalet = false;


    /// Получаем разобранную структура штрих кода
    getBarcodeStructure(barcode: string): IBarcodeStructure {
        const Штрихкод = barcode.slice(2, 16);
        const Количество = Number(barcode.slice(20, 26)) / 1000;
        const ДатаПроизводства = barcode.slice(28, 34);
        const ГоденДо = barcode.slice(36, 42);
        return {
            Штрихкод,
            Количество,
            ДатаПроизводства,
            ГоденДо
        }
    }

    /// получаем новое сканирование по переданному штрихкоду
    async getScaning(barcode: string, itPalet: boolean): Promise<IScaning | null> {
        const barcodeValue = ScanerManager.instance.barcodeWrapper(barcode);
        const barcodeStruct: IBarcodeStructure = this.getBarcodeStructure(barcode)




        if (UserManager.instance.useLocalDb.value) {
            const barcodeFromDB = await DB2Manager.instance.barcodes!.get(
                barcodeStruct.Штрихкод
            );
            if (!barcodeFromDB) {
                NotificationManager.instance.playError()
                NotificationManager.swal("Продукция не найдена");
                return null
            }
            return this.createScaning(
                barcodeValue,
                barcodeStruct.Штрихкод,
                barcodeFromDB.Ссылка.Номенклатура,
                barcodeFromDB.Ссылка.Характеристика,
                barcodeFromDB.Ссылка.ПЛУ,
                barcodeStruct.Количество,
                barcodeStruct.ДатаПроизводства,
                barcodeStruct.ГоденДо,
                itPalet
            );
        } else {

            const httpResult = await this.getBarcodeDataFromServer(barcodeValue, this.isFree)

            if (!httpResult.success) {
                //NotificationManager.swal(JSON.stringify(httpResult.error));
                return null
            }
            if (!httpResult.data.РезультатПроверки) {
                NotificationManager.error(httpResult.data.Текст);
                NotificationManager.instance.playError();
                return null
            }
            return this.createScaning(barcodeValue,
                barcodeStruct.Штрихкод,
                httpResult.data.Номенклатура,
                httpResult.data.Характеристика,
                httpResult.data.ПЛУ,
                barcodeStruct.Количество,
                barcodeStruct.ДатаПроизводства,
                barcodeStruct.ГоденДо,
                itPalet);

        }
    }

    createScaning(
        ПолныйШК: string,
        ШтрихкодПродукции: string,
        Номенклатура: IНоменклатура,
        Характеристика: IХарактеристика,
        ПЛУ: string,
        Количество: number,
        ДатаПроизводства: string,
        ГоденДо: string,
        itPalet = false
    ): IScaning | null {

        let Грузоместа = 1;
        let Палетная = "alert alert-info";


        //text = ''

        const Серия: IСерия = {
            Наименование: Date1C(ДатаПроизводства, ГоденДо),
            Ссылка: `${ДатаПроизводства}${ГоденДо}`,
            ДатаПроизводства: ДатаПроизводства,
            ГоденДо: ГоденДо
        };


        if (itPalet) {
            Грузоместа = FindGM(ПолныйШК);
            Палетная = "alert alert-warning";
        }



        const КоличествоВЕдиницахИзмерения = GetCountFromBarcode(
            ПолныйШК,
            Номенклатура,
            Характеристика,
            Грузоместа,
            Количество
        );



        const response: IScaning = {
            IDSec: Date.now(),
            ID: "",
            Номенклатура: Номенклатура,
            Характеристика: Характеристика,
            ПЛУ: ПЛУ,
            Серия: Серия,
            Количество: Количество,
            КоличествоВЕдиницахИзмерения: КоличествоВЕдиницахИзмерения,
            ЕдиницаИзмерения: Номенклатура.ЕдиницаИзмерения.Наименование,
            Артикул: Номенклатура.Артикул,
            Грузоместа: Грузоместа,
            Палетная: Палетная,
            ШтрихкодПродукции: ШтрихкодПродукции,
            bc: ПолныйШК,
            free: this.isFree,
            itPalet: itPalet
        };
        return response;
    }

    /// Проверка валидности сканирования, по типу что бы рядом друг с другом не было идентичных сканирований
    isValidScaning(scaning: IScaning, scanings: IScaning[]) {
        console.log('isValidScaning scanings.length:', scanings.length)
        if (scanings.length > 1) {
            if (scanings[1].bc === scaning.bc) {
                console.log('scanings[1].bc === scaning.bc', scanings[1].bc === scaning.bc, scanings[1].bc, scaning.bc)
                NotificationManager.instance.playRepeatArial();
                return;
            }
        }
        NotificationManager.instance.playGood();
    }



    /// уведомляем пользователя если он случайно отсканировал палетную этикетку
    isWrongPaletScan(scan: IScaning, isPalet: boolean): boolean {
        if (!isPalet && IsBarcodePalet(scan.bc)) {
            const text = `Данное сканирование является сканированием палетной этикетки, но признак стоит что это обычная этикетка`
            //NotificationManager.swal( text );
            NotificationManager.showAlert(text)
            NotificationManager.instance.playError();
        }
        return true;
    }

    /// получаем структуру ШК с сервера
    async getBarcodeDataFromServer(barcodeValue: string, isFree: boolean): Promise<IResponse> {
        let params = {}
        if (isFree) {
            params = {
                "barcode": barcodeValue,
                'free': true
            }

        } else {
            const loadDoc = this.manager.currentDocument.value!;
            params = {
                barcode: barcodeValue,
                Наименование: loadDoc.Наименование,
                Тип: loadDoc.Ссылка.Тип,
                Вид: loadDoc.Ссылка.Вид,
                Ссылка: loadDoc.Ссылка.Ссылка,
            };
        }
        try {
            return await HttpManager.get("/scaning_barcode", params);
        } catch (e) {
            NotificationManager.instance.playError()
            NotificationManager.swal("Продукция не найдена");
            return { success: false, error: "", data: e }
        }

    }
}


