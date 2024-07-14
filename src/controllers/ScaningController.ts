import { BaseManager } from "@/classes/BaseManager";
import { DBManager } from "@/classes/DBManager";
import { HttpManager, IResponse } from "@/classes/HttpManager";
import { MainManager } from "@/classes/MainManager";
import { NotificationManager } from "@/classes/NotificationManager";
import { Date1C } from "@/functions/Date1C";
import { FindGM } from "@/functions/FindGruzoMesta";
import { GetCountFromBarcode } from "@/functions/GetCountFromBarcode";
import { IProperty, IНоменклатура, IХарактеристика } from "@/interfaces/IDocument";
import { IScaning } from "@/interfaces/IScaning";
import { GettingManager } from "@/managers/getting/GettingManager";
import { ShipmentManager } from "@/managers/shipment/ShipmentManager";
import { UserManager } from "@/managers/user/UserManager";


interface IBarcodeStructure {
    Штрихкод: string
    Количество: number
    ДатаПроизводства: string
    ГоденДо: string
}

export class ScaningController {
    constructor(manager: ShipmentManager | GettingManager, isFree = false) {
        
        this.isFree = isFree
        this.manager = manager
    }

    /// параметр отвечающий за привязку к документу
    public isFree = false
    public manager: ShipmentManager | GettingManager


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
    async getScaning(barcode: string, itPalet = false): Promise<IScaning | null> {
        const barcodeValue = barcode;
        const barcodeStruct: IBarcodeStructure = this.getBarcodeStructure(barcode)




        if (UserManager.instance.useLocalDb.value) {
            const barcodeFromDB = await DBManager.getFileAsync(
                barcodeStruct.Штрихкод,
                MainManager.keys.barcodes,
                MainManager.keys.barcodes
            );
            if (!barcodeFromDB) {
                return null
            }
            return this.createScaning(
                barcodeValue,
                barcodeStruct.Штрихкод,
                barcodeFromDB.data.Номенклатура,
                barcodeFromDB.data.Характеристика,
                barcodeFromDB.data.ПЛУ,
                barcodeStruct.Количество,
                barcodeStruct.ДатаПроизводства,
                barcodeStruct.ГоденДо,
                itPalet
            );
        } else {

            const httpResult = await this.getBarcodeDataFromServer(barcodeValue, this.isFree)

            if (!httpResult.success) {
                NotificationManager.swal(JSON.stringify(httpResult.error));
                return null
            }
            // if (httpResult.data.РезультатПроверки) {
            //     NotificationManager.swal(httpResult.data.Текст);
            //     NotificationManager.instance.playError();
            //     return null

            // }
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

        const Серия: IProperty = {
            Наименование: Date1C(ДатаПроизводства, ГоденДо),
            Ссылка: `${ДатаПроизводства}${ГоденДо}`,
        };

        if (itPalet == true) {
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
        };
        return response;
    }

    /// Проверка валидности сканирования, по типу что бы рядом друг с другом не было идентичных сканирований
    isValidScaning(scaning: IScaning, scanings: IScaning[]) {
        if (scanings.length > 1) {
            if (scanings[1].bc === scaning.bc) {
                NotificationManager.instance.playRepeatArial();
                return;
            }
        }
        NotificationManager.instance.playGood();
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

        return await HttpManager.get("/scaning_barcode", params);
    }
}


