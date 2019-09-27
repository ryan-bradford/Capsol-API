import { IContract, Contract, Homeowner } from '@entities';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, userId: number): Promise<IContract>;
}

export class ContractService implements IContractService {


    public async createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IContract> {
        const homeowner = await Homeowner.findOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        return new Contract(amount, years, amount * interestRate, homeowner);
    }

}
