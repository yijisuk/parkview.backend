// searchParkingSlots.js: Contains the wrapper class of functions that searches for nearby parking slots from a given address

import { getCarParkAvailability } from "../../agents/external_apis/lta.js";
import { filterLocationsWithinDistance } from "./utils/searchParkingSlotsUtils.js";
import { formatAddressToCoordinates } from "../../utils/coordOperations.js";


export default class SearchParkingSlots {

    /**
     *
     * @param {(string | Object)} destinationAddress - either an address string or a dictionary containing latitude and longitude values
     * @param {number} minDistance - minimum distance in km
     * @param {number} maxDistance - maximum distance in km
     */
    constructor(destinationAddress, minDistance = 1, maxDistance = 2) {
        this.destinationAddress = destinationAddress;
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        this.nearbySlots = null;
        this.formattedSlots = null;
    }


    /**
     * Main function;
     * Runs through the process of searching for nearby parking slots from a given address
     * 
     * @returns {Promise.<Array.<Object>>} - Array of nearby carpark objects
     */
    async init() {
        if (typeof this.destinationAddress === "string") {
            // If the destination address is a string, convert it to coordinates
            this.destinationAddress = await formatAddressToCoordinates(this.destinationAddress);
        }

        await this.searchNearSlots(this.minDistance, this.maxDistance);
        this.reformatSlotData();

        return this.formattedSlots;
    }


    /**
     * Searches for nearby parking slots from a given address, within a given range
     * 
     * @param {number} firstTrialRange - search range for the first trial in km
     * @param {number} secondTrialRange - search range for the second trial in km
     * 
     * @returns {Promise.<Array.<Object>>} - Array of nearby carpark objects
     */
    async searchNearSlots(firstTrialRange, secondTrialRange) {
        const latitude = this.destinationAddress.latitude;
        const longitude = this.destinationAddress.longitude;

        const formattedLocation = `${latitude} ${longitude}`;

        const carparks = await getCarParkAvailability();

        let filteredSlots = filterLocationsWithinDistance(
            carparks,
            formattedLocation,
            firstTrialRange
        );

        if (filteredSlots.length === 0) {
            filteredSlots = filterLocationsWithinDistance(
                carparks,
                formattedLocation,
                secondTrialRange
            );
        }

        this.nearbySlots = filteredSlots;
        // return filteredSlots;
    }


    /**
     * Reformats the parking slot data to the required format
     * 
     * @returns {Array.<Object>} - Array of nearby carpark objects
     */
    reformatSlotData() {
        this.formattedSlots = this.nearbySlots.map((slot) => {
            const {
                CarParkID,
                Area,
                Development,
                Location,
                AvailableLots,
                LotType,
                Agency,
            } = slot;
            const [latitude, longitude] = Location.split(" ").map(Number);

            return {
                carparkId: CarParkID,
                area: Area,
                development: Development,
                latitude: latitude,
                longitude: longitude,
                availableLots: AvailableLots,
                lotType: LotType,
                agency: Agency,
            };
        });
    }
}
