import { IInvestmentDao, IContractDao, IUserDao, getDaos } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, IPersistedInvestor,
    IStorableInvestor, IPersistedContract, IStorableInvestment,
    StorableInvestor, StorableHomeowner, StorableContract,
    IPersistedRequest,
    IStorableRequest,
} from '@entities';
import { IInvestmentService, InvestmentService, IContractService, ContractService, RequestService } from '@services';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { expect } from 'chai';


describe('Investment Service', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let requestDao: IRequestDao<IPersistedRequest, IStorableRequest>;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let investmentService: IInvestmentService;
    let contractService: IContractService;
    let investor: IPersistedInvestor;
    let homeowner: IPersistedHomeowner;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            investmentDao = new daos.SqlInvestmentDao();
            investorDao = new daos.SqlInvestorDao();
            requestDao = new daos.SqlRequestDao();
            const requestService = new RequestService(requestDao,
                investorDao, homeownerDao, investmentDao, contractDao);
            contractService = new ContractService(homeownerDao, contractDao, requestService);
            investmentService = new InvestmentService(requestService);
            return daos.clearDatabase();
        }).then((result) => {
            return investorDao.add(new StorableInvestor('Ryan', 'test@gmail.com', 'skjndf'));
        }).then((newInvestor) => {
            investor = newInvestor;
            return homeownerDao.add(new StorableHomeowner('Hannah', 'blorg@gmail.com', 'asdas'));
        }).then((newHomeowner) => {
            homeowner = newHomeowner;
            done();
        });
    });

    it('should create a purchase requests', (done) => {
        investmentService.addFunds(investor.id, 100).then((result) => {
            done();
        });
    });

    it('should return the purchase request', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(1);
            expect(requests[0].amount).to.be.equal(100);
            done();
        });
    });

    it('should properly create a contract', (done) => {
        contractService.createContract(500, homeowner.id).then((result) => {
            expect(result.saleAmount).to.be.equal(500);
            done();
        });
    });


    it('should give the sell request', (done) => {
        contractDao.getContracts().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].unsoldAmount).to.be.equal(400);
            done();
        });
    });

    it('should not return the purchase request', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(0);
            done();
        });
    });

    it('should return the new investment', (done) => {
        investmentDao.getInvestments().then((investments) => {
            expect(investments.length).to.be.equal(1);
            expect(investments[0].percentage).to.be.equal('0.20');
            done();
        });
    });

    it('should create a purchase requests', (done) => {
        investmentService.addFunds(investor.id, 600).then((result) => {
            done();
        });
    });

    it('should return the purchase request', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(1);
            expect(requests[0].amount).to.be.equal(200);
            done();
        });
    });

    it('should return the new investment', (done) => {
        investmentDao.getInvestments().then((investments) => {
            expect(investments.length).to.be.equal(2);
            expect(investments.map(((investment) => investment.percentage))).to.contain('0.20').and.to.contain('0.80');
            done();
        });
    });

    it('should sell the investment to satisfy purchase requests', (done) => {
        investmentService.sellInvestments(investor.id, 200).then((result) => {
            done();
        });
    });

    it('should not return the new investment', (done) => {
        investmentDao.getInvestments().then((investments) => {
            expect(investments.length).to.be.equal(3);
            let total = 0;
            investments.forEach((investment) => total += Number(investment.percentage));
            expect(total).to.be.equal(1);
            done();
        });
    });

    it('should not return the purchase request', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(0);
            done();
        });
    });

    it('should not return the sell request', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(0);
            done();
        });
    });

    it('should allow a homeowner to make a payment', (done) => {
        contractService.makePayment(homeowner.email).then((result) => {
            done();
        });
    });

    it('should not return the purchase request resulting from the payment', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(3);
            let total = 0;
            requests.forEach((request) => total += Number(request.amount));
            expect(total).to.be.equal(500 * 0.04);
            done();
        });
    });
});
