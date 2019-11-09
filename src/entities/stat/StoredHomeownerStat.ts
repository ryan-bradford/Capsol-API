export class StoredHomeownerStat {

    public carbonReduction: number;
    public totalPanels: number;
    public totalSavings: number;


    constructor(carbonReduction: number, totalPanels: number, totalSavings: number) {
        this.carbonReduction = carbonReduction;
        this.totalPanels = totalPanels;
        this.totalSavings = totalSavings;
    }

}
