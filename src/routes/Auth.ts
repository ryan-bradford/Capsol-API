import { Router } from 'express';
import { AuthController } from '@controller';
import { container } from 'tsyringe';

export default () => {
    const router = Router();
    const controller = container.resolve(AuthController);

    /**
     * Logs this user in and returns their JWT Token in the cookie if successful.
     *
     * @param username the username of the user stored in the request body.
     * @param password the text password of the user stored in the request body.
     *
     * @throws 401 if the user was found but the login was invalid.
     * @throws 404 if the user was not found.
     */
    router.post('/login', (req, res, next) =>
        controller.login(req, res).catch((error) => next(error)));


    /**
     * Logs this user out by removing their JWT Token from the cookies.
     */
    router.post('/logout', controller.logout);

    return router;

};
