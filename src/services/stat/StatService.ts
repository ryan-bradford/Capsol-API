import { injectable, inject } from 'tsyringe';
import { IContractDao, IInvestmentDao, IEstimateDao } from '@daos';
import { IDateService } from '../DateService';
import { IEstimateService } from '../estimation/EstimateService';
import { IStoredPortfolioHistory, StoredPortfolioHistory, IPersistedContract } from '@entities';

/**
 * `IStatService` is a service responsible for giving stats about the company to users.
 */
export interface IStatService {


    /**
     * Returns the total green impact of the company.
     */
    getGreenImpact(): Promise<number>;

    /**
     * Returns the amount of money managed by the company.
     */
    getMoneyManaged(): Promise<number>;

    /**
     * Returns the history of the performance of the investments.
     */
    getPortfolioHistory(): Promise<IStoredPortfolioHistory[]>;


    /**
     * Returns the total amount of solar contracts managed.
     */
    getSolarContracts(): Promise<number>;


    /**
     * Returns the total amount of money homeowners saved.
     */
    getTotalSavings(): Promise<number>;
}

@injectable()
export class StatService implements IStatService {


    constructor(
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('DateService') private dateService: IDateService,
        @inject('EstimateDao') private estimateDao: IEstimateDao) {

    }


    /**
     * @inheritdoc
     */
    public async getGreenImpact(): Promise<number> {
        const panelPrice = await this.estimateDao.getPanelPricing(1, 'Boston, MA');
        const greenSavingsPerKw = await this.estimateDao.getGreenSavings
            (await this.estimateDao.getElectricityReduction(1, 1000000, 'Boston, MA'));
        const date = await this.dateService.getDateAsNumber();
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        let total = 0;
        allContracts.forEach((contract) => total += (date - (contract.firstPaymentDate as number)) *
            (greenSavingsPerKw * contract.saleAmount / panelPrice));
        return total;
    }


    /**
     * @inheritdoc
     */
    public async getMoneyManaged(): Promise<number> {
        const date = await this.dateService.getDateAsNumber();
        let allInvestments = await this.investmentDao.getInvestments();
        allInvestments = allInvestments.filter((investment) => investment.sellDate === null);
        let total = 0;
        allInvestments.forEach((investment) => total += investment.value(date));
        return total;
    }


    /**
     * @inheritdoc
     */
    public async getPortfolioHistory(): Promise<IStoredPortfolioHistory[]> {
        let contracts = await this.contractDao.getContracts();
        if (contracts.length === 0) {
            return [];
        }
        contracts = contracts.filter((contract) => contract.firstPaymentDate !== null);
        const history: IStoredPortfolioHistory[] = [];
        const currentMonth = await this.dateService.getDateAsNumber();
        const earliestMonth = Math.min(contracts[0].firstPaymentDate as number, currentMonth);
        const lastMonth = Math.min(contracts[contracts.length - 1].totalLength +
            (contracts[contracts.length - 1].firstPaymentDate as number), currentMonth);
        const cash = 1000;
        let value = cash;
        for (let i = earliestMonth; i <= lastMonth; i++) {
            const active = this.getContractsActiveDuring(contracts, i);
            let interest = 0;
            if (active.length !== 0) {
                active.forEach((contract) => interest += contract.monthlyPayment / contract.saleAmount -
                    1 / contract.totalLength);
                interest /= active.length;
            }
            value = value + value * interest;
            history.push(new StoredPortfolioHistory(i, cash, value));
        }
        return history;
    }


    /**
     * @inheritdoc
     */
    public async getSolarContracts(): Promise<number> {
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        return allContracts.length;
    }


    /**
     * @inheritdoc
     */
    public async getTotalSavings(): Promise<number> {
        const panelPrice = await this.estimateDao.getPanelPricing(1, 'Boston, MA');
        const savingsPerKw = await this.estimateDao.getElectricityPrice('Boston, MA') *
            await this.estimateDao.getElectricityReduction(1, 1000000, 'Boston, MA');
        const date = await this.dateService.getDateAsNumber();
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        let total = 0;
        allContracts.forEach((contract) => total += (date - (contract.firstPaymentDate as number)) *
            (savingsPerKw * contract.saleAmount / panelPrice));
        return total;
    }


    /**
     * Returns all contracts that are active during the given month.
     */
    private getContractsActiveDuring(contracts: IPersistedContract[], month: number): IPersistedContract[] {
        return contracts.filter((contract) => contract.firstPaymentDate ?
            contract.firstPaymentDate <= month && contract.firstPaymentDate + contract.totalLength >= month : false);
    }
}
