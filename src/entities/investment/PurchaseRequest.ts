import { IUser } from '@entities';

export interface IPurchaseRequest {

    amount: number;
    user: IUser;

}
