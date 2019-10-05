import { IUserDao } from './user/UserDao';
import { SqlHomeownerDao } from './user/HomeownerDao';
import { SqlInvestorDao } from './user/InvestorDao';
import { IInvestmentDao, SqlInvestmentDao } from './investment/InvestmentDao';
import { IContractDao, SqlContractDao } from './investment/ContractDao';
import { createConnection, getRepository, getConnection } from 'typeorm';
import { logger } from '@shared';
import {
    PersistedContract, PersistedSellRequest, PersistedPurchaseRequest,
    PersistedInvestment, PersistedHomeowner, PersistedInvestor,
} from '@entities';

createConnection().then((connection) => {
    logger.info('Successfully connected to MySQL');
});

async function clearDatabase() {
    if (process.env.NODE_ENV !== 'test' || process.env.USE_TEST_DB !== 'true') {
        throw new Error('Please do not do this');
    }
    await getRepository(PersistedSellRequest).find().then((requests) => {
        return Promise.all(requests.map((request) => getRepository(PersistedSellRequest).delete(request)));
    });

    await getRepository(PersistedPurchaseRequest).find().then((requests) => {
        return Promise.all(requests.map((request) => getRepository(PersistedPurchaseRequest).delete(request)));
    });

    await getRepository(PersistedContract).find().then((contracts) => {
        return Promise.all(contracts.map((contract) => getRepository(PersistedContract).delete(contract)));
    });

    await getRepository(PersistedInvestment).find().then((investments) => {
        return Promise.all(investments.map((investment) => getRepository(PersistedContract).delete(investment)));
    });

    await getRepository(PersistedHomeowner).find().then((homeowners) => {
        return Promise.all(homeowners.map((homeowner) => getRepository(PersistedHomeowner).delete(homeowner)));
    });

    await getRepository(PersistedInvestor).find().then((investors) => {
        return Promise.all(investors.map((investor) => getRepository(PersistedInvestor).delete(investor)));
    });

    return 'Done!';
}

export {
    IUserDao, SqlHomeownerDao, SqlInvestorDao, IInvestmentDao,
    SqlInvestmentDao, IContractDao, SqlContractDao, clearDatabase,
};
