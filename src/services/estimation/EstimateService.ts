import { injectable } from 'tsyringe';

export interface IEstimateService {

    getPanelSize(electricityBill: number, address: string): Promise<number>;
    getPanelPricing(panelSize: number): Promise<number>;
    getElectricityReduction(panelSize: number, electricityBill: number, address: string): Promise<number>;
    getGreenSavings(electricityReduction: number): Promise<number>;
    getElectricityPrice(address: string): Promise<number>;

}

@injectable()
export class EstimateService implements IEstimateService {


    public async getPanelPricing(numberOfPanels: number): Promise<number> {
        return 100;
    }


    public async getElectricityReduction(panelSize: number, electricityBill: number, address: string): Promise<number> {
        return 100;
    }


    public async getGreenSavings(electricityReduction: number): Promise<number> {
        return 100;
    }


    public async getElectricityPrice(address: string): Promise<number> {
        return 100;
    }


    public async getPanelSize(electricityBill: number, address: string): Promise<number> {
        return 100;
    }

}
