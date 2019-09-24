const usingMockDb = (process.env.USE_MOCK_DB || '').toLowerCase();
import { UserDao, IUserDao } from './User/UserDao';
import { UserDao as MockUserDao } from './User/UserDao.mock';
import { IUser } from '@entities';
import { IContractDao, ContractDao } from './Investment/ContractDao';
import { ContractDao as MockContractDao } from './Investment/ContractDao.mock';

let UserDaoFactory: () => IUserDao<IUser>;

if (usingMockDb === 'true') {
    UserDaoFactory = () => new MockUserDao();
} else {
    UserDaoFactory = () => new UserDao();
}

let ContractDaoFactory: () => IContractDao;

if (usingMockDb === 'true') {
    ContractDaoFactory = () => new MockContractDao();
} else {
    ContractDaoFactory = () => new ContractDao();
}

export { ContractDaoFactory };

import { InvestmentDao, IInvestmentDao } from './Investment/InvestmentDao';
import { InvestmentDao as MockInvestmentDao } from './Investment/InvestmentDao.mock';

let InvestmentDaoFactory: () => IInvestmentDao;

if (usingMockDb === 'true') {
    InvestmentDaoFactory = () => new MockInvestmentDao();

} else {
    InvestmentDaoFactory = () => new InvestmentDao();
}

export { UserDaoFactory, InvestmentDaoFactory };
