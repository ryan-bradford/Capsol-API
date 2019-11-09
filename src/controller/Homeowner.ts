import { Request, Response } from 'express';
import { IUserDao, IContractDao } from '@daos';
import {
    IPersistedHomeowner, IStorableHomeowner, StoredHomeowner, StoredContract, StorableHomeowner,
    IPersistedInvestor, IStorableInvestor,
} from '@entities';
import { IContractService } from '@services';
import { OK, CREATED } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable, inject } from 'tsyringe';
import { IDateService } from 'src/services/DateService';
import { strict as assert } from 'assert';
import { ClientError } from 'src/shared/error/ClientError';
import { NotFoundError } from 'src/shared/error/NotFound';
import { validateOrReject } from 'class-validator';

@injectable()
export default class HomeownerController {


    /**
     * Constructs a  `HomeownerController` using the given homeownerDao, contractDao, and contractService.
     */
    constructor(
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
        @inject('InvestorDao') private investorDao: IUserDao<IPersistedInvestor, IStorableInvestor>,
        @inject('ContractDao') private contractDao: IContractDao,
        @inject('ContractService') private contractService: IContractService,
        @inject('DateService') private dateService: IDateService) { }


    /**
     * Returns all the homeowners as JSON in the given response.
     */
    public async getUsers(req: Request, res: Response) {
        const users = await this.homeownerDao.getAll();
        const stored = await Promise.all(users.map(async (user) => {
            let contract: StoredContract | undefined;
            if (user.contract) {
                const contractInvestments = await this.contractDao.getInvestmentsForContract(user.contract.id);
                let investmentValue = 0;
                user.contract.investments = contractInvestments;
                const positionInQueue = user.contract.unsoldAmount() !== 0 ?
                    await this.contractDao.getContractPositionInQueue(user.contract.unsoldAmount()) : null;
                contractInvestments.forEach((investment) => investmentValue += investment.amount);
                contract = new StoredContract(user.contract.id, user.contract.saleAmount,
                    user.contract.totalLength, user.contract.monthlyPayment, user.contract.firstPaymentDate,
                    investmentValue / user.contract.saleAmount, positionInQueue, user.id);
            }
            return new StoredHomeowner(user.id, user.name, user.email, user.pwdHash, contract);
        }));
        return res.status(OK).json({ users: stored });
    }


    /**
     * Adds the homeowner given in the body of the req and returns the new user as JSON in the res.
     */
    public async addUser(req: Request, res: Response) {
        // Check parameters
        const { user } = req.body;
        if (!user) {
            throw new ClientError(`Need to provide a user in the JSON body`);
        }
        // Add new user
        const currentHomeowner = await this.homeownerDao.getOne(user.email);
        const currentInvestor = await this.investorDao.getOne(user.email);
        if (currentHomeowner || currentInvestor) {
            throw new ClientError(`User wth email ${user.email} already exists`);
        }
        const toAdd = new StorableHomeowner(user.name, user.email, user.password);
        await validateOrReject(toAdd).catch((error) => {
            throw new ClientError(error);
        });
        await this.homeownerDao.add(toAdd);
        return res.status(CREATED).send(user);
    }


    /**
     * Gets the specific user who's email is passed as a param in the req.
     * Returns the result as JSON in the res.
     */
    public async getUser(req: Request, res: Response) {
        const { email } = req.params;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user) {
            let contract: StoredContract | undefined;
            if (user.contract) {
                const contractInvestments = await this.contractDao.getInvestmentsForContract(user.contract.id);
                user.contract.investments = contractInvestments;
                const positionInQueue = user.contract.unsoldAmount() !== 0 ?
                    await this.contractDao.getContractPositionInQueue(user.contract.unsoldAmount()) : null;
                let investmentValue = 0;
                contractInvestments.forEach((investment) => investmentValue += investment.amount);
                contract = new StoredContract(user.contract.id, user.contract.saleAmount,
                    user.contract.totalLength, user.contract.monthlyPayment, user.contract.firstPaymentDate,
                    investmentValue / user.contract.saleAmount, positionInQueue, user.id);
            }
            return res.status(OK).json(new StoredHomeowner(user.id, user.name, user.email, user.pwdHash, contract));
        } else {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
    }


    /**
     * Deletes the user whose email is given in the params of the req.
     */
    public async deleteUser(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        if (!homeowner) {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
        await this.homeownerDao.delete(homeowner.id);
        return res.status(OK).end();
    }


    /**
     * Signs up the user whose email is given in the params of the req for an
     * investment of the amount given in the body.
     */
    public async signUpHome(req: Request, res: Response) {
        const { email } = req.params;
        const { amount } = req.body;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        if (amount === undefined || typeof amount !== 'number' || amount < 0) {
            throw new ClientError('Need to provide an amount in the body');
        }
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user) {
            await this.contractService.createContract(amount, user.id);
            return res.status(OK).end();
        } else {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
    }


    /**
     * Returns the details about the given option for the given homeowner.
     */
    public async getOptionDetails(req: Request, res: Response) {
        const { option, email } = req.params;
        if (!email || typeof email !== 'string') {
            throw new ClientError('Need to provide a string email in the URL params');
        }
        if (option === undefined || typeof option !== 'string') {
            throw new ClientError('Need to provide an option in the params');
        }
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        if (!homeowner) {
            throw new NotFoundError(`User with email ${email} was not found`);
        }
        let contractSize;
        let electricity;
        switch (option) {
            case '0': {
                contractSize = 6000;
                electricity = 60;
                break;
            }
            case '1': {
                contractSize = 10000;
                electricity = 100;
                break;
            }
            case '2': {
                contractSize = 15000;
                electricity = 150;
                break;
            }
            default: throw new ClientError('Invalid option');
        }
        const monthlyPayment = await this.contractService.getContractPrice(contractSize, 20);
        return res.json({
            electricity,
            contractSize,
            monthlyPayment,
        });
    }
}
