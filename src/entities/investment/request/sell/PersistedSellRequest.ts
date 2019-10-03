import { Entity } from 'typeorm';
import { IPersistedRequest, APersistedRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IPersistedSellRequest extends IPersistedRequest { }

@Entity('sell_request')
export class PersistedSellRequest extends APersistedRequest implements IPersistedSellRequest { }
