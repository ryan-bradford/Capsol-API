import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { StoredHomeownerStat } from 'src/entities/stat/StoredHomeownerStat';
import { StoredInvestorStat } from 'src/entities/stat/StoredInvestorStat';
import { logger } from '@shared';

@injectable()
export default class StatController {


    constructor(@inject('TargetRate') private targetRate: number) { }


    /**
     * Returns the stats that are important to homeowners trying to decide.
     */
    public async getHomeownerStats(req: Request, res: Response) {
        return res.status(OK).send(new StoredHomeownerStat(100, 1000, 10000));
    }


    /**
     * Returns the stats that are important to investors trying to decide.
     */
    public async getInvestorStat(req: Request, res: Response) {
        return res.status(OK).send(new StoredInvestorStat(100, 250000, this.targetRate));
    }
}
