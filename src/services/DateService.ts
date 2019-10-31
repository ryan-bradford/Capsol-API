import { inject, singleton } from 'tsyringe';

import { IInvestmentDao } from '@daos';

import { IRequestDao } from 'src/daos/investment/RequestDao';

/**
 * Contains the methods needed for keeping date consistent in the app.
 */
export interface IDateService {
    /**
     * Returns the month represented as a number.
     */
    getDateAsNumber(): number;

    /**
     * Adds one to the month.
     */
    tickTime(): void;

    /**
     * Calibrates the current month based on the existing database objects.
     */
    calibrateMonth(): void;
}

// TODO: actually use the service
@singleton()
export class DateService implements IDateService {

    private date = 1;


    constructor(
        @inject('InvestmentDao') private investmentDao: IInvestmentDao,
        @inject('RequestDao') private requestDao: IRequestDao) { }


    public getDateAsNumber(): number {
        return this.date;
    }


    public tickTime(): void {
        this.date += 1;
    }


    public async calibrateMonth(): Promise<void> {
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

        this.date = month;
    }


}
