import { IPersistedHomeowner, IPersistedContract, StorableContract, IStorableHomeowner, StorableRequest } from '@entities';
import { IUserDao, IContractDao, ICompanyDao } from '@daos';
import { IRequestService } from '@services';
import { getDateAsNumber } from '@shared';
import { injectable, inject } from 'tsyringe';
import { IRequestDao } from 'src/daos/investment/RequestDao';

/**
 * The actions that are required by the business related to contracts.
 */
export interface IContractService {
    /**
     * Creates a contract for the user represented by the given `userId` for the amount
     * of the given `amount`.
     *
     * If dontSave is true, does not save the contract to the database.
     *
     * @throws Error if the user was not found.
     */
    createContract(amount: number, userId: string, dontSave?: boolean):
        Promise<IPersistedContract>;
    /**
     * Makes a payment for the homeowner with the given `email`.
     * Distributes this payment to all the investors who own investments for this contract.
     * Takes the proper fee for the company based on `ICompanyDao.takeFee()`
     *
     * @throws Error if the user was not found or they do not own a contract.
     *
     * @returns null if the user's contract has been fully paid.
     * @returns a number representing how much the user paid.
     */
    makePayment(email: string): Promise<number | null>;
}

@injectable()
export class ContractService implements IContractService {


    constructor(
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('RequestDao') private requestDao: IRequestDao,
        @inject('CompanyDao') private companyDao: ICompanyDao) { }


    public async createContract(amount: number, userId: string, dontSave?: boolean):
        Promise<IPersistedContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const interestRate = 0.04;
        const lengthInYears = 20;
        const yearlyPayment = amount * (1 / 20 + interestRate);
        const newContract = new StorableContract(amount, lengthInYears * 12, yearlyPayment / 12, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract, dontSave);
        return toReturn;
    }


    public async makePayment(email: string): Promise<number | null> {
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user && user.id) {
            const contracts = await this.contractDao.getContracts(user.id);
            if (contracts.length !== 1) {
                throw new Error('Bad request');
            }
            const contract = contracts[0];
            if (!contract.isFulfilled ||
                (contract.firstPaymentDate !== null
                    && getDateAsNumber() - contract.firstPaymentDate >= contract.totalLength)) {
                return null;
            }
            await Promise.all(contract.investments.map(async (investment) => {
                if (investment.sellDate === null) {
                    const amount = await this.companyDao.takeFee(investment.amount / contract.saleAmount *
                        contract.monthlyPayment);
                    await this.requestDao.createRequest(
                        new StorableRequest(amount, getDateAsNumber(), investment.owner.id, 'purchase'));
                }
            }));
            contract.firstPaymentDate = contract.firstPaymentDate || getDateAsNumber();
            await this.contractDao.saveContract(contract);
            return contract.monthlyPayment;
        } else {
            throw new Error('Not found');
        }
    }
}
