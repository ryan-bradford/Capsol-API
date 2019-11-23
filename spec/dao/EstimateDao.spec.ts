import { IEstimateDao, getDaos } from '@daos';
import { expect } from 'chai';

describe('EstimateDao', () => {
    let estimateDao: IEstimateDao;

    before((done) => {
        getDaos().then((daos) => {
            estimateDao = new daos.EstimateDao();
            done();
        });
    });

    it('should return the price of electricity', (done) => {
        estimateDao.getElectricityPrice('Boston, MA').then((result) => {
            expect(result).to.be.equal(.225);
            done();
        });
    });

    it('should return the panel efficiency', (done) => {
        estimateDao.getPanelEfficiency('Boston, MA').then((result) => {
            expect(result).to.be.equal(3);
            done();
        });
    });

    it('should return the panel pricing', (done) => {
        estimateDao.getPanelPricing(1, 'Boston, MA').then((result) => {
            expect(result).to.be.equal(2750);
            done();
        });
    });

    it('should return the green savings', (done) => {
        estimateDao.getGreenSavings(2000).then((result) => {
            expect(result).to.be.equal(1);
            done();
        });
    });

    it('should return the electricity reduction', (done) => {
        estimateDao.getElectricityReduction(1, 0, 'Boston, MA').then((result) => {
            expect(result).to.be.equal(90);
            done();
        });
    });

});
