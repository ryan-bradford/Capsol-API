import { Request, Response, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';
import { logger } from './Logger';
import { jwtCookieProps } from './cookies';
import { JwtService } from './JwtService';



// Init shared
const jwtService = new JwtService();

// Strings
export const paramMissingError = 'One or more of the required parameters was missing.';
export const loginFailedErr = 'Login failed';

// Numbers
export const pwdSaltRounds = 12;



/* Functions */

export const getRandomInt = () => {
    return Math.floor(Math.random() * 2_147_483_648);
};


// Middleware to verify if user is an admin
export const adminMW = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get json-web-token
        const jwt = req.signedCookies[jwtCookieProps.key];
        if (!jwt) {
            throw Error('JWT not present in signed cookie.');
        }
        // Make sure user role is an admin
        const clientData = await jwtService.decodeJwt(jwt);
        if (clientData.role === 1) {
            return next();
        } else {
            throw Error('User not an admin.');
        }
    } catch (err) {
        return res.status(UNAUTHORIZED).json({
            error: err.message,
        });
    }
};

// Middleware to verify if user is the requested user.
export const userMW = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get json-web-token
        const jwt = req.signedCookies[jwtCookieProps.key];
        if (!jwt) {
            throw Error('JWT not present in signed cookie.');
        }
        // Make sure user role is an admin
        const clientData = await jwtService.decodeJwt(jwt);
        if (clientData.role === 1 || clientData.email === req.params.email) {
            return next();
        } else {
            throw Error('User is not the requested user or an admin');
        }
    } catch (err) {
        return res.status(UNAUTHORIZED).json({
            error: err.message,
        });
    }
};
