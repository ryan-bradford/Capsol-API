export interface IStoredHomeownerEstimate {
    billReduction: number;
    contractSize: number;
    length: number;
    monthlyPayment: number | undefined;
    panelAmount: number;
    yearlyCarbonSavings: number;
}

export class StoredHomeownerEstimate implements IStoredHomeownerEstimate {
    public billReduction: number;

    public contractSize: number;
    public length: number;
    public monthlyPayment: number | undefined;
    public panelAmount: number;
    public yearlyCarbonSavings: number;


    constructor(
        contractSize: number, panelAmount: number,
        billReduction: number, yearlyCarbonSavings: number,
        length: number) {
        this.contractSize = Math.round(contractSize * 100) / 100;
        this.panelAmount = Math.round(panelAmount * 100) / 100;
        this.billReduction = Math.round(billReduction * 100) / 100;
        this.yearlyCarbonSavings = Math.round(yearlyCarbonSavings * 100) / 100;
        this.length = length;
    }

}
