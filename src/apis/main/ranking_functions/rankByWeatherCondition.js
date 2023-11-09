// rankByWeatherCondition.js: Contains the wrapper class of functions that ranks the parking locations by weather condition suitability.

import { getLocation2HWeatherForecast } from "../utils/rankParkingSlotsUtils.js";
import { sortByDistance } from "../../../utils/vectorOperations.js";
import { scoreLocations } from "../utils/rankParkingSlotsUtils.js";


export default class RankByWeatherCondition {
    
    /**
     * 
     * @param {Array<Object>} nearbySlots - Array of nearby carpark objects
     * @param {Object} destinationAddress - Dictionary containing the latitude and longitude of the destination
     */
    constructor(nearbySlots, destinationAddress) {
        this.districtName = null;
        this.weatherData = null;
        this.nearbySlots = nearbySlots;
        this.slotsCount = this.nearbySlots.length;
        this.destinationAddress = destinationAddress;
        this.rankedSlots = null;
        this.scoredSlots = null;
    }


    /**
     * Main function;
     * Runs through the ranking & scoring process for the parking slots based on weather condition suitability
     * 
     * @returns {Promise.<Array.<Object>>} - Sorted & Scored array of nearby carpark objects based on weather condition suitability
     */
    async init() {

        if (this.slotsCount === 0) {
            return [];

        } else if (this.slotsCount === 1) {
            const singleSlot = scoreLocations(this.nearbySlots, "weatherCondition");
            return singleSlot;
        }

        await this.filterByWeatherCondition();
        this.scoredSlots = scoreLocations(this.rankedSlots, "weatherCondition");
        return this.scoredSlots;
    }


    /**
     * Filters the parking locations by weather condition suitability
     * 
     * @returns {Promise.<Array.<Object>>} - Sorted array of nearby carpark objects based on weather condition suitability
     */
    async filterByWeatherCondition() {
        const { districtName, forecastWeather } =
            await getLocation2HWeatherForecast(this.destinationAddress);
        const { destLatitude, destLongitude } = this.destinationAddress;

        this.districtName = districtName;
        this.forecastWeather = forecastWeather;

        let rankedSlots = [];

        if (this.forecastWeather.includes("Showers")) {
            rankedSlots = sortByDistance(
                this.nearbySlots.filter((location) => location.agency == "LTA"),
                destLatitude,
                destLongitude
            );
        }

        this.rankedSlots = rankedSlots.length
            ? rankedSlots
            : sortByDistance(this.nearbySlots, destLatitude, destLongitude);
    }
}
