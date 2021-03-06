import { IRequestDao } from 'src/daos/investment/RequestDao';
import {
    IPersistedRequest, IStorableRequest, IPersistedUser, IPersistedInvestment, IStorableInvestment,
    PersistedRequest, IPersistedInvestor, IStorableContract, IPersistedContract,
    PersistedContract, PersistedInvestment, StorableRequest, IPersistedCashDeposit,
} from '@entities';
import { IContractDao, IInvestmentDao, ICompanyDao } from '@daos';
import { RequestService, IRequestService } from '@services';
import { expect } from 'chai';
import sinon from 'sinon';
import { getRandomInt } from '@shared';
import { ICashDepositDao } from 'src/daos/investment/CashDepositDao';

const investor: IPersistedInvestor = {
    id: 'a',
    email: 'asd',
    pwdHash: 'asd',
    name: 'asds',
    admin: true,
    requests: [],
    cashDeposits: [],
    investments: [],
};

describe('Request Service', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let requestDao: IRequestDao;
    let requestService: IRequestService;
    let companyDao: ICompanyDao;

    before(() => {
        investmentDao = new MockInvestmentDao();
        contractDao = new MockContractDao();
        requestDao = new MockRequestDao();
        companyDao = new MockCompanyDao();
        requestService = new RequestService(requestDao, investmentDao, contractDao, new MockCashDepositDao());
        sinon.stub((requestService as any), 'takeAssets').returns(Promise.resolve());
    });

    it('should not change anything', (done) => {
        requestService.handleRequests(1).then((result) => {
            return requestDao.getRequests();
        }).then((requests) => {
            expect(requests.length).to.be.equal(1);
            done();
        });
    });

    it('should add a request and cancel out the old one', (done) => {
        requestDao.createRequest(new StorableRequest(100, 0, investor.id, 'sell'))
            .then(() => requestService.handleRequests(1))
            .then((result) => {
                return requestDao.getRequests();
            }).then((requests) => {
                expect(requests.length).to.be.equal(0);
                done();
            });
    });

    it('should add a bunch of requests', (done) => {
        requestDao.createRequest(new StorableRequest(100, 0, investor.id, 'purchase'))
            .then(() => requestService.handleRequests(1))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(1);
                expect(requests[0].amount).to.be.equal(100);
                expect(requests[0].type).to.be.equal('purchase');
                return Promise.resolve();
            })
            .then(() => requestDao.createRequest(new StorableRequest(200, 0, investor.id, 'sell')))
            .then(() => requestService.handleRequests(1))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(1);
                expect(requests[0].amount).to.be.equal(100);
                expect(requests[0].type).to.be.equal('sell');
                return Promise.resolve();
            })
            .then(() => requestDao.createRequest(new StorableRequest(50, 0, investor.id, 'purchase')))
            .then(() => requestService.handleRequests(1))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(1);
                expect(requests[0].amount).to.be.equal(50);
                expect(requests[0].type).to.be.equal('sell');
                return Promise.resolve();
            })
            .then(() => requestDao.createRequest(new StorableRequest(230, 0, investor.id, 'purchase')))
            .then(() => requestDao.createRequest(new StorableRequest(50, 0, investor.id, 'purchase')))
            .then(() => requestService.handleRequests(1))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(2);
                let total = 0;
                requests.map((toUse) => total += toUse.amount);
                expect(total).to.be.equal(230);
                done();
            });
    });

    after(() => {
        sinon.restore();
    });
});

class MockInvestmentDao implements IInvestmentDao {


    public createInvestment(investment: IStorableInvestment): Promise<IPersistedInvestment> {
        return Promise.resolve(new PersistedInvestment());
    }


    public deleteInvestment(id: string): Promise<void> {
        return Promise.resolve();
    }


    public getInvestment(id: string): Promise<IPersistedInvestment | null> {
        return Promise.resolve(null);
    }


    public getInvestments(userId?: string | undefined): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


    public saveInvestment(investment: IPersistedInvestment): Promise<void> {
        return Promise.resolve();
    }


    public transferInvestment(id: string, from: IPersistedInvestor, to: IPersistedInvestor): Promise<number> {
        return Promise.resolve(0);
    }


}

// tslint:disable-next-line: max-classes-per-file
class MockContractDao implements IContractDao {

    private contracts: IPersistedContract[] = [];


    public createContract(contract: IStorableContract): Promise<IPersistedContract> {
        const newContract = new PersistedContract();
        newContract.id = String(getRandomInt());
        newContract.saleAmount = contract.saleAmount;
        newContract.totalLength = contract.length;
        newContract.monthlyPayment = contract.monthlyPayment;
        this.contracts.push(newContract);
        return Promise.resolve(newContract);
    }


    public getContract(id: string): Promise<IPersistedContract> {
        return Promise.resolve(this.contracts.filter((contract) => contract.id === id)[0]);
    }


    public getContractPositionInQueue(unsoldAmount: number): Promise<number> {
        return Promise.resolve(1);
    }


    public getContracts(userId?: string | undefined): Promise<IPersistedContract[]> {
        return Promise.resolve(
            Object.assign([], this.contracts.filter((contract) => !userId || contract.homeowner.id === userId)));
    }


    public getInvestmentsForContract(contractId?: string | undefined): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


    public saveContract(toSave: IPersistedContract): Promise<void> {
        this.contracts.map((mapContract) => mapContract.id === toSave.id ? toSave : mapContract);
        return Promise.resolve();
    }
}

// tslint:disable-next-line: max-classes-per-file
class MockRequestDao implements IRequestDao {

    private requests: IPersistedRequest[] = [
        {
            id: '0',
            amount: 100,
            investor,
            dateCreated: 1,
            type: 'purchase',
        },
    ];


    public createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest> {
        const newRequest = new PersistedRequest();
        newRequest.amount = toCreate.amount;
        newRequest.dateCreated = toCreate.dateCreated;
        newRequest.id = String(getRandomInt());
        newRequest.investor = investor;
        newRequest.type = toCreate.type;
        this.requests.push(newRequest);
        return Promise.resolve(newRequest);
    }


    public deleteRequest(toDeleteId: string): Promise<void> {
        this.requests = this.requests.filter((filterReq) => filterReq.id !== toDeleteId);
        return Promise.resolve();
    }


    public getRequests(): Promise<IPersistedRequest[]> {
        return Promise.resolve(this.requests);
    }


    public saveRequest(toSave: IPersistedRequest): Promise<void> {
        this.requests.map((mapRequest) => mapRequest.id === toSave.id ? toSave : mapRequest);
        return Promise.resolve();
    }
}

// tslint:disable-next-line: max-classes-per-file
class MockCompanyDao implements ICompanyDao {


    public async takeFee(amount: number): Promise<number> {
        return amount;
    }

}

// tslint:disable-next-line: max-classes-per-file
class MockCashDepositDao implements ICashDepositDao {


    public getDepositsFor(user: IPersistedInvestor): Promise<IPersistedCashDeposit[]> {
        return Promise.resolve([]);
    }


    public makeDeposit(amount: number, date: number, user: IPersistedInvestor): Promise<void> {
        return Promise.resolve();
    }


}
