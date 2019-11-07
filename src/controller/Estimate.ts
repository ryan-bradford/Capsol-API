import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IEstimateService } from 'src/services/estimation/EstimateService';
import { ClientError } from 'src/shared/error/ClientError';
import { IContractService } from '@services';
import { StoredHomeownerEstimate } from 'src/entities/estimate/StoredHomeownerEstimate';

@injectable()
export default class EstimateController {


    constructor(
        @inject('EstimateService') private estimateService: IEstimateService,
        @inject('ContractService') private contractService: IContractService) { }


    /**
     * Returns a solar estimation for the given homeowner information.
     */
    public async getHomeownerEstimate(req: Request, res: Response) {
        const { amount, address } = req.body;
        if (amount === undefined || typeof amount !== 'number') {
            throw new ClientError('Must give a number amount in the JSON body');
        }
        if (address === undefined || typeof address !== 'string') {
            throw new ClientError('Must give a number amount in the JSON body');
        }

        const panelSize = await this.estimateService.getPanelSize(amount, address);
        const totalContractCost = await this.estimateService.getPanelPricing(panelSize);
        const electricityReduction = await this.estimateService.getElectricityReduction(panelSize, amount, address);
        const greenSavings = await this.estimateService.getGreenSavings(electricityReduction);
        const electricityPrice = await this.estimateService.getElectricityPrice(address);
        const savings = electricityPrice * electricityReduction;
        const monthlyPayment = await this.contractService.getContractPrice(totalContractCost, 20);
        const toReturn = new StoredHomeownerEstimate(totalContractCost, monthlyPayment, savings, greenSavings);

        return res.status(OK).send(toReturn);
    }

}
