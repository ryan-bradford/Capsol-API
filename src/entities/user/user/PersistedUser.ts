import { Column, Entity, TableInheritance, PrimaryGeneratedColumn } from 'typeorm';

export interface IPersistedUser {
    id: string;
    name: string;
    email: string;
    pwdHash: string;
    readonly admin: boolean;
}

@Entity('user')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class PersistedUser implements IPersistedUser {

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public name!: string;

    @Column()
    public email!: string;

    @Column()
    public pwdHash!: string;

    @Column()
    public admin!: boolean;

}
