export interface IStoredHomeownerEstimate {
    contractSize: number;
    panelAmount: number;
    monthlyPayment: number | undefined;
    billReduction: number;
    yearlyCarbonSavings: number;
    length: number;
}

export class StoredHomeownerEstimate implements IStoredHomeownerEstimate {

    public contractSize: number;
    public panelAmount: number;
    public monthlyPayment: number | undefined;
    public billReduction: number;
    public yearlyCarbonSavings: number;
    public length: number;


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
