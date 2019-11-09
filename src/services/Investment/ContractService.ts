import { IPersistedHomeowner, IPersistedContract, StorableContract, IStorableHomeowner, StorableRequest } from '@entities';
import { IUserDao, IContractDao, ICompanyDao } from '@daos';
import { injectable, inject } from 'tsyringe';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { ServiceError } from 'src/shared/error/ServiceError';

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
    createContract(amount: number, userId: string):
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
    makePayment(email: string, date: number): Promise<number | null>;

    /**
     * Gives the monthly payment that would result from a contract at the given size and length.
     */
    getContractPrice(amount: number, length: number): Promise<number>;
}

@injectable()
export class ContractService implements IContractService {


    constructor(
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('RequestDao') private requestDao: IRequestDao,
        @inject('CompanyDao') private companyDao: ICompanyDao,
        @inject('TargetRate') private targetRate: number) { }


    /**
     * @inheritdoc
     */
    public async createContract(amount: number, userId: string):
        Promise<IPersistedContract> {
        const homeowner = await this.homeownerDao.getOne(userId);
        if (!homeowner) {
            throw new ServiceError(`Homeowner with ID ${userId} was not found.`);
        }
        const lengthInYears = 20;
        const monthlyPayment = await this.getContractPrice(amount, lengthInYears);
        const newContract = new StorableContract(amount, lengthInYears * 12, monthlyPayment, homeowner.id);
        const toReturn = await this.contractDao.createContract(newContract);
        return toReturn;
    }


    /**
     * @inheritdoc
     */
    public async makePayment(email: string, date: number): Promise<number | null> {
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user && user.id) {
            const contracts = await this.contractDao.getContracts(user.id);
            if (contracts.length !== 1) {
                throw new ServiceError(`User with ID ${user.id} does not own a contract.`);
            }
            const contract = contracts[0];
            if (!contract.isFulfilled() ||
                (contract.firstPaymentDate !== null
                    && date - contract.firstPaymentDate >= contract.totalLength)) {
                return null;
            }
            await Promise.all(contract.investments.map(async (investment) => {
                if (!investment.sellDate) {
                    const amount = await this.companyDao.takeFee(investment.amount / contract.saleAmount *
                        contract.monthlyPayment);
                    await this.requestDao.createRequest(
                        new StorableRequest(amount, date, investment.owner.id, 'purchase'));
                }
            }));
            contract.firstPaymentDate = contract.firstPaymentDate || date;
            await this.contractDao.saveContract(contract);
            return contract.monthlyPayment;
        } else {
            throw new ServiceError(`User with email ${email} was not found.`);
        }
    }


    /**
     * @inheritdoc
     */
    public async getContractPrice(amount: number, length: number):
        Promise<number> {
        const interestRate = this.targetRate;
        const yearlyPayment = amount * (1 / 20 + interestRate);
        return Math.round(100 * yearlyPayment / 12) / 100;
    }
}
