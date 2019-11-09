export class StoredHomeownerEstimate {

    public contractSize: number;
    public panelAmount: number;
    public monthlyPayment: number;
    public billReduction: number;
    public yearlyCarbonSavings: number;
    public length: number;


    constructor(
        contractSize: number, monthlyPayment: number, panelAmount: number,
        billReduction: number, yearlyCarbonSavings: number,
        length: number) {
        this.contractSize = contractSize;
        this.panelAmount = panelAmount;
        this.monthlyPayment = monthlyPayment;
        this.billReduction = billReduction;
        this.yearlyCarbonSavings = yearlyCarbonSavings;
        this.length = length;
    }

}
