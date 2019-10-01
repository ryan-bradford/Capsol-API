import { IUser, User, IInvestment, Investment, SellRequest, ISellRequest } from '@entities';
import { Entity, OneToMany } from 'typeorm';

export interface IInvestor extends IUser {
    investments: IInvestment[];
    sellRequests: ISellRequest[];
}

@Entity()
export class Investor extends User implements IInvestor {

    @OneToMany((type) => Investment, (investment) => investment.owner)
    public investments!: IInvestment[];

    @OneToMany((type) => SellRequest, (request) => request.user)
    public sellRequests!: ISellRequest[];

}
