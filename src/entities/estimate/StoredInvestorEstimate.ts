
export class StoredInvestorEstimate {
    public baseAmount: number;
    public twentyYearValue: number;
    public fiveYearValue: number;
    public twentyYearCarbonImpact: number;
    public fiveYearCarbonImpact: number;


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
