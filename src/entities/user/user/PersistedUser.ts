import { PrimaryColumn, Column, OneToMany, JoinColumn, Entity, TableInheritance } from 'typeorm';
import { IPersistedRequest, PersistedRequest } from 'src/entities/investment/request/PersistedRequest';

export interface IPersistedUser {
    id: number;
    name: string;
    email: string;
    pwdHash: string;
    readonly admin: boolean;
}

@Entity('user')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class PersistedUser implements IPersistedUser {

    @PrimaryColumn()
    public id!: number;

    @Column()
    public name!: string;

    @Column()
    public email!: string;

    @Column()
    public pwdHash!: string;

    @Column()
    public admin!: boolean;

}
