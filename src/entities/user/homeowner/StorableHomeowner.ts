import { StorableUser, IStorableUser } from '@entities';

// tslint:disable-next-line: no-empty-interface
export interface IStorableHomeowner extends IStorableUser { }

export class StorableHomeowner extends StorableUser implements IStorableHomeowner {

}
