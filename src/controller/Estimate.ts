import { Request, Response } from 'express';
import { OK } from 'http-status-codes';
import { injectable, inject } from 'tsyringe';
import { IEstimateService } from '../services/estimation/EstimateService';
import { ClientError } from '../shared/error/ClientError';
import { IContractService } from '@services';
import { StoredHomeownerEstimate } from '@entities';
import { logger } from '@shared';
import { StoredInvestorEstimate } from '@entities';

@injectable()
export default class EstimateController {


    constructor(
        @inject('EstimateService') private estimateService: IEstimateService,
        @inject('ContractService') private contractService: IContractService,
        @inject('TargetRate') private targetRate: number) { }


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

        const panelSize = await this.estimateService.getPanelSize(amount, address);
        const totalContractCost = await this.estimateService.getPanelPricing(panelSize.panelSizeKw, address);
        const electricityReduction = await
            this.estimateService.getElectricityReduction(panelSize.panelSizeKw, amount, address);
        logger.info(String(electricityReduction));
        const greenSavings = 12 * await this.estimateService.getGreenSavings(electricityReduction);
        const electricityPrice = await this.estimateService.getElectricityPrice(address);
        const savings = electricityPrice * electricityReduction;
        const monthlyPayment = await this.contractService.getContractPrice(totalContractCost, 20);
        const toReturn = new StoredHomeownerEstimate(totalContractCost, monthlyPayment,
            panelSize.panelSizeKw, savings, greenSavings, 20);

        return res.status(OK).send(toReturn);
    }


    /**
     * Returns an investment estimate for an investor given some base amount.
     */
    public async getInvestorEstimate(req: Request, res: Response) {
        const baseValue = Number(req.query.amount);
        if (baseValue === undefined || typeof baseValue !== 'number' || isNaN(baseValue)) {
            throw new ClientError('Must give a number amount in the JSON body');
        }
        const panelPrice = await this.estimateService.getPanelPricing(1, 'Boston MA');
        const maxYears = 20;
        let currentValue = baseValue;
        let currentImpact = 0;
        let fiveYearValue: number = 0;
        let fiveYearCarbonSavings: number = 0;
        let twentyYearValue: number = 0;
        let twentyYearCarbonSavings: number = 0;
        for (let year = 1; year <= maxYears; year++) {
            if (year === 5) {
                fiveYearCarbonSavings = Math.round(currentImpact * 100) / 100;
                fiveYearValue = Math.round(currentValue * 100) / 100;
            } else if (year === 20) {
                twentyYearCarbonSavings = Math.round(currentImpact * 100) / 100;
                twentyYearValue = Math.round(currentValue * 100) / 100;
            }
            currentImpact = await this.estimateService.getElectricityReduction(currentValue / panelPrice, 100000, 'Boston, MA') * 12;
            currentValue = currentValue + currentValue * this.targetRate;
        }

        const toReturn = new StoredInvestorEstimate(baseValue, twentyYearValue,
            fiveYearValue, twentyYearCarbonSavings, fiveYearCarbonSavings);
        return res.status(OK).send(toReturn);
    }

}
