import { IDocument, ILinkedObject } from "./IDocument";

export interface IStore extends IDocument{
    
}

export interface IТара {
    Вес: number;
    ВесШт: number;
    ИД: string;
    Количество: number;
    Тара: ILinkedObject;
  }