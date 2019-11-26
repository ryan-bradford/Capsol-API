import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { StoredHomeownerStat } from '@entities';
import { StoredInvestorStat } from '@entities';
import { StoredInvestor } from '@entities';
import { IStatService } from '../services/stat/StatService';
import { logger } from '@shared';

@injectable()
export default class StatController {


    constructor(
        @inject('TargetRate') private targetRate: number,
        @inject('StatService') private statService: IStatService) { }


    /**
     * Returns the historical performance of the investor portfolio.
     */
    public async getHistoricalPerformance(req: Request, res: Response) {
        const history = await this.statService.getPortfolioHistory();
        let interestRate = 0;
        if (history.length !== 0) {
            interestRate = Math.round(100 * StoredInvestor.getEffectiveInterest(history)) / 100;
        }
        return res.status(200).json({
            portfolioHistory: history,
            interestRate,
        });
    }


    /**
     * Returns the stats that are important to homeowners trying to decide.
     */
    public async getHomeownerStats(req: Request, res: Response) {
        const [contracts, savings, greenSavings] = await Promise.all([
            this.statService.getSolarContracts(),
            this.statService.getTotalSavings(),
            this.statService.getGreenImpact(),
        ]);
        return res.status(OK).json(new StoredHomeownerStat(greenSavings, contracts, savings));
    }


    /**
     * Returns the stats that are important to investors trying to decide.
     */
    public async getInvestorStat(req: Request, res: Response) {
        const [carbonImpact, moneyManaged] = await Promise.all([
            this.statService.getGreenImpact(),
            this.statService.getMoneyManaged(),
        ]);
        return res.status(OK).json(new StoredInvestorStat(carbonImpact, moneyManaged, this.targetRate));
    }
}
