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
    router.get('', adminMW, (req, res) => controller.getUsers(req, res));

    /**
     * Adds a new homeowner to the system.
     *
     * @param name the name of the user to create.
     * @param email the email of the user to create.
     * @param password the text password of the user to create.
     *
     * @throws 400 if there exists another user with the same email.
     */
    router.post('', (req, res) => controller.addUser(req, res));

    /**
     * Makes a payment for every homeowner in the system.
     */
    router.post('/payments', adminMW, (req, res) => controller.makeAllPayments(req, res));

    /**
     * Returns the `StoredHomeowner` that is represented by the given email.
     *
     * @throws 404 if the user was not found.
     */
    router.get('/:email', adminMW, (req, res) => controller.getUser(req, res));

    router.delete('/:email', adminMW, (req, res) => controller.deleteUser(req, res));

    router.put('/:email/home', adminMW, (req, res) => controller.signUpHome(req, res));

    router.get('/:email/options/:option', adminMW, (req, res) => controller.getOptionDetails(req, res));

    return router;

};
