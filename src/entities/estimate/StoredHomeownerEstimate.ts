export class StoredHomeownerEstimate {

    public contractSize: number;
    public monthlyPayment: number;
    public billReduction: number;
    public yearlyCarbonSavings: number;


    constructor(
        contractSize: number, monthlyPayment: number,
        billReduction: number, yearlyCarbonSavings: number) {
        this.contractSize = contractSize;
        this.monthlyPayment = monthlyPayment;
        this.billReduction = billReduction;
        this.yearlyCarbonSavings = yearlyCarbonSavings;
    }

}
