import { StorableHomeowner, IStorableHomeowner, IPersistedHomeowner, StorableContract } from '@entities';
import { expect } from 'chai';
import { getDaos, IContractDao, IUserDao } from '@daos';

describe('Contract Dao', () => {

    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let homeowner: IPersistedHomeowner;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            return daos.clearDatabase();
        }).then((result) => {
            return homeownerDao.add(new StorableHomeowner('Austina', 'test@gmail.com', 'skjndf'));
        }).then((newHomeowner) => {
            homeowner = newHomeowner;
            done();
        });
    });

    it('should create a contract', (done) => {
        contractDao.createContract(new StorableContract(1000, 5, 100, homeowner.id)).then((creation) => {
            expect(creation.homeowner.name).to.be.equal('Austina');
            expect(creation.homeowner.contract).to.be.not.equal(undefined);
            expect(creation.investments).to.be.deep.equal([]);
            expect(creation.saleAmount).to.be.equal(1000);
            done();
        });
    });

    it('should give all contracts', (done) => {
        contractDao.getContracts().then((allContracts) => {
            expect(allContracts.length).to.be.equal(1);
            done();
        });
    });

    it('should give all contracts for a user', (done) => {
        expect(homeowner.id).to.be.not.equal(undefined);
        contractDao.getContracts(homeowner.id).then((allContracts) => {
            expect(allContracts.length).to.be.equal(1);
            done();
        });
    });

    it('should give no contracts for a non existent', (done) => {
        expect(homeowner.id).to.be.not.equal(undefined);
        contractDao.getContracts(homeowner.id + 'a').then((allContracts) => {
            expect(allContracts.length).to.be.equal(0);
            done();
        });
    });

    it('should give a single contract', (done) => {
        contractDao.getContracts().then((allContracts) => {
            expect(allContracts.length).to.be.equal(1);
            contractDao.getContract(allContracts[0].id).then((singleContract) => {
                expect(singleContract.homeowner.name).to.be.equal('Austina');
                expect(singleContract.saleAmount).to.be.equal(1000);
                done();
            });
        });
    });

});
