import { StorableUser, IStorableUser } from '@entities';

/**
 * The information needed to create a new investor.
 */
// tslint:disable-next-line: no-empty-interface
export interface IStorableInvestor extends IStorableUser { }

export class StorableInvestor extends StorableUser implements IStorableInvestor { }
