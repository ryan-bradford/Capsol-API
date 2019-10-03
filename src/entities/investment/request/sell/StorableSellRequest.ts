import { Entity } from 'typeorm';
import { AStorableRequest, IStorableRequest } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStorableSellRequest extends IStorableRequest { }

export class StorableSellRequest extends AStorableRequest implements IStorableSellRequest { }
