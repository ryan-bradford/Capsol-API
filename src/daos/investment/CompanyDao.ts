import { PersistedCompanyFee } from 'src/entities/investment/company/PersistedCompanyFee';
import { getRepository } from 'typeorm';
import { singleton, injectable, inject } from 'tsyringe';

export interface ICompanyDao {
    takeFee(amount: number): Promise<number>;
}

@singleton()
@injectable()
export class SqlCompanyDao implements ICompanyDao {


    constructor(@inject('FeeRate') private feePercentage: number) { }


    public async takeFee(amount: number): Promise<number> {
        const toSave = new PersistedCompanyFee();
        const feeToTake = amount * this.feePercentage;
        toSave.amount = amount;
        await getRepository(PersistedCompanyFee).save(toSave);
        return amount - feeToTake;
    }

}
