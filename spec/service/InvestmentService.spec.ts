import { IInvestmentDao, IContractDao, IUserDao, getDaos, ICompanyDao } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, IPersistedInvestor,
    IStorableInvestor, StorableInvestor, StorableHomeowner,
} from '@entities';
import {
    IInvestmentService, InvestmentService, IContractService, ContractService,
    RequestService, IRequestService,
} from '@services';
import { IRequestDao } from 'src/daos/investment/RequestDao';
import { expect } from 'chai';


describe('Investment Service', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let requestDao: IRequestDao;
    let companyDao: ICompanyDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>;
    let investmentService: IInvestmentService;
    let requestService: IRequestService;
    let contractService: IContractService;
    let investor: IPersistedInvestor;
    let homeowner: IPersistedHomeowner;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            investmentDao = new daos.SqlInvestmentDao();
            investorDao = new daos.SqlInvestorDao();
            requestDao = new daos.SqlRequestDao(investorDao);
            companyDao = new daos.SqlCompanyDao(0);
            const cashDepositDao = new daos.SqlCashDepositDao();
            requestService = new RequestService(requestDao, investmentDao, contractDao, cashDepositDao);
            contractService = new ContractService(homeownerDao, contractDao, requestDao, companyDao, 0.04);
            investmentService = new InvestmentService(investorDao, investmentDao, requestDao, cashDepositDao);
            return daos.clearDatabase();
        }).then(() => {
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
        investmentService.addFunds(investor.id, 100, 1).then(() => {
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
        requestService.handleRequests(1)
            .then(() => contractDao.getContracts())
            .then((result) => {
                expect(result.length).to.be.equal(1);
                expect(result[0].unsoldAmount()).to.be.equal(400);
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
            expect(investments[0].amount).to.be.equal(100);
            done();
        });
    });

    it('should create a purchase requests', (done) => {
        investmentService.addFunds(investor.id, 600, 1).then(() => {
            done();
        });
    });

    it('should return the purchase request', (done) => {
        requestService.handleRequests(1)
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(1);
                expect(requests[0].amount).to.be.equal(200);
                done();
            });
    });

    it('should return the new investment', (done) => {
        investmentDao.getInvestments().then((investments) => {
            expect(investments.length).to.be.equal(1);
            expect(investments[0].amount).to.be.equal(500);
            done();
        });
    });

    it('should sell the investment to satisfy purchase requests', (done) => {
        investmentService.sellInvestments(investor.id, 200, 2)
            .then(() => requestService.handleRequests(2))
            .then(() => done());
    });

    it('should not return the new investment', (done) => {
        investmentDao.getInvestments().then((investments) => {
            expect(investments.length).to.be.equal(2);
            let total = 0;
            investments.forEach((investment) => total += Number(investment.amount));
            expect(total).to.be.equal(1000);
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
        contractService.makePayment(homeowner.email, 2)
            .then(() => requestService.handleRequests(2))
            .then(() => done());
    });

    it('should have a length of one less', (done) => {
        contractDao.getContracts().then((contracts) => {
            expect(contracts[0].totalLength - 3).to.be.equal(237);
            done();
        });
    });

    it('should not return the purchase request resulting from the payment', (done) => {
        requestDao.getRequests().then((requests) => {
            expect(requests.length).to.be.equal(1);
            let total = 0;
            requests.forEach((request) => total += Number(request.amount));
            expect(total).to.be.equal(4);
            done();
        });
    });
});
