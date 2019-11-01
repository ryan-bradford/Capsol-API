import { Router } from 'express';
import { adminMW } from '@shared';
import HomeownerController from 'src/controller/Homeowner';
import { container } from 'tsyringe';


export default () => {
    const router = Router();
    const controller = container.resolve(HomeownerController);

    /**
     * Returns the information about every `StoredHomeowner` in the system.
     */
    router.get('', adminMW, (req, res, next) =>
        controller.getUsers(req, res).catch((error) => next(error)));

    /**
     * Adds a new homeowner to the system.
     *
     * @param name the name of the user to create.
     * @param email the email of the user to create.
     * @param password the text password of the user to create.
     *
     * @throws 400 if there exists another user with the same email.
     */
    router.post('', (req, res, next) =>
        controller.addUser(req, res).catch((error) => next(error)));

    /**
     * Makes a payment for every homeowner in the system.
     */
    router.post('/payments', adminMW, (req, res, next) =>
        controller.makeAllPayments(req, res).catch((error) => next(error)));

    /**
     * Returns the `StoredHomeowner` that is represented by the given email.
     *
     * @throws 404 if the user was not found.
     */
    router.get('/:email', adminMW, (req, res, next) =>
        controller.getUser(req, res).catch((error) => next(error)));

    /**
     * Deletes the homeowner and all associated information represented by the email.
     *
     * @throws 404 if the user was not found.
     */
    router.delete('/:email', adminMW, (req, res, next) =>
        controller.deleteUser(req, res).catch((error) => next(error)));

    /**
     * Signs the user given by the email up for a contract.
     *
     * @param amount the total size of the contract.
     *
     * @throws 404 if the user was not found.
     */
    router.put('/:email/home', adminMW, (req, res, next) =>
        controller.signUpHome(req, res).catch((error) => next(error)));

    /**
     * Returns information about the given option for the given user.
     *
     * @throws 404 if the user was not found.
     */
    router.get('/:email/options/:option', adminMW, (req, res, next) =>
        controller.getOptionDetails(req, res).catch((error) => next(error)));

    return router;

};
