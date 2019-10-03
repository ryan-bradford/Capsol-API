export interface IStorableUser {
    name: string;
    email: string;
    pwdHash: string;
}

export abstract class StorableUser implements IStorableUser {

    public name: string;
    public email: string;
    public pwdHash: string;


    constructor(name: string, email: string, pwdHash: string) {
        this.name = name;
        this.email = email;
        this.pwdHash = pwdHash;
    }
}
