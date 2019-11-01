import { inject, singleton, injectable } from 'tsyringe';

import { IInvestmentDao } from '@daos';

import { IRequestDao } from 'src/daos/investment/RequestDao';
import { logger } from '@shared';

/**
 * Contains the methods needed for keeping date consistent in the app.
 */
export interface IDateService {
    /**
     * Returns the month represented as a number.
     */
    getDateAsNumber(): Promise<number>;

    /**
     * Adds one to the month.
     */
    tickTime(): Promise<void>;

    /**
     * Calibrates the current month based on the existing database objects.
     */
    calibrateMonth(): Promise<number>;
}

@singleton()
@injectable()
export class DateService implements IDateService {

    private date: Promise<number>;


    constructor(
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('RequestDao') private requestDao: IRequestDao) {
        this.date = this.calibrateMonth();
    }


    /**
     * @inheritdoc
     */
    public getDateAsNumber(): Promise<number> {
        return this.date;
    }


    /**
     * @inheritdoc
     */
    public async tickTime(): Promise<void> {
        this.date = this.date.then((current) => current + 1);
    }


    /**
     * @inheritdoc
     */
    public async calibrateMonth(): Promise<number> {
        const [investments, requests] = await Promise.all([
            this.investmentDao.getInvestments(),
            this.requestDao.getRequests(),
        ]);

        let month = 1;
        investments.forEach((investment) => {
            month = Math.max(month, investment.purchaseDate);
        });

        requests.forEach((request) => {
            month = Math.max(month, request.dateCreated);
        });
        logger.info(`Start Month: ${month}`);
        return month;
    }


}
