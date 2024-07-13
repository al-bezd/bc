import { IDocument } from "@/interfaces/IDocument";
import { IScaning } from "@/interfaces/IScaning";

export interface IShipmentDocumentProductsItem extends IScaning {

}

export interface IShipmentDocument extends IDocument{
    рсТоварыДляЛимитов:IShipmentDocumentProductsItem[]
    РезультатПроверки:boolean
    completed:boolean
    ШК:string
    Товары:IShipmentDocumentProductsItem[]
}