import { Entity } from 'typeorm';
import { IStoredRequest, AStoredRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStoredSellRequest extends IStoredRequest { }

export class StoredSellRequest extends AStoredRequest implements IStoredSellRequest { }
