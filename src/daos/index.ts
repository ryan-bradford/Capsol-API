const usingMockDb = (process.env.USE_MOCK_DB || '').toLowerCase();
import { UserDao, IUserDao } from './User/UserDao';
import { UserDao as MockUserDao } from './User/UserDao.mock';

let UserDaoFactory: () => IUserDao;

if (usingMockDb === 'true') {
    UserDaoFactory = () => new MockUserDao();

} else {
    UserDaoFactory = () => new UserDao();
}

export { UserDaoFactory };
