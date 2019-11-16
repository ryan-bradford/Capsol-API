import { injectable } from 'tsyringe';
import { StoredSolarInformation, IStoredSolarInformation } from '@entities';
import { logger } from '@shared';

export interface IEstimateService {

    /**
     * Returns the optimal panel size on the given persons roof.
     *
     * @param electricityUsage the amount of electricity this home uses a month in kWh.
     *
     * @throws Error if the address was invalid.
     */
    getPanelSize(electricityUsage: number, address: string): Promise<IStoredSolarInformation>;
    /**
     * Returns the amount of electricity these panels will reduce consumption by in kWh per month.
     *
     * @param electricityBill the amount of electricity this homeowner uses per given month in dollars.
     * @param panelSize the size of the installation in Kw.
     *
     * @throws Error if the address was invalid.
     */
    getElectricityReduction(panelSize: number, electricityBill: number, address: string): Promise<number>;
    /**
     * Returns how much carbon these panels will save per month in tons.
     *
     * @param electricityUsage the amount of electricity these panels will reduce per given month in kWh.
     */
    getGreenSavings(electricityReduction: number): Promise<number>;
    /**
     * Returns how much the panels would cost to install.
     *
     * @param panelSize the size of the installation in kW.
     */
    getPanelPricing(panelSize: number, address: string): Promise<number>;
    /**
     * Gives the price at the given address in $/kWh.
     *
     * @throws Error if the address was invalid.
     */
    getElectricityPrice(address: string): Promise<number>;
    /**
     * Gives the amount of kWh of electricity this home uses a month.
     *
     * @param electricityBill the monthly bill of this home in $.
     *
     * @throws Error if the address was invalid.
     */
    getElectricityUsage(address: string, electricityBill: number): Promise<number>;

}

@injectable()
export class EstimateService implements IEstimateService {


    /**
     * @inheritdoc
     */
    public async getPanelPricing(panelSize: number, address: string): Promise<number> {
        // 1 kW costs 2750
        return panelSize * 2750;
    }


    /**
     * @inheritdoc
     */
    public async getElectricityReduction(
        panelSize: number, electricityBill: number, address: string): Promise<number> {
        // 8 hours of sunlight a day
        // 30 days in a month
        return panelSize * 30 * await this.getPanelEfficiency(address);
    }


    /**
     * @inheritdoc
     */
    public async getGreenSavings(electricityReduction: number): Promise<number> {
        // 1 kWh = 1 pound of carbon
        // 2000 pounds = 1 ton
        return electricityReduction / 2000;
    }


    /**
     * @inheritdoc
     */
    public async getElectricityPrice(address: string): Promise<number> {
        return .225;
    }


    /**
     * @inheritdoc
     */
    public async getPanelSize(electricityBill: number, address: string): Promise<StoredSolarInformation> {
        const electricityUsagePerMonth = await this.getElectricityUsage(address, electricityBill);
        const usagePerDay = electricityUsagePerMonth / 30;
        const toProduce = usagePerDay * 0.9;
        const panelEfficiency = await this.getPanelEfficiency(address);
        return new StoredSolarInformation(toProduce / panelEfficiency);
    }


    /**
     * @inheritdoc
     */
    public async getElectricityUsage(address: string, electricityBill: number): Promise<number> {
        const price = await this.getElectricityPrice(address);
        return electricityBill / price;
    }


    /**
     * Returns how much kWh of energy 1 kW of solar would produce per day at the given address.
     */
    private async getPanelEfficiency(address: string) {
        return 3;
    }

}
