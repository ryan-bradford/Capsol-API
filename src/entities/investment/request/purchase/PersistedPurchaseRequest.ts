import { Entity } from 'typeorm';
import { IPersistedRequest, APersistedRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IPersistedPurchaseRequest extends IPersistedRequest { }

@Entity('purchase_request')
export class PersistedPurchaseRequest extends APersistedRequest implements IPersistedPurchaseRequest { }
