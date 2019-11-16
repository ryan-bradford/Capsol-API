import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { StoredHomeownerStat } from '@entities';
import { StoredInvestorStat } from '@entities';
import { IContractDao } from '@daos';
import { IStoredPortfolioHistory, IPersistedContract, StoredPortfolioHistory, StoredInvestor } from '@entities';
import { IDateService } from '../services/DateService';
import { IStatService } from '../services/stat/StatService';

@injectable()
export default class StatController {


    constructor(
        @inject('TargetRate') private targetRate: number,
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('DateService') private dateService: IDateService,
        @inject('StatService') private statService: IStatService) { }


    /**
     * Returns the stats that are important to homeowners trying to decide.
     */
    public async getHomeownerStats(req: Request, res: Response) {
        const [contracts, savings, greenSavings] = await Promise.all([
            this.statService.getSolarContracts(),
            this.statService.getTotalSavings(),
            this.statService.getGreenImpact(),
        ]);
        return res.status(OK).send(new StoredHomeownerStat(greenSavings, contracts, savings));
    }


    /**
     * Returns the stats that are important to investors trying to decide.
     */
    public async getInvestorStat(req: Request, res: Response) {
        const [carbonImpact, moneyManaged] = await Promise.all([
            this.statService.getGreenImpact(),
            this.statService.getMoneyManaged(),
        ]);
        return res.status(OK).send(new StoredInvestorStat(carbonImpact, moneyManaged, this.targetRate));
    }


    /**
     * Returns the historical performance of the investor portfolio.
     */
    // TODO: move logic to service
    public async getHistoricalPerformance(req: Request, res: Response) {
        let contracts = await this.contractDao.getContracts();
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
        const effectiveInterest = Math.round(100 * StoredInvestor.getEffectiveInterest(history)) / 100;
        res.status(200).send({
            portfolioHistory: history,
            interestRate: effectiveInterest,
        });
    }


    private getContractsActiveDuring(contracts: IPersistedContract[], month: number): IPersistedContract[] {
        return contracts.filter((contract) => contract.firstPaymentDate ?
            contract.firstPaymentDate <= month && contract.firstPaymentDate + contract.totalLength >= month : false);
    }
}
