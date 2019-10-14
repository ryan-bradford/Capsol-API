import { IRequestDao } from 'src/daos/investment/RequestDao';
import {
    IPersistedRequest, IStorableRequest, IPersistedUser, IPersistedInvestment, IStorableInvestment,
    PersistedRequest, IPersistedInvestor, IStorableContract, IPersistedContract,
    PersistedContract, PersistedInvestment, StorableRequest,
} from '@entities';
import { IContractDao, IInvestmentDao } from '@daos';
import { RequestService, IRequestService } from '@services';
import { expect } from 'chai';
import { request } from 'http';
import sinon from 'sinon';
import { logger, getRandomInt } from '@shared';

const investor: IPersistedInvestor = {
    id: 1,
    email: 'asd',
    pwdHash: 'asd',
    name: 'asds',
    admin: true,
    requests: [],
};

describe('Request Service', () => {

    let investmentDao: IInvestmentDao;
    let contractDao: IContractDao;
    let requestDao: IRequestDao;
    let requestService: IRequestService;

    before(() => {
        investmentDao = new MockInvestmentDao();
        contractDao = new MockContractDao();
        requestDao = new MockRequestDao();
        requestService = new RequestService(requestDao, investmentDao, contractDao);
        sinon.stub((requestService as any), 'takeAssets').returns(Promise.resolve());
    });

    it('should not change anything', (done) => {
        requestService.handleRequests().then((result) => {
            return requestDao.getRequests();
        }).then((requests) => {
            expect(requests.length).to.be.equal(1);
            done();
        });
    });

    it('should add a request and cancel out the old one', (done) => {
        requestService.createSellRequest(investor, 100).then((result) => {
            return requestDao.getRequests();
        }).then((requests) => {
            expect(requests.length).to.be.equal(0);
            done();
        });
    });

    it('should add a bunch of requests', (done) => {
        requestService.createPurchaseRequest(investor, 100)
            .then(() => requestService.createSellRequest(investor, 200))
            .then(() => requestService.createPurchaseRequest(investor, 50))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(1);
                expect(requests[0].amount).to.be.equal(50);
                expect(requests[0].type).to.be.equal('sell');
                return Promise.resolve();
            })
            .then(() => requestService.createPurchaseRequest(investor, 230))
            .then(() => requestService.createPurchaseRequest(investor, 50))
            .then(() => requestDao.getRequests())
            .then((requests) => {
                expect(requests.length).to.be.equal(2);
                expect(requests[1].amount).to.be.equal(50);
                expect(requests[0].amount).to.be.equal(180);
                done();
            });
    });

    after(() => {
        sinon.restore();
    });
});

class MockInvestmentDao implements IInvestmentDao {


    public getInvestment(id: number): Promise<IPersistedInvestment | null> {
        return Promise.resolve(null);
    }


    public getInvestments(userId?: number | undefined): Promise<IPersistedInvestment[]> {
        return Promise.resolve([]);
    }


    public createInvestment(investment: IStorableInvestment): Promise<IPersistedInvestment> {
        return Promise.resolve(new PersistedInvestment());
    }


    public deleteInvestment(id: number): Promise<void> {
        return Promise.resolve();
    }


    public transferInvestment(id: number, from: IPersistedInvestor, to: IPersistedInvestor): Promise<void> {
        return Promise.resolve();
    }


    public saveInvestment(investment: IPersistedInvestment): Promise<void> {
        return Promise.resolve();
    }


}

// tslint:disable-next-line: max-classes-per-file
class MockContractDao implements IContractDao {

    private contracts: IPersistedContract[] = [];


    public getContracts(userId?: number | undefined): Promise<IPersistedContract[]> {
        return Promise.resolve(
            Object.assign([], this.contracts.filter((contract) => !userId || contract.homeowner.id === userId)));
    }


    public getContract(id: number): Promise<IPersistedContract> {
        return Promise.resolve(this.contracts.filter((contract) => contract.id === id)[0]);
    }


    public createContract(contract: IStorableContract): Promise<IPersistedContract> {
        const newContract = new PersistedContract();
        newContract.id = this.contracts.length;
        newContract.saleAmount = contract.saleAmount;
        newContract.startLength = contract.length;
        newContract.length = contract.length;
        newContract.monthlyPayment = contract.monthlyPayment;
        this.contracts.push(newContract);
        return Promise.resolve(newContract);
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
            id: 0,
            amount: 100,
            investor,
            dateCreated: new Date(),
            type: 'purchase',
        },
    ];


    public getRequests(): Promise<IPersistedRequest[]> {
        return Promise.resolve(this.requests);
    }


    public createRequest(toCreate: IStorableRequest): Promise<IPersistedRequest> {
        const newRequest = new PersistedRequest();
        newRequest.amount = toCreate.amount;
        newRequest.dateCreated = toCreate.dateCreated;
        newRequest.id = getRandomInt();
        newRequest.investor = investor;
        newRequest.type = toCreate.type;
        this.requests.push(newRequest);
        return Promise.resolve(newRequest);
    }


    public deleteRequest(toDeleteId: number): Promise<void> {
        this.requests = this.requests.filter((filterReq) => filterReq.id !== toDeleteId);
        return Promise.resolve();
    }


    public saveRequest(toSave: IPersistedRequest): Promise<void> {
        this.requests.map((mapRequest) => mapRequest.id === toSave.id ? toSave : mapRequest);
        return Promise.resolve();
    }
}
