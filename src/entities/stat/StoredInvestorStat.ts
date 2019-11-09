export class StoredInvestorStat {

    public carbonReduction: number;
    public totalPortfolio: number;
    public targetRate: number;


    constructor(carbonReduction: number, totalPortfolio: number, targetRate: number) {
        this.carbonReduction = carbonReduction;
        this.totalPortfolio = totalPortfolio;
        this.targetRate = targetRate;
    }

}
