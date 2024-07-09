import { IDocument } from "@/interfaces/IDocument";

export interface IShipmentDocumentProductsItem {

}

export interface IShipmentDocument extends IDocument{
    рсТоварыДляЛимитов:IShipmentDocumentProductsItem[]
    РезультатПроверки:boolean
    completed:boolean
    ШК:string
}