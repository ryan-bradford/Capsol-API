import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable } from 'tsyringe';

@injectable()
export default class EstimateController {


    /**
     * Returns a solar estimation for the given homeowner information.
     */
    public async getHomeownerEstimate(req: Request, res: Response) {
        return res.status(OK).send({
            monthlyPayment: 50,
            billReduction: 100,
        });
    }

}
