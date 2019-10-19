import app from '@server';
import { logger } from '@shared';
import { ContractService, InvestmentService, RequestService } from '@services';
import { getDaos } from '@daos';

// Start the server
const port = Number(process.env.PORT || 3000);
getDaos().then((daos) => {
    app(new daos.SqlHomeownerDao(),
        new daos.SqlInvestorDao(),
        new daos.SqlContractDao(),
        new daos.SqlInvestmentDao(),
        new daos.SqlRequestDao(),
        new daos.SqlCompanyDao(0.01),
        (homeownerDao, contractDao, requestService) => new ContractService(homeownerDao, contractDao, requestService),
        (investorDao, investmentDao, requestService) =>
            new InvestmentService(investorDao, investmentDao, requestService),
        (requestDao, investmentDao, contractDao, companyDao) =>
            new RequestService(requestDao, investmentDao, contractDao, companyDao))
        .listen(port, () => {
            logger.info('Express server started on port: ' + port);
        });
});

