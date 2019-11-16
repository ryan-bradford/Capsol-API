import app from '@server';
import { logger } from '@shared';
import { ContractService, InvestmentService, RequestService } from '@services';
import { getDaos } from '@daos';
import { container } from 'tsyringe';
import { DateService } from './services/DateService';
import { EstimateService } from './services/estimation/EstimateService';
import { StatService } from './services/stat/StatService';

// Start the server
process.env.USE_TEST_DB = 'false';
const port = Number(process.env.PORT || 3000);


getDaos().then((daos) => {
    container.register('TargetRate', {
        useValue: 0.02,
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
    container.register('DateService', {
        useValue: new DateService(container.resolve('InvestmentDao'), container.resolve('RequestDao')),
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
    container.register('EstimateService', {
        useClass: EstimateService,
    });
    container.register('StatService', {
        useClass: StatService,
    });
    app()
        .listen(port, () => {
            logger.info('Express server started on port: ' + port);
        });
});

