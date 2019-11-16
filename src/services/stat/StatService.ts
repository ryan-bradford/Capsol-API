import { injectable, inject } from 'tsyringe';
import { IContractDao, IInvestmentDao } from '@daos';
import { IDateService } from '../DateService';
import { IEstimateService } from '../estimation/EstimateService';

export interface IStatService {

    /**
     * Returns the amount of money managed by the company.
     */
    getMoneyManaged(): Promise<number>;


    /**
     * Returns the total green impact of the company.
     */
    getGreenImpact(): Promise<number>;


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
        @inject('EstimateService') private estimateService: IEstimateService) {

    }


    public async getMoneyManaged(): Promise<number> {
        const date = await this.dateService.getDateAsNumber();
        let allInvestments = await this.investmentDao.getInvestments();
        allInvestments = allInvestments.filter((investment) => investment.sellDate === null);
        let total = 0;
        allInvestments.forEach((investment) => total += investment.value(date));
        return total;
    }


    public async getGreenImpact(): Promise<number> {
        const panelPrice = await this.estimateService.getPanelPricing(1, 'Boston, MA');
        const greenSavingsPerKw = await this.estimateService.getGreenSavings
            (await this.estimateService.getElectricityReduction(1, 1000000, 'Boston, MA'));
        const date = await this.dateService.getDateAsNumber();
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        let total = 0;
        allContracts.forEach((contract) => total += (date - (contract.firstPaymentDate as number)) *
            (greenSavingsPerKw * contract.saleAmount / panelPrice));
        return total;
    }


    public async getSolarContracts(): Promise<number> {
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        return allContracts.length;
    }


    public async getTotalSavings(): Promise<number> {
        const panelPrice = await this.estimateService.getPanelPricing(1, 'Boston, MA');
        const savingsPerKw = await this.estimateService.getElectricityPrice('Boston, MA') *
            await this.estimateService.getElectricityReduction(1, 1000000, 'Boston, MA');
        const date = await this.dateService.getDateAsNumber();
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        let total = 0;
        allContracts.forEach((contract) => total += (date - (contract.firstPaymentDate as number)) *
            (savingsPerKw * contract.saleAmount / panelPrice));
        return total;
    }
}
