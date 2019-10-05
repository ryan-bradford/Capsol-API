import { clearDatabase, SqlInvestorDao } from '@daos';
import { StorableInvestor, IPersistedInvestor } from '@entities';
import { expect } from 'chai';

describe('Investor Dao', () => {

    const investorDao = new SqlInvestorDao();
    const u1 = new StorableInvestor('Ryan', 'test@gmail.com', 'askjnd');

    let id: number = 0;

    before((done) => {
        clearDatabase().then((result) => {
            done();
        });
    });

    it('should add a user properly', (done) => {
        investorDao.add(u1).then((result) => {
            expect(result.name).to.be.equal('Ryan');
            id = result.id;
            done();
        });
    });

    it('should give all users', (done) => {
        investorDao.getAll().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].name).to.be.equal('Ryan');
            done();
        });
    });

    it('should give one user', (done) => {
        investorDao.getOne('test@gmail.com').then((result) => {
            expect(result).to.not.be.equal(null);
            expect((result as IPersistedInvestor).name).to.be.equal('Ryan');
            done();
        });
    });

    it('should delete one user', (done) => {
        investorDao.delete(id).then((result) => {
            done();
        });
    });

    it('should not give a deleted user', (done) => {
        investorDao.getOne('test@gmail.com').then((result) => {
            expect(result).to.be.equal(null);
            done();
        });
    });
});
