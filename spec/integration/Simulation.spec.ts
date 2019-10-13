import request from 'supertest';
import app from '../../src/Server';
import { getDaos } from '@daos';
import { InvestmentService, RequestService, ContractService } from '@services';
import { Express } from 'express';
import { logger, pwdSaltRounds, jwtCookieProps } from '@shared';
import { StorableInvestor, StorableHomeowner, PersistedHomeowner, IStoredHomeowner } from '@entities';
import faker from 'faker';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import { SqlHomeownerDao } from 'src/daos/user/HomeownerDao';

let appInstance: Express;
let cookie: string;

async function runSimulation() {


    const daos = await getDaos();

    appInstance =
        app(new daos.SqlHomeownerDao(),
            new daos.SqlInvestorDao(),
            new daos.SqlContractDao(),
            new daos.SqlInvestmentDao(),
            new daos.SqlRequestDao(),
            (homeownerDao, contractDao, requestService) =>
                new ContractService(homeownerDao, contractDao, requestService),
            (requestDao, requestService) =>
                new InvestmentService(requestService),
            (requestDao, investorDao, homeownerDao, investmentDao, contractDao) =>
                new RequestService(requestDao,
                    investorDao, homeownerDao, investmentDao, contractDao));
    await daos.clearDatabase();
    cookie = await login();

    // Get all homeowners
    // Make a payment for each
    // Payment only processed if contract has length left and is fulfilled


    // Overall:
    // Add a bunch of investors and homeowners
    // Setup a bunch of contracts
    // Invest a bunch of money
    // Tick month (randomly skip payment and incur damages)
    // Randomly add new home + add new investor

    // Assumptions:
    // Homes > Investments

    const investmentSizeMax = 10000;
    const contractSizeMax = 10000;
    const simulationLength = 2;
    const newInvestorNumber = 20;
    const newHomeownerNumber = 50;

    const investorToDate: Map<string, number> = new Map();
    const investorToInvestment: Map<string, number> = new Map();

    const investorEmail = await addInvestor();
    const homeownerEmail = await addHomeowner();
    const homeownerEmail2 = await addHomeowner();
    await addInvestment(investorEmail, 100);
    await addContract(homeownerEmail, 100);
    await addContract(homeownerEmail2, 100);
    await tickMonth();
    const investorEmail2 = await addInvestor();
    await addInvestment(investorEmail2, 96);
    await tickMonth();

    request(appInstance).get(`/investor`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            logger.info(JSON.stringify(result.body.users.map((user: any) =>
                user.portfolioValue / 100)));
        });

    /*
    for (let i = 0; i < simulationLength; i++) {
        logger.info(String(i));
        const newInvestors = Math.round(Math.random() * newInvestorNumber);
        const newHomeowners = Math.round(Math.random() * newHomeownerNumber);
        for (let a = 0; a < 1; a++) {
            const investorEmail = await addInvestor();
            const investment = Math.round(Math.random() * investmentSizeMax);
            await addInvestment(investorEmail, investment);
            investorToDate.set(investorEmail, i);
            investorToInvestment.set(investorEmail, investment);
        }
        for (let a = 0; a < 4; a++) {
            const homeownerEmail = await addHomeowner();
            await addContract(homeownerEmail, Math.round(Math.random() * contractSizeMax));
        }
        await tickMonth();
    }*/
}

async function addInvestor(): Promise<string> {
    const newInvestor = new StorableInvestor(faker.name.findName(),
        faker.internet.email(), faker.internet.password());
    const result = await request(appInstance).post('/investor')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ user: newInvestor });
    return result.body.email;
}

async function addInvestment(investorEmail: string, amount: number): Promise<void> {
    await request(appInstance).put(`/investor/${investorEmail}/investment`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ amount });
    return;
}

async function addHomeowner(): Promise<string> {
    const newHomeowner = new StorableHomeowner(faker.name.findName(),
        faker.internet.email(), faker.internet.password());
    const result = await request(appInstance).post('/homeowner')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ user: newHomeowner });
    return result.body.email;
}

async function addContract(homeownerEmail: string, amount: number): Promise<void> {
    await request(appInstance).put(`/homeowner/${homeownerEmail}/home`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ amount });
    return;
}

async function tickMonth(): Promise<void> {
    await request(appInstance).get(`/homeowner`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            return Promise.all(result.body.users.map((homeowner: IStoredHomeowner) => {
                return makePayment(homeowner.email);
            }));
        });
    return;
}

async function makePayment(homeownerEmail: string): Promise<void> {
    await request(appInstance).put(`/homeowner/${homeownerEmail}/payment`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie);
    return;
}

async function login(): Promise<string> {
    sinon.stub(SqlHomeownerDao.prototype, 'getOne').returns((() => {
        const toReturn = new PersistedHomeowner();
        toReturn.admin = true;
        toReturn.email = 'blorg';
        toReturn.pwdHash = hashPwd('a');
        return Promise.resolve(toReturn);
    })());

    return request(appInstance).post(`/auth/login`)
        .set('Accept', 'application/json')
        .send({
            email: 'blorg',
            password: 'a',
        })
        .then((result) => {
            sinon.restore();
            return result.header['set-cookie'];
        });
}

function hashPwd(pwd: string) {
    return bcrypt.hashSync(pwd, pwdSaltRounds);
}
describe('Simulation', function test() {
    this.timeout(50000);
    it('should run the simulation', (done) => {
        runSimulation().then((result) => {
            done();
        });
    });
});
