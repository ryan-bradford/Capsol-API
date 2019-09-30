import { IUserDao } from './user/UserDao';
import { SqlHomeownerDao } from './user/HomeownerDao';
import { SqlInvestorDao } from './user/InvestorDao';
import { IInvestmentDao, SqlInvestmentDao } from './investment/InvestmentDao';
import { IContractDao, SqlContractDao } from './investment/ContractDao';
import { createConnection } from 'typeorm';
import { logger } from '@shared';

createConnection().then((connection) => {
    logger.info('Successfully connected to MySQL');
});

export {
    IUserDao, SqlHomeownerDao, SqlInvestorDao, IInvestmentDao,
    SqlInvestmentDao, IContractDao, SqlContractDao,
};
