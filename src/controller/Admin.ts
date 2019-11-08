import { Request, Response } from 'express';
import { IUserDao, IContractDao } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, StoredHomeowner, StoredContract, StorableHomeowner,
    IPersistedInvestor, IStorableInvestor,
} from '@entities';
import { IContractService, IRequestService } from '@services';
import { OK, CREATED } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable, inject } from 'tsyringe';
import { IDateService } from 'src/services/DateService';
import { strict as assert } from 'assert';
import { ClientError } from 'src/shared/error/ClientError';
import { NotFoundError } from 'src/shared/error/NotFound';
import { validateOrReject } from 'class-validator';

@injectable()
export default class AdminController {


    /**
     * Constructs a  `AdminController` using the given homeownerDao, contractDao, and contractService.
     */
    constructor(
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('ContractService') private contractService: IContractService,
        @inject('DateService') private dateService: IDateService,
        @inject('RequestService') private requestService: IRequestService) { }


    /**
     * Makes a payment for all homeowners with active contracts.
     */
    public async makeAllPayments(req: Request, res: Response) {
        const allContracts = await this.contractDao.getContracts();
        const date = await this.dateService.getDateAsNumber();
        await Promise.all(allContracts.map((contract) =>
            this.contractService.makePayment(contract.homeowner.email, date)));
        await this.dateService.tickTime();
        const newDate = await this.dateService.getDateAsNumber();
        assert(date === newDate - 1, `Date did not decrease by one`);
        return res.status(OK).send();
    }


    /**
     * Pairs purchase and sell requests and makes the magic happen.
     */
    public async handleInvestments(req: Request, res: Response) {
        const currentDate = await this.dateService.getDateAsNumber();
        await this.requestService.handleRequests(currentDate);
        res.status(200).send();
    }
}