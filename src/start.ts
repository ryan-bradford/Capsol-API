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
        new daos.SqlSellRequestDao(),
        new daos.SqlPurchaseRequestDao(),
        (homeownerDao, contractDao, requestService) => new ContractService(homeownerDao, contractDao, requestService),
        (purchaseRequestDao, sellRequestDao, requestService) =>
            new InvestmentService(purchaseRequestDao, sellRequestDao, requestService),
        (sellRequestDao, purchaseRequestDao, investorDao, homeownerDao, investmentDao, contractDao) =>
            new RequestService(sellRequestDao, purchaseRequestDao,
                investorDao, homeownerDao, investmentDao, contractDao))
        .listen(port, () => {
            logger.info('Express server started on port: ' + port);
        });
});

