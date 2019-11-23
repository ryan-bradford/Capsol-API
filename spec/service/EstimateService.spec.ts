import { EstimateService, IEstimateService } from 'src/services/estimation/EstimateService';
import { IEstimateDao } from '@daos';
import { expect } from 'chai';
import { StoredHomeownerEstimate, StoredInvestorEstimate } from '@entities';

describe('Estimate Service', () => {

    let service: IEstimateService;

    before((done) => {
        service = new EstimateService(new MockEstimateDao(), 0.02);
        done();
    });

    it('should give a proper estimate for a homeowner', (done) => {
        service.getHomeownerEstimate(100, 'Boston, MA').then((result) => {
            expect(result).to.be.deep.equal(new StoredHomeownerEstimate(1000, 15, 2, 120, 20));
            done();
        });
    });

    it('should give a proper estimate for an investor', (done) => {
        service.getInvestorEstimate(100).then((result) => {
            expect(result).to.be.deep.equal(new StoredInvestorEstimate(100, 148.59, 110.41, 120 * 20, 120 * 5));
            done();
        });
    });

});

class MockEstimateDao implements IEstimateDao {


    public async getElectricityReduction(panelSize: number, electricityBill: number, address: string): Promise<number> {
        return 10;
    }


    public async getGreenSavings(electricityReduction: number): Promise<number> {
        return 10;
    }


    public async getPanelPricing(panelSize: number, address: string): Promise<number> {
        return 1000;
    }


    public async getElectricityPrice(address: string): Promise<number> {
        return .2;
    }


    public async getPanelEfficiency(address: string): Promise<number> {
        return 1;
    }
}
