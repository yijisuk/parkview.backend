// rankByAvailability.js: Contains the wrapper class of functions that ranks the parking locations by slot availability.

import { scoreLocations } from "../utils/rankParkingSlotsUtils.js";


export default class RankByAvailability {

    /**
     * 
     * @param {Array.<Object>} nearbySlots - Array of nearby carpark objects
     */
    constructor(nearbySlots) {
        this.nearbySlots = nearbySlots;
        this.slotsCount = this.nearbySlots.length;
        this.rankedSlots = null;
        this.scoredSlots = null;
    }


    /**
     * Main function;
     * Runs through the ranking & scoring process for the parking slots based on availability
     * 
     * @returns {Promise.<Array.<Object>>} - Sorted & Scored array of nearby carpark objects based on availability slots
     */
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
     * Sorts the parking locations by slot availability
     * 
     * @param {string} lotType - Type of vehicle lot
     * 
     * @returns {Promise.<Array.<Object>>} - Sorted array of nearby carpark objects based on availability slots
     */
    async sortByAvailability(lotType) {
        this.rankedSlots = this.nearbySlots
            .filter(
                (location) =>
                    location.availableLots > 0 && location.lotType === lotType
            )
            .sort((a, b) => {
                return b.availableLots - a.availableLots;
            });
    }
}