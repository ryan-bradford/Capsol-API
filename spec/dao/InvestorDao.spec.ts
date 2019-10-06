import { StorableInvestor, IPersistedInvestor, IStorableInvestor } from '@entities';
import { expect } from 'chai';
import { logger } from '@shared';
import { getDaos, IUserDao } from '@daos';

describe('Investor Dao', () => {

    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    const u1 = new StorableInvestor('Mary', 'test@gmail.com', 'askjnd');

    let id: number = 0;

    before((done) => {
        getDaos().then((daos) => {
            investorDao = new daos.SqlInvestorDao();
            return daos.clearDatabase();
        }).then((result) => {
            done();
        });
    });

    it('should add a user properly', (done) => {
        investorDao.add(u1).then((result) => {
            expect(result.name).to.be.equal('Mary');
            id = result.id;
            done();
        });
    });

    it('should give all users', (done) => {
        investorDao.getAll().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].name).to.be.equal('Mary');
            done();
        });
    });

    it('should give one user', (done) => {
        investorDao.getOne('test@gmail.com').then((result) => {
            expect(result).to.not.be.equal(null);
            expect((result as IPersistedInvestor).name).to.be.equal('Mary');
            done();
        });
    });

    it('should delete one user', (done) => {
        investorDao.delete(id).then(() => {
            done();
        });
    });

    it('should not give a deleted user', (done) => {
        investorDao.getOne('test@gmail.com').then((result) => {
            logger.info(result ? result.name : 'null');
            expect(result).to.be.equal(null);
            done();
        });
    });
});
