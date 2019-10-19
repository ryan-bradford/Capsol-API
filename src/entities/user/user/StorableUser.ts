export interface IStorableUser {
    name: string;
    email: string;
    password: string;
}

export abstract class StorableUser implements IStorableUser {

    public name: string;
    public email: string;
    public password: string;


    constructor(name: string, email: string, password: string) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
