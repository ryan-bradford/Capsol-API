import { IContract, Contract, Homeowner } from '@entities';

export interface IContractService {
    createContract(amount: number, interestRate: number, years: number, userId: number): Promise<IContract>;
    getContracts(userId?: number): Promise<IContract[]>;
    getContract(id: number): Promise<IContract>;
}

export class ContractService implements IContractService {


    public async getContract(id: number): Promise<IContract> {
        return Contract.findOne(id).then((contract) => {
            if (!contract) {
                throw new Error('not found');
            }
            return contract;
        });
    }


    public async getContracts(userId?: number): Promise<IContract[]> {
        return Contract.find().then((contracts) =>
            contracts.filter((contract) => !userId || contract.homeowner.id === userId));
    }


    public async createContract(amount: number, interestRate: number, years: number, userId: number):
        Promise<IContract> {
        const homeowner = await Homeowner.findOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        return new Contract(amount, years, amount * interestRate, homeowner, undefined);
    }

}
