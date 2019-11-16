export class StoredHomeownerStat {

    public carbonReduction: number;
    public totalPanels: number;
    public totalSavings: number;


    constructor(carbonReduction: number, totalPanels: number, totalSavings: number) {
        this.carbonReduction = Math.round(carbonReduction / 10) * 10;
        this.totalPanels = Math.round(totalPanels / 10) * 10;
        this.totalSavings = Math.round(totalSavings / 100) * 100;
    }

}
