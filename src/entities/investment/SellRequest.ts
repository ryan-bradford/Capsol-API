import { IInvestment } from './Investment';
import { IUser } from '@entities';

/**
 * Represents that the given user would like to sell the listed investments.
 */
export interface ISellRequest {

    userId: IUser;
    investments: IInvestment[];

}
