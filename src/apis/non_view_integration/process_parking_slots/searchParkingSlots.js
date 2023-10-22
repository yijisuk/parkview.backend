import { getCoordinatesFromAddress } from "../../../agents/alternativeGeocoding.js";
import { getCarParkAvailability } from "../../../agents/lta.js";
import { filterLocationsWithinDistance } from "../../../utils/searchParkingSlotsUtils.js";

export class SearchParkingSlots {
    /**
     *
     * @param {(string | Array.<number>)} locationDetails - either an address string or an array containing latitude and longitude values
     */
    constructor(locationDetails) {
        this.locationDetails = locationDetails;
        // this.locationDetails = {latitude: 1.2973076174054539, longitude: 103.77635098363267};
        this.nearbySlots = null;
        this.formattedSlots = null;
    }

    async init() {
        if (typeof this.locationDetails === "string") {
            await this.formatLocationDetails();
        }
    }

    /**
     * Formats the passed address into an array containing latitude and longitude values
     */
    async formatLocationDetails() {
        try {
            const coordinates = await getCoordinatesFromAddress(
                this.locationDetails
            );
            this.locationDetails = coordinates;
        } catch (error) {
            console.error("Error formatting location details:", error);
        }
    }

    /**
     * @returns {Array.<Object>} - Array of nearby carpark objects
     */
    async searchNearSlots(firstTrialRange, secondTrialRange) {
        const latitude = this.locationDetails.latitude;
        const longitude = this.locationDetails.longitude;

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

        return filteredSlots;
    }

    /**
     *
     * @param {boolean} filter - indicates whether to apply additional filter (based on user's preference) on parking slots
     */
    async filterSlots(filter) {}

    async returnSlots() {}

    /**
     *
     * @returns {Promise.<Array.<Object>>} - Array of finalized carpark objects
     */
    async processPipeline() {
        await this.init();
        const nearSlots = this.searchNearSlots(1, 2);

        return nearSlots;
    }
}
