import randomString from 'randomstring';
import jsonwebtoken, { VerifyErrors } from 'jsonwebtoken';
import { jwtCookieExp } from './cookies';


interface IClientData {
    email: string;
    role: number;
}

export class JwtService {


    constructor() {
        this.secret = (process.env.JWT_SECRET || randomString.generate(100));
        this.options = {
            expiresIn: jwtCookieExp + ' days',
        };
    }
    private readonly options: object;

    private readonly secret: string;
    private readonly VALIDATION_ERROR = 'JSON-web-token validation failed.';


    /**
     * Decript JWT and extract client data.
     *
     * @param req
     */
    public decodeJwt(jwt: string): Promise<IClientData> {
        return new Promise((res, rej) => {
            jsonwebtoken.verify(jwt, this.secret, (err: VerifyErrors, decoded: object | string) => {
                return err ? rej(this.VALIDATION_ERROR) : res(decoded as IClientData);
            });
        });
    }


    /**
     * Encrypt data and return jwt.
     *
     * @param data
     */
    public getJwt(data: IClientData): Promise<string> {
        return new Promise((resolve, reject) => {
            jsonwebtoken.sign(data, this.secret, this.options, (err, token) => {
                err ? reject(err) : resolve(token);
            });
        });
    }
}
