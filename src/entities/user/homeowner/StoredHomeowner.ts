import { IStoredUser, IStoredContract, StoredUser, IStoredRequest } from '@entities';

/**
 * The information that should be made public about a homeowner.
 */
export interface IStoredHomeowner extends IStoredUser {
    /**
     * The contract that this homeowner owns.
     * Undefined if this homeowner has not signed up yet.
     */
    contract?: IStoredContract;
}

export class StoredHomeowner extends StoredUser implements IStoredHomeowner {

    public contract?: IStoredContract;


    constructor(id: string, name: string, email: string, pwdHash: string,
        // tslint:disable-next-line: align
        contract?: IStoredContract) {
        super(id, name, email, pwdHash);
        this.contract = contract;
    }

}
