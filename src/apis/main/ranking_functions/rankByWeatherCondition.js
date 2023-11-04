import { getLocation2HWeatherForecast } from "../utils/rankParkingSlotsUtils.js";
import { sortByDistance } from "../../../utils/vectorOperations.js";
import { scoreLocations } from "../utils/rankParkingSlotsUtils.js";


export default class RankByWeatherCondition {
    
    constructor(nearbySlots, destinationAddress) {
        this.districtName = null;
        this.weatherData = null;
        this.nearbySlots = nearbySlots;
        this.slotsCount = this.nearbySlots.length;
        this.destinationAddress = destinationAddress;
        this.rankedSlots = null;
        this.scoredSlots = null;
    }

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
