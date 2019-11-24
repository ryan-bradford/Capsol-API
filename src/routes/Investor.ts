import { Router } from 'express';
import { adminMW, userMW } from '@shared';
import { InvestorController } from '@controller';
import { container } from 'tsyringe';


// Init shared
export default () => {
    const router = Router();
    const controller = container.resolve(InvestorController);

    /**
     * Returns the information about every `StoredInvestor` in the system.
     */
    router.get('', adminMW, (req, res, next) =>
        controller.getAll(req, res).catch((error) => next(error)));

    /**
     * Adds a new investor to the system.
     *
     * @param name the name of the user to create.
     * @param email the email of the user to create.
     * @param password the text password of the user to create.
     *
     * @throws 400 if there exists another user with the same email.
     */
    router.post('', (req, res, next) =>
        controller.addInvestor(req, res).catch((error) => next(error)));

    /**
     * Returns the `StoredInvestor` that is represented by the given email.
     *
     * @throws 404 if the user was not found.
     */
    router.get('/:email', userMW, (req, res, next) =>
        controller.getInvestor(req, res).catch((error) => next(error)));

    /**
     * Deletes the investor and all associated information represented by the email.
     *
     * @throws 404 if the user was not found.
     */
    router.delete('/:email', userMW, (req, res, next) =>
        controller.deleteInvestor(req, res).catch((error) => next(error)));

    /**
     * Adds funds to the account of the investor given by the email.
     *
     * @param amount the total size of the new funds.
     *
     * @throws 404 if the user was not found.
     */
    router.put('/:email/investment', userMW, (req, res, next) =>
        controller.addInvestment(req, res).catch((error) => next(error)));

    /**
     * Sells funds from the account of the investor given by the email.
     *
     * @param amount the total size of the new funds.
     *
     * @throws 404 if the user was not found.
     */
    router.put('/:email/sell', userMW, (req, res, next) =>
        controller.sellInvestment(req, res).catch((error) => next(error)));

    return router;
};
