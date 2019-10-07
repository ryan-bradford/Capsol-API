import { getDaos, IInvestmentDao, IContractDao, IUserDao } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, IPersistedInvestor,
    IStorableInvestor, IPersistedContract, StorableInvestor,
    StorableHomeowner, StorableContract, IStorablePurchaseRequest,
    IPersistedPurchaseRequest, IPersistedSellRequest, IStorableSellRequest, StorablePurchaseRequest,
    StorableSellRequest,
} from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { expect } from 'chai';

describe('Request Dao', () => {

    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let investor: IPersistedInvestor;
    let purchaseRequestDao: IRequestDao<IPersistedPurchaseRequest, IStorablePurchaseRequest>;
    let sellRequestDao: IRequestDao<IPersistedSellRequest, IStorableSellRequest>;
    let storablePurchaseRequest: IStorablePurchaseRequest;
    let storableSellRequest: IStorableSellRequest;
    let purchaseId: number;
    let sellId: number;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            investorDao = new daos.SqlInvestorDao();
            purchaseRequestDao = new daos.SqlPurchaseRequestDao();
            sellRequestDao = new daos.SqlPurchaseRequestDao();
            return daos.clearDatabase();
        }).then(() => {
            return investorDao.add(new StorableInvestor('Ryan', 'test@gmail.com', 'skjndf'));
        }).then((newInvestor) => {
            investor = newInvestor;
            return homeownerDao.add(new StorableHomeowner('Hannah', 'blorg@gmail.com', 'asdas'));
        }).then((newHomeowner) => {
            const newContract = new StorableContract(1000, 5, 100, newHomeowner.id);
            return contractDao.createContract(newContract);
        }).then((newContract) => {
            storablePurchaseRequest = new StorablePurchaseRequest(100, new Date(), investor.id);
            storableSellRequest = new StorableSellRequest(100, new Date(), investor.id);
            done();
        });
    });

    it('should add a request', (done) => {
        purchaseRequestDao.createRequest(storablePurchaseRequest).then((result) => {
            expect(result.amount).to.be.equal(100);
            purchaseId = result.id;
            return sellRequestDao.createRequest(storableSellRequest);
        }).then((result) => {
            expect(result.amount).to.be.equal(100);
            sellId = result.id;
            done();
        });
    });

    it('should give all requests', (done) => {
        purchaseRequestDao.getRequests().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].amount).to.be.equal(100);
            return sellRequestDao.getRequests();
        }).then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].amount).to.be.equal(100);
            done();
        });
    });

    it('should delete one request', (done) => {
        purchaseRequestDao.deleteRequest(purchaseId).then((result) => {
            return sellRequestDao.deleteRequest(sellId);
        }).then((result) => {
            done();
        });
    });

    it('should give all requests', (done) => {
        purchaseRequestDao.getRequests().then((result) => {
            expect(result.length).to.be.equal(0);
            return sellRequestDao.getRequests();
        }).then((result) => {
            expect(result.length).to.be.equal(0);
            done();
        });
    });
});
