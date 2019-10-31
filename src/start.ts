import app from '@server';
import { logger } from '@shared';
import { ContractService, InvestmentService, RequestService } from '@services';
import { getDaos } from '@daos';
import { container } from 'tsyringe';

// Start the server
process.env.USE_TEST_DB = 'false';
const port = Number(process.env.PORT || 3000);


getDaos().then((daos) => {
    container.register('TargetRate', {
        useValue: 0.04,
    });
    container.register('FeeRate', {
        useValue: 0.01,
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
    container.register('RequestService', {
        useClass: RequestService,
    });
    container.register('ContractService', {
        useClass: ContractService,
    });
    container.register('InvestmentService', {
        useClass: InvestmentService,
    });
    app()
        .listen(port, () => {
            logger.info('Express server started on port: ' + port);
        });
});

