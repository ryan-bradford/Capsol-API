import { Column, Entity, TableInheritance, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Represents all the information stored in the database for users.
 */
export interface IPersistedUser {
    /**
     * Whether or not this user is an admin.
     */
    readonly admin: boolean;
    /**
     * The email of this user.
     *
     * @unique
     */
    email: string;
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
     * The hashed password of this user.
     */
    pwdHash: string;
}

@Entity('user')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class PersistedUser implements IPersistedUser {

    @Column()
    public admin!: boolean;

    @Column()
    public email!: string;

    @PrimaryGeneratedColumn('uuid')
    public id!: string;

    @Column()
    public name!: string;

    @Column()
    public pwdHash!: string;

}
