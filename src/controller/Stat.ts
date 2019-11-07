import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable } from 'tsyringe';

@injectable()
export default class StatController {


    /**
     * Returns the stats that are important to homeowners trying to decide.
     */
    public async getHomeownerStats(req: Request, res: Response) {
        return res.status(OK).send({
            carbon: 100,
            totalSavings: 100000,
            totalContracts: 1000,
        });
    }

}
