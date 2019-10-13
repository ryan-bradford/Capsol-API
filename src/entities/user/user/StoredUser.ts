import { IStoredRequest } from 'src/entities/investment/request/StoredRequest';

export interface IStoredUser {
    id: number;
    name: string;
    email: string;
    pwdHash: string;
    requests: IStoredRequest[];
}

export abstract class StoredUser implements IStoredUser {

    public id: number;
    public name: string;
    public email: string;
    public pwdHash: string;
    public requests: IStoredRequest[];


    constructor(id: number, name: string, email: string, pwdHash: string, requests: IStoredRequest[]) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.pwdHash = pwdHash;
        this.requests = requests;
    }
}
