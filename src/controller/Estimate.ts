import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IEstimateService } from '../services/estimation/EstimateService';
import { ClientError } from '../shared/error/ClientError';
import { IContractService } from '@services';
import { StoredHomeownerEstimate } from '@entities';
import { logger } from '@shared';
import { StoredInvestorEstimate } from '@entities';
import { add } from 'winston';

@injectable()
export default class EstimateController {


    constructor(
        @inject('EstimateService') private estimateService: IEstimateService,
        @inject('ContractService') private contractService: IContractService) { }


    /**
     * Returns a solar estimation for the given homeowner information.
     */
    public async getHomeownerEstimate(req: Request, res: Response) {
        const address = req.query.address;
        const amount = Number(req.query.amount);
        if (amount === undefined || typeof amount !== 'number' || isNaN(amount)) {
            throw new ClientError('Must give a number amount in the JSON body');
        }
        if (address === undefined || typeof address !== 'string') {
            throw new ClientError('Must give a number amount in the JSON body');
        }

        const homeownerEstimate = await this.estimateService.getHomeownerEstimate(amount, address);
        const monthlyPayment = await this.contractService.getContractPrice(homeownerEstimate.contractSize, 20);
        homeownerEstimate.monthlyPayment = monthlyPayment;
        return res.status(OK).json(homeownerEstimate);
    }


    /**
     * Returns an investment estimate for an investor given some base amount.
     */
    public async getInvestorEstimate(req: Request, res: Response) {
        const baseValue = Number(req.query.amount);
        if (baseValue === undefined || typeof baseValue !== 'number' || isNaN(baseValue)) {
            throw new ClientError('Must give a number amount in the JSON body');
        }
        const estimate = await this.estimateService.getInvestorEstimate(baseValue);
        return res.status(OK).json(estimate);
    }

}
