import { PersistedCompanyFee } from 'src/entities/investment/company/PersistedCompanyFee';
import { getRepository } from 'typeorm';
import { singleton, injectable, inject } from 'tsyringe';

/**
 * `ICompanyDao` is a database interface for dealing with company fees.
 */
export interface ICompanyDao {
    /**
     * Takes a fee away from the given amount.
     * Returns the amount after the fee has been taken.
     */
    takeFee(amount: number): Promise<number>;
}

/**
 * `SqlCompanyDao` is a specific implementation of `ICompanyDao` for interfacing with MySQL using TypeORM.
 */
@singleton()
@injectable()
export class SqlCompanyDao implements ICompanyDao {


    /**
     * Creates a `SqlCompanyDao` with the given `feePercentage`.
     */
    constructor(@inject('FeeRate') private feePercentage: number) {
    }


    // TODO: extract some logic to a service.
    /**
     * @inheritdoc
     */
    public async takeFee(amount: number): Promise<number> {
        const toSave = new PersistedCompanyFee();
        const feeToTake = amount * this.feePercentage;
        toSave.amount = feeToTake;
        await getRepository(PersistedCompanyFee).insert(toSave);
        return amount - feeToTake;
    }
}
