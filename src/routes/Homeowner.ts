import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';
import { adminMW, logger, paramMissingError } from '@shared';
import { IUserDao } from '@daos';
import { IContractService } from '@services';
import { NOTFOUND } from 'dns';
import { IPersistedHomeowner, IStoredHomeowner } from '@entities';


export default (homeownerDao: IUserDao<IPersistedHomeowner, IStoredHomeowner>, contractService: IContractService) => {
    const router = Router();

    router.get('', adminMW, async (req: Request, res: Response) => {
        try {
            const users = await homeownerDao.getAll();
            return res.status(OK).json({ users });
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.post('', adminMW, async (req: Request, res: Response) => {
        try {
            // Check parameters
            const { user } = req.body;
            if (!user) {
                return res.status(BAD_REQUEST).json({
                    error: paramMissingError,
                });
            }
            // Add new user
            await homeownerDao.add(user);
            return res.status(CREATED).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.get('/:email', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params;
            const user = await homeownerDao.getOne(email);
            if (user) {
                return res.status(OK).json(user);
            } else {
                return res.status(NOT_FOUND).end();
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.delete('/:email', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params as ParamsDictionary;
            const homeowner = await homeownerDao.getOne(email);
            if (!homeowner || !homeowner.id) {
                return res.status(NOT_FOUND).end();
            }
            await homeownerDao.delete(homeowner.id);
            return res.status(OK).end();
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    router.put('/:email/home', adminMW, async (req: Request, res: Response) => {
        try {
            const { email } = req.params as ParamsDictionary;
            const { amount } = req.body;
            if (!amount && !(typeof amount === 'number')) {
                throw new Error('Bad amount');
            }
            const user = await homeownerDao.getOne(email);
            if (user && user.id) {
                await contractService.createContract(amount, 0.04, 20, user);
                return res.status(OK).end();
            } else {
                return res.status(NOT_FOUND).end();
            }
        } catch (err) {
            logger.error(err.message, err);
            return res.status(BAD_REQUEST).json({
                error: err.message,
            });
        }
    });

    return router;

};
