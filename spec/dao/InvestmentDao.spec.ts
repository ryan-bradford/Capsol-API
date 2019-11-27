import { getDaos, IInvestmentDao, IContractDao, IUserDao } from '@daos';
import {
    StorableInvestment,
    StorableInvestor, StorableHomeowner, StorableContract, IPersistedContract,
    IPersistedInvestor, IStorableInvestment, IPersistedHomeowner,
    IStorableHomeowner, IStorableInvestor, IPersistedInvestment,
} from '@entities';
import { expect } from 'chai';


describe('Investment Dao', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let contract: IPersistedContract;
    let investor: IPersistedInvestor;
    let investor2: IPersistedInvestor;
    let storableInvestment: IStorableInvestment;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            investmentDao = new daos.SqlInvestmentDao();
            investorDao = new daos.SqlInvestorDao();
            return daos.clearDatabase();
        }).then((result) => {
            return investorDao.add(new StorableInvestor('Ryan', 'test@gmail.com', 'skjndf'));
        }).then((newInvestor) => {
            investor = newInvestor;
            return investorDao.add(new StorableInvestor('Abbagail', 'a@gmail.com', 'skjndf'));
        }).then((newInvestor) => {
            investor2 = newInvestor;
            return homeownerDao.add(new StorableHomeowner('Hannah', 'blorg@gmail.com', 'asdas'));
        }).then((newHomeowner) => {
            const newContract = new StorableContract(1000, 5, 100, newHomeowner.id);
            return contractDao.createContract(newContract);
        }).then((newContract) => {
            contract = newContract;
            storableInvestment = new StorableInvestment(contract.id, 1000, investor.id);
            done();
        });
    });

    let id: string;
    let investment: IPersistedInvestment;

    it('should add an investment', (done) => {
        investmentDao.createInvestment(storableInvestment, 1).then((result) => {
            expect(result.amount).to.be.equal(1000);
            id = result.id;
            done();
        });
    });


    it('should give the investment back', (done) => {
        investmentDao.getInvestment(id).then((result) => {
            if (result === null) {
                expect(1).to.be.equal(2);
            } else {
                expect(result.amount).to.be.equal(1000);
                expect(result.owner.id).to.be.equal(storableInvestment.ownerId);
                expect(result.id).to.be.equal(id);
                investment = result;
            }
            done();
        });
    });


    it('should give all investments (1)', (done) => {
        investmentDao.getInvestments().then((result) => {
            if (result === null) {
                expect(1).to.be.equal(2);
            } else {
                expect(result.length).to.be.equal(1);
                expect(result[0].amount).to.be.equal(1000);
                expect(result[0].id).to.be.equal(id);
            }
            done();
        });
    });

    it('should save the investment', (done) => {
        investment.amount -= 500;
        investmentDao.saveInvestment(investment).then((result) => {
            done();
        });
    });

    it('should give the investment back', (done) => {
        investmentDao.getInvestment(id).then((result) => {
            if (result === null) {
                expect(1).to.be.equal(2);
            } else {
                expect(result.amount).to.be.equal(500);
                expect(result.owner.id).to.be.equal(storableInvestment.ownerId);
                expect(result.id).to.be.equal(id);
                investment = result;
            }
            done();
        });
    });

    it('should transfer the investment', (done) => {
        investmentDao.transferInvestment(investment.id, investor, investor2, 300, 1).then((result) => {
            done();
        });
    });

    it('should give all investments (2)', (done) => {
        investmentDao.getInvestments().then((result) => {
            if (result === null) {
                expect(1).to.be.equal(2);
            } else {
                expect(result.length).to.be.equal(3);
                expect(result.map((x) => x.amount)).to.contain(200);
                expect(result.map((x) => x.amount)).to.contain(300);
                expect(result.map((x) => x.amount)).to.contain(500);
            }
            done();
        });
    });

    it('should give the original investment back', (done) => {
        investmentDao.getInvestment(id).then((result) => {
            if (result === null) {
                expect(1).to.be.equal(2);
            } else {
                expect(result.amount).to.be.equal(500);
                expect(result.owner.id).to.be.equal(storableInvestment.ownerId);
                expect(result.id).to.be.equal(id);
                expect(result.sellDate).to.be.equal(1);
                investment = result;
            }
            done();
        });
    });

    it('should delete the investment', (done) => {
        investmentDao.deleteInvestment(investment.id).then((result) => {
            done();
        });
    });

    it('should say the original investment doesnt exist anymore', (done) => {
        investmentDao.getInvestment(id).then((result) => {
            if (result !== null) {
                expect(1).to.be.equal(2);
            }
            done();
        });
    });

});
