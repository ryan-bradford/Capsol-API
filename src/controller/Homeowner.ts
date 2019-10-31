import { Request, Response } from 'express';
import { IUserDao, IContractDao } from '@daos';
import { IPersistedHomeowner, IStorableHomeowner, StoredHomeowner, StoredContract } from '@entities';
import { IContractService } from '@services';
import { OK, CREATED, NOT_FOUND } from 'http-status-codes';
import { paramMissingError, logger } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';
import { injectable, inject } from 'tsyringe';
import { IDateService } from 'src/services/DateService';
import { assert } from 'console';

@injectable()
export default class HomeownerController {


    /**
     * Constructs a  `HomeownerController` using the given homeownerDao, contractDao, and contractService.
     */
    constructor(
        @inject('HomeownerDao') private homeownerDao: IUserDao<IPersistedHomeowner, IStorableHomeowner>,
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
            throw new Error(paramMissingError);
        }
        // Add new user
        await this.homeownerDao.add(user);
        return res.status(CREATED).send(user);
    }


    /**
     * Gets the specific user who's email is passed as a param in the req.
     * Returns the result as JSON in the res.
     */
    public async getUser(req: Request, res: Response) {
        const { email } = req.params;
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
            return res.status(NOT_FOUND).end();
        }
    }


    /**
     * Deletes the user whose email is given in the params of the req.
     */
    public async deleteUser(req: Request, res: Response) {
        const { email } = req.params as ParamsDictionary;
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        if (!homeowner || !homeowner.id) {
            return res.status(NOT_FOUND).end();
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
        if (!amount && !(typeof amount === 'number')) {
            throw new Error('Bad amount');
        }
        const user = await this.homeownerDao.getOneByEmail(email);
        if (user && user.id) {
            await this.contractService.createContract(amount, user.id);
            return res.status(OK).end();
        } else {
            return res.status(NOT_FOUND).end();
        }
    }


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
        assert(date === newDate - 1);
        return res.status(OK).send();
    }


    /**
     * Returns the details about the given option for the given homeowner.
     */
    public async getOptionDetails(req: Request, res: Response) {
        const { option, email } = req.params;
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
            default: throw new Error('Invalid option');
        }
        const homeowner = await this.homeownerDao.getOneByEmail(email);
        if (!homeowner) {
            throw new Error('Not found');
        }
        const proposedContract = await this.contractService.createContract(contractSize, homeowner.id, true);
        return res.json({
            electricity,
            contractSize,
            monthlyPayment: proposedContract.monthlyPayment,
        });
    }
}
