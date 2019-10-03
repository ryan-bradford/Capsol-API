import { Entity } from 'typeorm';
import { AStorableRequest, IStorableRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStorablePurchaseRequest extends IStorableRequest { }

export class StorablePurchaseRequest extends AStorableRequest implements IStorablePurchaseRequest { }
