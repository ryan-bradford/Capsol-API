import { StorableUser, IStorableUser } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStorableInvestor extends IStorableUser { }

export class StorableInvestor extends StorableUser implements IStorableInvestor { }
