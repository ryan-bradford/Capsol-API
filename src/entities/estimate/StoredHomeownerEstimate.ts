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
        this.contractSize = Math.round(contractSize * 100) / 100;
        this.panelAmount = panelAmount;
        this.monthlyPayment = Math.round(monthlyPayment * 100) / 100;
        this.billReduction = Math.round(billReduction * 100) / 100;
        this.yearlyCarbonSavings = Math.round(yearlyCarbonSavings * 100) / 100;
        this.length = length;
    }

}
