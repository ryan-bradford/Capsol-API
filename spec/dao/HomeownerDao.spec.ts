import { StorableHomeowner, IPersistedHomeowner, IStorableHomeowner } from '@entities';
import { expect } from 'chai';
import { logger } from '@shared';
import { getDaos, IUserDao } from '@daos';

describe('Homeowner Dao', () => {

    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    const u1 = new StorableHomeowner('Ryan', 'test@gmail.com', 'askjnd');

    let id: string = '';

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            return daos.clearDatabase();
        }).then((result) => {
            done();
        });
    });

    it('should add a user properly', (done) => {
        homeownerDao.add(u1).then((result) => {
            expect(result.name).to.be.equal('Ryan');
            id = result.id;
            done();
        });
    });

    it('should give all users', (done) => {
        homeownerDao.getAll().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].name).to.be.equal('Ryan');
            done();
        });
    });

    it('should give one user', (done) => {
        homeownerDao.getOneByEmail('test@gmail.com').then((result) => {
            expect(result).to.not.be.equal(null);
            expect((result as IPersistedHomeowner).name).to.be.equal('Ryan');
            done();
        });
    });

    it('should delete one user', (done) => {
        homeownerDao.delete(id).then((result) => {
            done();
        });
    });

    it('should not give a deleted user', (done) => {
        homeownerDao.getOneByEmail('test@gmail.com').then((result) => {
            expect(result).to.be.equal(null);
            done();
        });
    });
});
