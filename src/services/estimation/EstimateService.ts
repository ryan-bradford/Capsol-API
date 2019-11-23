import { injectable, inject } from 'tsyringe';
import {
    StoredSolarInformation, IStoredHomeownerEstimate,
    StoredHomeownerEstimate, IStoredInvestorEstimate, StoredInvestorEstimate,
} from '@entities';
import { IEstimateDao } from 'src/daos/estimate/EstimateDao';

/**
 * `IEstimateService` is a service responsible for giving estimates to users.
 */
export interface IEstimateService {

    /**
     * Returns the estimate for the homeowner installing panels.
     *
     * @param electricityUsage the amount of electricity this home uses a month in kWh.
     * @param address the address the homeowner lives at.
     *
     * @throws Error if the address was invalid.
     */
    getHomeownerEstimate(electricityUsage: number, address: string): Promise<IStoredHomeownerEstimate>;

    /**
     * Returns the estimate if an investor invested the given initial amount.
     */
    getInvestorEstimate(initialAmount: number): Promise<IStoredInvestorEstimate>;


}

@injectable()
export class EstimateService implements IEstimateService {


    constructor(
        @inject('EstimateDao') private estimateDao: IEstimateDao,
        @inject('TargetRate') private targetRate: number) { }


    /**
     * @inheritdoc
     */
    public async getHomeownerEstimate(electricityBill: number, address: string): Promise<IStoredHomeownerEstimate> {
        const electricityUsagePerMonth = await this.getElectricityUsage(address, electricityBill);
        const usagePerDay = electricityUsagePerMonth / 30;
        const toProduce = usagePerDay * 0.9;
        const panelEfficiency = await this.estimateDao.getPanelEfficiency(address);
        const panelSize = new StoredSolarInformation(toProduce / panelEfficiency);
        const totalContractCost = await this.estimateDao.getPanelPricing(panelSize.panelSizeKw, address);
        const electricityReduction = await
            this.estimateDao.getElectricityReduction(panelSize.panelSizeKw, electricityBill, address);
        const greenSavings = 12 * await this.estimateDao.getGreenSavings(electricityReduction);
        const electricityPrice = await this.estimateDao.getElectricityPrice(address);
        const savings = electricityPrice * electricityReduction;
        return new StoredHomeownerEstimate(totalContractCost, panelSize.panelSizeKw, savings, greenSavings, 20);
    }


    /**
     * @inheritdoc
     */
    private async getElectricityUsage(address: string, electricityBill: number): Promise<number> {
        const price = await this.estimateDao.getElectricityPrice(address);
        return electricityBill / price;
    }


    /**
     * @inheritdoc
     */
    public async getInvestorEstimate(initialAmount: number): Promise<IStoredInvestorEstimate> {
        const panelPrice = await this.estimateDao.getPanelPricing(1, 'Boston MA');
        const maxYears = 20;
        let currentValue = initialAmount;
        let currentImpact = 0;
        let fiveYearValue: number = 0;
        let fiveYearCarbonSavings: number = 0;
        let twentyYearValue: number = 0;
        let twentyYearCarbonSavings: number = 0;
        for (let year = 0; year <= maxYears; year++) {
            if (year === 5) {
                fiveYearCarbonSavings = Math.round(currentImpact * 100) / 100;
                fiveYearValue = Math.round(currentValue * 100) / 100;
            } else if (year === 20) {
                twentyYearCarbonSavings = Math.round(currentImpact * 100) / 100;
                twentyYearValue = Math.round(currentValue * 100) / 100;
            }
            currentImpact = currentImpact +
                await this.estimateDao.getElectricityReduction(currentValue / panelPrice, 100000, 'Boston, MA') * 12;
            currentValue = currentValue + currentValue * this.targetRate;
        }

        return new StoredInvestorEstimate(initialAmount, twentyYearValue,
            fiveYearValue, twentyYearCarbonSavings, fiveYearCarbonSavings);
    }

}
