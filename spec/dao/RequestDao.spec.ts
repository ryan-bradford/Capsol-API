import { getDaos, IInvestmentDao, IContractDao, IUserDao } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, IPersistedInvestor,
    IStorableInvestor, IPersistedContract, StorableInvestor,
    StorableHomeowner, StorableContract, IPersistedRequest, IStorableRequest, StorableRequest,
} from '@entities';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { expect } from 'chai';
import { logger } from '@shared';

describe('Request Dao', () => {

    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let investor: IPersistedInvestor;
    let requestDao: IRequestDao;
    let storablePurchaseRequest: IStorableRequest;
    let storableSellRequest: IStorableRequest;
    let purchaseId: string;
    let sellId: string;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            investorDao = new daos.SqlInvestorDao();
            requestDao = new daos.SqlRequestDao();
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
            storablePurchaseRequest = new StorableRequest(100, 1, investor.id, 'purchase');
            storableSellRequest = new StorableRequest(100, 1, investor.id, 'sell');
            done();
        });
    });

    it('should add a request', (done) => {
        requestDao.createRequest(storablePurchaseRequest).then((result) => {
            expect(result.amount).to.be.equal(100);
            purchaseId = result.id;
            return requestDao.createRequest(storableSellRequest);
        }).then((result) => {
            expect(result.amount).to.be.equal(100);
            sellId = result.id;
            done();
        });
    });

    it('should give all requests', (done) => {
        requestDao.getRequests().then((result) => {
            expect(result.length).to.be.equal(2);
            expect(result[0].amount).to.be.equal(100);
            expect(result[1].amount).to.be.equal(100);
            done();
        });
    });

    it('should delete one request', (done) => {
        requestDao.deleteRequest(purchaseId).then((result) => {
            return requestDao.deleteRequest(sellId);
        }).then((result) => {
            done();
        });
    });

    it('should give all requests', (done) => {
        requestDao.getRequests().then((result) => {
            expect(result.length).to.be.equal(0);
            return requestDao.getRequests();
        }).then((result) => {
            expect(result.length).to.be.equal(0);
            done();
        });
    });
});
