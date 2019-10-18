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
import { expect } from 'chai';

let appInstance: Express;
let cookie: string;
let totalFunds = 0;


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
            (investorDao, investmentDao, requestService) =>
                new InvestmentService(investorDao, investmentDao, requestService),
            (requestDao, investmentDao, contractDao) =>
                new RequestService(requestDao, investmentDao, contractDao));
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
    const simulationLength = 24;
    const newInvestorNumber = 2;
    const newHomeownerNumber = 5;
    totalFunds = 0;

    const investorToInvestment: Map<string, number> = new Map();
    const investorToJoinTime: Map<string, number> = new Map();

    for (let a = 0; a < 1; a++) {
        const investorEmail = await addInvestor();
        const investment = 10000;
        await addInvestment(investorEmail, investment);
        totalFunds += investment;
        investorToJoinTime.set(investorEmail, 0);
        investorToInvestment.set(investorEmail, investment);
    }
    for (let a = 0; a < 1; a++) {
        const homeownerEmail = await addHomeowner();
        await addContract(homeownerEmail, 10000);
        const homeownerEmail2 = await addHomeowner();
        await addContract(homeownerEmail2, 10000);
    }

    for (let i = 0; i < simulationLength; i++) {
        await handleRequests();
        await tickMonth();
        const homeownerToAdd = Math.random() * newHomeownerNumber;
        const investorToAdd = Math.random() * newInvestorNumber;
        for (let h = 0; h < homeownerToAdd; h++) {
            const newEmail = await addHomeowner();
            const contractSize = 1000 + Math.round(Math.random() * contractSizeMax);
            await addContract(newEmail, contractSize);
        }
        if (i < simulationLength / 2) {
            for (let inv = 0; inv < investorToAdd; inv++) {
                const newEmail = await addInvestor();
                const investmentSize = 1000 + Math.round(Math.random() * investmentSizeMax);
                investorToInvestment.set(newEmail, investmentSize);
                investorToJoinTime.set(newEmail, i + 1);
                await addInvestment(newEmail, investmentSize);
            }
        }
    }
    request(appInstance).get(`/investor`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            let totalInterest = 0;
            result.body.users.map((user: any) => {
                const initInvestment = Number(investorToInvestment.get(user.email));
                let joinTime = Number(investorToJoinTime.get(user.email));
                joinTime = joinTime === simulationLength ? joinTime - 1 : joinTime;
                const interest = Math.pow((user.portfolioValue / initInvestment),
                    1 / ((simulationLength - joinTime) / 12));
                // logger.info(String([joinTime, user.portfolioValue, initInvestment, interest, user.id]));
                totalInterest += interest;
                return interest;
            });
            const givenInterest = totalInterest / result.body.users.length;
            expect(Math.round(givenInterest * 100) / 100).to.be.greaterThan(1.039);
            logger.info(String(givenInterest));
        });
}

async function addInvestor(): Promise<string> {
    const newInvestor = new StorableInvestor(faker.name.findName(),
        faker.internet.email(), faker.internet.password());
    const toReturn = await request(appInstance).post('/investor')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ user: newInvestor })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return toReturn.body.email;
}

async function addInvestment(investorEmail: string, amount: number): Promise<void> {
    await request(appInstance).put(`/investor/${investorEmail}/investment`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ amount })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

async function addHomeowner(): Promise<string> {
    const newHomeowner = new StorableHomeowner(faker.name.findName(),
        faker.internet.email(), faker.internet.password());
    const toReturn = await request(appInstance).post('/homeowner')
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ user: newHomeowner })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return toReturn.body.email;
}

async function addContract(homeownerEmail: string, amount: number): Promise<void> {
    await request(appInstance).put(`/homeowner/${homeownerEmail}/home`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .send({ amount })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

async function tickMonth(): Promise<void> {
    await request(appInstance).post(`/homeowner/payments`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

async function handleRequests(): Promise<void> {
    await request(appInstance).post(`/investor/update`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
}

async function makePayment(homeownerEmail: string): Promise<void> {
    await request(appInstance).put(`/homeowner/${homeownerEmail}/payment`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            if (result.status === 500) {
                process.exit();
            }
            totalFunds += result.body.payment;
        }).catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

async function login(): Promise<string> {
    sinon.stub(SqlHomeownerDao.prototype, 'getOneByEmail').returns((() => {
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
    this.timeout(500000);
    it('should run the simulation', (done) => {
        runSimulation().then((result) => {
            done();
        });
    });
});
