import { Column, Entity, TableInheritance, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Represents all the information stored in the database for users.
 */
export interface IPersistedUser {
    /**
     * The ID of this user.
     *
     * @unique
     */
    id: string;
    /**
     * The full name of this user.
     */
    name: string;
    /**
     * The email of this user.
     *
     * @unique
     */
    email: string;
    /**
     * The hashed password of this user.
     */
    pwdHash: string;
    /**
     * Whether or not this user is an admin.
     */
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
