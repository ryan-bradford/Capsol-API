import request from 'supertest';
import app from '../../src/Server';
import { Express } from 'express';
import { getDaos } from '@daos';
import { InvestmentService, RequestService, ContractService } from '@services';
import { logger, pwdSaltRounds, jwtCookieProps } from '@shared';
import { StorableInvestor, StorableHomeowner, PersistedHomeowner, IStoredHomeowner } from '@entities';
import faker from 'faker';
import sinon from 'sinon';
import bcrypt from 'bcryptjs';
import { SqlHomeownerDao } from 'src/daos/user/HomeownerDao';
import { container } from 'tsyringe';
import { DateService } from 'src/services/DateService';
import { EstimateService } from 'src/services/estimation/EstimateService';
import { StatService } from 'src/services/stat/StatService';

export let appInstance: Express;
export let cookie: string;

export async function startApp(fee: number) {

    const daos = await getDaos();
    container.register('TargetRate', {
        useValue: 0.04,
    });
    container.register('FeeRate', {
        useValue: fee,
    });
    container.register('CashDepositDao', {
        useClass: daos.SqlCashDepositDao,
    });
    container.register('HomeownerDao', {
        useClass: daos.SqlHomeownerDao,
    });
    container.register('InvestorDao', {
        useClass: daos.SqlInvestorDao,
    });
    container.register('InvestmentDao', {
        useClass: daos.SqlInvestmentDao,
    });
    container.register('ContractDao', {
        useClass: daos.SqlContractDao,
    });
    container.register('CompanyDao', {
        useClass: daos.SqlCompanyDao,
    });
    container.register('RequestDao', {
        useClass: daos.SqlRequestDao,
    });
    container.register('EstimateDao', {
        useClass: daos.EstimateDao,
    });
    container.register('RequestService', {
        useClass: RequestService,
    });
    container.register('ContractService', {
        useClass: ContractService,
    });
    container.register('InvestmentService', {
        useClass: InvestmentService,
    });
    container.register('EstimateService', {
        useClass: EstimateService,
    });
    container.register('StatService', {
        useClass: StatService,
    });
    await daos.clearDatabase();
    container.register('DateService', {
        useValue: new DateService(container.resolve('InvestmentDao'), container.resolve('RequestDao')),
    });
    appInstance = app();
    cookie = await login();

}

export async function addInvestor(): Promise<string> {
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

export async function addInvestment(investorEmail: string, amount: number): Promise<void> {
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

export async function sellInvestment(investorEmail: string, amount: number): Promise<void> {
    await request(appInstance).put(`/investor/${investorEmail}/sell`)
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

export async function addHomeowner(): Promise<string> {
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

export async function addContract(homeownerEmail: string, amount: number): Promise<void> {
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

export async function tickMonth(): Promise<void> {
    await request(appInstance).post(`/admin/payments`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

export async function handleRequests(): Promise<void> {
    await request(appInstance).post(`/admin/update`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
}

export async function getInvestor(email: string): Promise<any> {
    return request(appInstance).get(`/investor/${email}`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            return result.body;
        })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
}

export async function getHomeowner(email: string): Promise<any> {
    return request(appInstance).get(`/homeowner/${email}`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            return result.body;
        })
        .catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
}


export async function makePayment(homeownerEmail: string): Promise<void> {
    await request(appInstance).put(`/homeowner/${homeownerEmail}/payment`)
        .set('Accept', 'application/json')
        .set('Cookie', cookie)
        .then((result) => {
            if (result.status === 500) {
                process.exit();
            }
        }).catch((error) => {
            logger.error(error);
            process.exit();
            throw error;
        });
    return;
}

export async function login(): Promise<string> {
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
