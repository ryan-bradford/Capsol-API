import { getDaos, IInvestmentDao, IContractDao, IUserDao } from '@daos';
import {
    StorableInvestment, PersistedContract, PersistedInvestor,
    StorableInvestor, StorableHomeowner, StorableContract, IPersistedContract,
    IPersistedInvestor, IStorableInvestment, IPersistedHomeowner, IStorableHomeowner, IStorableInvestor,
} from '@entities';
import { expect } from 'chai';


describe('Investment Dao', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let contract: IPersistedContract;
    let investor: IPersistedInvestor;
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
            return homeownerDao.add(new StorableHomeowner('Hannah', 'blorg@gmail.com', 'asdas'));
        }).then((newHomeowner) => {
            const newContract = new StorableContract(1000, 5, 100, newHomeowner.id);
            return contractDao.createContract(newContract);
        }).then((newContract) => {
            contract = newContract;
            storableInvestment = new StorableInvestment(contract.id, 1, investor.id);
            done();
        });
    });

    it('should add an investment', (done) => {
        investmentDao.createInvestment(storableInvestment).then((result) => {
            expect(result.percentage).to.be.equal(1);
            done();
        });
    });
});
