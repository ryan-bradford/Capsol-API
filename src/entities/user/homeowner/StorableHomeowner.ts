import { StorableUser, IStorableUser } from '@entities';

/**
 * The information needed to create a new homeowner.
 */
// tslint:disable-next-line: no-empty-interface
export interface IStorableHomeowner extends IStorableUser { }

export class StorableHomeowner extends StorableUser implements IStorableHomeowner {

}
