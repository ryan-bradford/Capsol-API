import { injectable, inject } from 'tsyringe';
import { IContractDao, IInvestmentDao } from '@daos';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';
import { IDateService } from '../DateService';

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
        @inject('DateService') private dateService: IDateService) {

    }


    public async getMoneyManaged(): Promise<number> {
        const date = await this.dateService.getDateAsNumber();
        let allInvestments = await this.investmentDao.getInvestments();
        allInvestments = allInvestments.filter((investment) => investment.sellDate === null);
        let total = 0;
        allInvestments.forEach((investment) => total += investment.value(date));
        return Math.round(total / 100) * 100;
    }


    public async getGreenImpact(): Promise<number> {
        return 1000;
    }


    public async getSolarContracts(): Promise<number> {
        let allContracts = await this.contractDao.getContracts();
        allContracts = allContracts.filter((contract) => contract.firstPaymentDate !== null);
        return Math.round(allContracts.length / 10) * 10;
    }


    public async getTotalSavings(): Promise<number> {
        return 1000;
    }
}
