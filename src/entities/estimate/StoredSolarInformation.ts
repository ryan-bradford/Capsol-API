export interface IStoredSolarInformation {

    /**
     * The size of the panels to install in kW.
     */
    panelSizeKw: number;

    /**
     * The space on the roof that receives sunlight in ft^2.
     */
    // usableRoofSpace: number;

}

export class StoredSolarInformation implements IStoredSolarInformation {

    public panelSizeKw: number;


    // public usableRoofSpace: number;


    constructor(
        panelSizeKw: number, // usableRoofSpace: number
    ) {
        this.panelSizeKw = panelSizeKw;
        // this.usableRoofSpace = usableRoofSpace;
    }

}
