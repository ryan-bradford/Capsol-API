import { IUserDao } from './user/UserDao';
import { SqlHomeownerDao } from './user/HomeownerDao';
import { SqlInvestorDao } from './user/InvestorDao';
import { IInvestmentDao, SqlInvestmentDao } from './investment/InvestmentDao';
import { IContractDao, SqlContractDao } from './investment/ContractDao';
import { createConnection, getRepository, getConnection, getConnectionManager } from 'typeorm';
import { logger } from '@shared';
import {
    PersistedContract, PersistedSellRequest, PersistedPurchaseRequest,
    PersistedInvestment, PersistedHomeowner, PersistedInvestor,
} from '@entities';
import { SqlPurchaseRequestDao, SqlSellRequestDao } from './investment/RequestDao';

async function getDaos() {
    if (getConnectionManager().connections.length === 0) {
        await createConnection();
    }
    return {
        SqlHomeownerDao, SqlInvestorDao,
        SqlInvestmentDao, SqlContractDao, clearDatabase,
        SqlPurchaseRequestDao, SqlSellRequestDao,

    };
}

async function clearDatabase() {
    if (process.env.NODE_ENV !== 'test' || process.env.USE_TEST_DB !== 'true') {
        throw new Error('Please do not do this');
    }
    await getRepository(PersistedHomeowner).find().then((homeowners) => {
        return Promise.all(homeowners.map((homeowner) => getRepository(PersistedHomeowner).delete(homeowner)));
    });

    await getRepository(PersistedInvestor).find().then((investors) => {
        return Promise.all(investors.map((investor) => getRepository(PersistedInvestor).delete(investor)));
    });

    return 'Done!';
}

export {
    IUserDao, IInvestmentDao, IContractDao, getDaos,
};
