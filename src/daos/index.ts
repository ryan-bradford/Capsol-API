import { IUserDao } from './user/UserDao';
import { SqlHomeownerDao } from './user/HomeownerDao';
import { SqlInvestorDao } from './user/InvestorDao';
import { IInvestmentDao, SqlInvestmentDao } from './investment/InvestmentDao';
import { IContractDao, SqlContractDao } from './investment/ContractDao';
import { ICompanyDao, SqlCompanyDao } from './investment/CompanyDao';
import { SqlRequestDao } from './investment/RequestDao';
import { createConnection, getRepository, getConnectionManager } from 'typeorm';
import {
    PersistedHomeowner, PersistedInvestor, PersistedCompanyFee,
} from '@entities';
import { logger } from '@shared';
import { SqlCashDepositDao } from './investment/CashDepositDao';
import { AssertionError } from 'assert';

/**
 * A function that will return all the DAO SQL classes once the database has loaded.
 */
async function getDaos() {
    if (getConnectionManager().connections.length === 0) {
        await createConnection();
    }
    return {
        SqlHomeownerDao, SqlInvestorDao,
        SqlInvestmentDao, SqlContractDao, clearDatabase,
        SqlRequestDao, SqlCompanyDao, SqlCashDepositDao,
    };
}

/**
 * Clears every entity from the database.
 */
async function clearDatabase() {
    if (process.env.NODE_ENV !== 'test' || process.env.USE_TEST_DB !== 'true') {
        logger.info(String([process.env.NODE_ENV, process.env.USE_TEST_DB]));
        throw new AssertionError({ message: 'Please do not do this' });
    }
    await getRepository(PersistedHomeowner).find().then((homeowners) => {
        return Promise.all(homeowners.map((homeowner) => getRepository(PersistedHomeowner).delete(homeowner)));
    });

    await getRepository(PersistedInvestor).find().then((investors) => {
        return Promise.all(investors.map((investor) => getRepository(PersistedInvestor).delete(investor)));
    });

    await getRepository(PersistedCompanyFee).find().then((cashDeposits) => {
        return Promise.all(cashDeposits.map((cash) => getRepository(PersistedCompanyFee).delete(cash)));
    });

    return 'Done!';
}

export {
    IUserDao, IInvestmentDao, IContractDao, ICompanyDao, getDaos,
};
