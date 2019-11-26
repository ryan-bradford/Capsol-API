import { injectable } from 'tsyringe';
import { StoredSolarInformation, IStoredSolarInformation } from '@entities';

/**
 * `IEstimateDao` is a service responsible for giving estimates to users.
 */
export interface IEstimateDao {
    /**
     * Gives the price at the given address in $/kWh.
     *
     * @throws Error if the address was invalid.
     */
    getElectricityPrice(address: string): Promise<number>;

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
     * Returns how many kWh 1 kw of panels would produce per day.
     *
     * @throws Error if the address was invalid.
     */
    getPanelEfficiency(address: string): Promise<number>;
    /**
     * Returns how much the panels would cost to install.
     *
     * @param panelSize the size of the installation in kW.
     */
    getPanelPricing(panelSize: number, address: string): Promise<number>;
}

@injectable()
export class EstimateDao implements IEstimateDao {


    /**
     * @inheritdoc
     */
    public async getElectricityPrice(address: string): Promise<number> {
        return .225;
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
     * Returns how much kWh of energy 1 kW of solar would produce per day at the given address.
     */
    public async getPanelEfficiency(address: string): Promise<number> {
        return 3;
    }


    /**
     * @inheritdoc
     */
    public async getPanelPricing(panelSize: number, address: string): Promise<number> {
        // 1 kW costs 2750
        return panelSize * 2750;
    }

}
