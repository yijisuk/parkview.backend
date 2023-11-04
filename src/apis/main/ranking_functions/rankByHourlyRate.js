import {
    getURAParkingRate,
    getHDBParkingRate,
} from "../../../agents/external_apis/parkingRates.js";
import { scoreLocations } from "../utils/rankParkingSlotsUtils.js";


export default class RankByHourlyRate {
    
    constructor(nearbySlots, eta) {
        this.nearbySlots = nearbySlots;
        this.slotsCount = this.nearbySlots.length;
        this.organizedSlots = [];
        this.rankedSlots = null;
        this.scoredSlots = null;
        this.eta = eta;
    }

    async init() {

        if (this.slotsCount === 0) {
            return [];
        } else if (this.slotsCount === 1) {
            const singleSlot = scoreLocations(this.nearbySlots, "hourlyRate");
            return singleSlot;
        }

        await this.organizeByParkingRates();
        await this.sortByHourlyRate();
        this.scoredSlots = scoreLocations(this.rankedSlots, "hourlyRate");
        return this.scoredSlots;
    }

    async organizeByParkingRates() {
        try {
            for (const slot of this.nearbySlots) {
                const carParkID = slot.carparkId;
                const agency = slot.agency;
                let parkingRate = null;

                if (agency === "URA") {
                    parkingRate = await getURAParkingRate(carParkID, this.eta);
                } else if (agency === "HDB") {
                    parkingRate = await getHDBParkingRate(carParkID, this.eta);
                }

                this.organizedSlots.push({
                    carparkId: slot.carparkId,
                    area: slot.area,
                    development: slot.development,
                    latitude: slot.latitude,
                    longitude: slot.longitude,
                    availableLots: slot.availableLots,
                    lotType: slot.lotType,
                    agency: slot.agency,
                    parkingRate: parkingRate,
                });
            }
        } catch (error) {
            console.error("Error organizing parking rates:", error);
        }
    }

    async sortByHourlyRate() {
        this.rankedSlots = this.organizedSlots.sort((a, b) => {
            return b.parkingRate - a.parkingRate;
        });
    }
}
