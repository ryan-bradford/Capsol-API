export interface IStoredInvestorEstimate {
    baseAmount: number;
    fiveYearCarbonImpact: number;
    fiveYearValue: number;
    twentyYearCarbonImpact: number;
    twentyYearValue: number;
}


export class StoredInvestorEstimate {
    public baseAmount: number;
    public fiveYearCarbonImpact: number;
    public fiveYearValue: number;
    public twentyYearCarbonImpact: number;
    public twentyYearValue: number;


    constructor(
        baseAmount: number, twentyYearValue: number, fiveYearValue: number,
        twentyYearCarbonImpact: number, fiveYearCarbonImpact: number) {
        this.baseAmount = baseAmount;
        this.twentyYearValue = twentyYearValue;
        this.fiveYearValue = fiveYearValue;
        this.twentyYearCarbonImpact = twentyYearCarbonImpact;
        this.fiveYearCarbonImpact = fiveYearCarbonImpact;
    }

}
