import { scoreLocations } from "../utils/rankParkingSlotsUtils.js";


export default class RankByAvailability {

    constructor(nearbySlots) {
        this.nearbySlots = nearbySlots;
        this.slotsCount = this.nearbySlots.length;
        this.rankedSlots = null;
        this.scoredSlots = null;
    }

    async init() {

        if (this.slotsCount === 0) {
            return [];
        } else if (this.slotsCount === 1) {
            const singleSlot = scoreLocations(this.nearbySlots, "availability");
            return singleSlot;
        }

        await this.sortByAvailability("C");
        this.scoredSlots = scoreLocations(this.rankedSlots, "availability");
        return this.scoredSlots;
    }

    /**
     * @param  {Array.<Object>} - Sorted array of nearby carpark objects based on availability slots, {String} - lotType
     * @returns {Array.<Object>} - Sorted array of nearby carpark objects based on availability slots
     * Function also filter out lots with 0 availbility and by lot type, sorting the parking slots based on descending order
     */
    async sortByAvailability(lotType) {
        this.rankedSlots = this.nearbySlots
            .filter(
                (location) =>
                    location.availableLots > 0 && location.lotType === lotType // Filtering slots with positive availability count
            )
            .sort((a, b) => {
                return b.availableLots - a.availableLots; // Sorting slots by availability in descending order
            });
    }
}