import { getDaos, IContractDao, IUserDao } from '@daos';

import { StorableHomeowner, IPersistedHomeowner, IStorableHomeowner } from '@entities';
import { IContractService, ContractService, RequestService } from '@services';
import { expect } from 'chai';

describe('Contract Service', () => {

    let contractDao: IContractDao;
    let homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>;
    let contractService: IContractService;
    let homeowner: IPersistedHomeowner;

    before((done) => {
        getDaos().then((daos) => {
            homeownerDao = new daos.SqlHomeownerDao();
            contractDao = new daos.SqlContractDao();
            const investmentDao = new daos.SqlInvestmentDao();
            const investorDao = new daos.SqlInvestorDao();
            const requestDao = new daos.SqlRequestDao();
            const companyDao = new daos.SqlCompanyDao(0);
            const requestService = new RequestService(requestDao, investmentDao, contractDao, companyDao);
            contractService = new ContractService(homeownerDao, contractDao, requestService);
            return daos.clearDatabase();
        }).then((result) => {
            return homeownerDao.add(new StorableHomeowner('Austina', 'test@gmail.com', 'skjndf'));
        }).then((newHomeowner) => {
            homeowner = newHomeowner;
            done();
        });
    });

    it('should properly create a contract', (done) => {
        contractService.createContract(500, homeowner.id).then((result) => {
            expect(result.saleAmount).to.be.equal(500);
            done();
        });
    });

    it('should give the new contract', (done) => {
        contractDao.getContracts().then((result) => {
            expect(result.length).to.be.equal(1);
            expect(result[0].saleAmount).to.be.equal(500);
            done();
        });
    });

});
