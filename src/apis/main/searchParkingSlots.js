import { getCarParkAvailability } from "../../agents/external_apis/lta.js";
import { filterLocationsWithinDistance } from "./utils/searchParkingSlotsUtils.js";
import { formatAddressToCoordinates } from "../../utils/coordOperations.js";


// Base class for processing nearby parking slots from a given address
export default class SearchParkingSlots {
    /**
     *
     * @param {(string | Array.<number>)} destinationAddrerss - either an address string or an array containing latitude and longitude values
     */
    constructor(destinationAddrerss) {
        this.destinationAddress = destinationAddrerss;
        this.nearbySlots = null;
        this.formattedSlots = null;
    }

    async init() {
        if (typeof this.destinationAddress === "string") {
            this.destinationAddress = await formatAddressToCoordinates(this.destinationAddress);
        }

        await this.searchNearSlots(1, 2);
        this.reformatSlotData();

        return this.formattedSlots;
    }


    /**
     * @returns {Array.<Object>} - Array of nearby carpark objects
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
