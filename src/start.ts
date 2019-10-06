import app from '@server';
import { logger } from '@shared';
import { ContractService, InvestmentService } from '@services';
import { getDaos } from '@daos';

// Start the server
const port = Number(process.env.PORT || 3000);
getDaos().then((daos) => {
    app(new daos.SqlHomeownerDao(),
        new daos.SqlInvestorDao(),
        (homeownerDao) => new ContractService(homeownerDao),
        new InvestmentService())
        .listen(port, () => {
            logger.info('Express server started on port: ' + port);
        });
});

