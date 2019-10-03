import { Entity } from 'typeorm';
import { IStoredRequest, AStoredRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStoredPurchaseRequest extends IStoredRequest { }

export class StoredPurchaseRequest extends AStoredRequest implements IStoredPurchaseRequest { }
