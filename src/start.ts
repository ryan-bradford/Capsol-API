import app from '@server';
import { logger } from '@shared';
import { SqlHomeownerDao, SqlInvestorDao } from './daos';
import { ContractService, InvestmentService } from '@services';

// Start the server
const port = Number(process.env.PORT || 3000);
app(new SqlHomeownerDao(),
    new SqlInvestorDao(),
    (homeownerDao) => new ContractService(homeownerDao),
    new InvestmentService())
    .listen(port, () => {
        logger.info('Express server started on port: ' + port);
    });
