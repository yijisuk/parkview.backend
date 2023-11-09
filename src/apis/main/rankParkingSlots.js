// rankParkingSlots.js: Contains the functions that rank the parking locations based on the user's preferences.

import SearchParkingSlots from "./searchParkingSlots.js";
import RankByAvailability from "./ranking_functions/rankByAvailability.js";
import RankByHourlyRate from "./ranking_functions/rankByHourlyRate.js";
import RankByWeatherCondition from "./ranking_functions/rankByWeatherCondition.js";
import { formatAddressToCoordinates } from "../../utils/coordOperations.js";


/**
 * Main function;
 * Runs through the ranking & scoring process for the parking slots based on the user's preferences
 * 
 * @param {Object} destinationAddress - Dictionary containing the latitude and longitude of the destination
 * @param {Array<Object>} nearbySlots - Array of nearby carpark objects
 * @param {Object} preferences - Dictionary containing the user's preferences
 * @param {string} eta - Estimated time of arrival to the destination
 * 
 * @returns {Array.<Object>} - Aggregated Sorted & Scored array of nearby carpark objects based on the user's preferences
 */
export default async function rankParkingSlots(
    destinationAddress, nearbySlots, preferences, eta) {

    //error checking for preferences
    if (!preferences.hasOwnProperty('availability') || !preferences.hasOwnProperty('hourlyRate') || !preferences.hasOwnProperty('weather')){
        throw new Error("Invalid Preferences");
    }
    //error checking for invalid eta
    let pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g;
    if (!pattern.test(eta)) throw new Error("Invalid ETA"); 


    // const formattedAddress = await formatAddressToCoordinates(destinationAddress);
    const formattedAddress = destinationAddress;

    // Initially get the nearby parking slots within 1-2km range
    // const searchParkingSlots = new SearchParkingSlots(formattedAddress);
    // const nearbySlots = await searchParkingSlots.init();

    // Rank the nearby parking slots by:
    // 1. Availability
    const rankByAvailability = new RankByAvailability(nearbySlots);
    const availabilityRankedSlots = await rankByAvailability.init();

    // 2. Weather condition
    const rankByWeatherCondition = new RankByWeatherCondition(
        nearbySlots,
        formattedAddress
    );
    const weatherRankedSlots = await rankByWeatherCondition.init();

    // 3. Hourly rate
    const rankByHourlyRate = new RankByHourlyRate(nearbySlots, eta);
    const hourlyRateRankedSlots = await rankByHourlyRate.init();

    // Combine the rankings, return the final ranked slots
    const parkingSlotsAgg = {
        availability: availabilityRankedSlots,
        weather: weatherRankedSlots,
        hourlyRate: hourlyRateRankedSlots,
    };

    const combinedRankedSlots = calculateFinalScore(
        parkingSlotsAgg,
        preferences
    );

    return combinedRankedSlots;
}


/**
 * Combines the rankings of the parking locations, through calculating weighted scores based on the user's preferences
 * 
 * @param {Object} parkingSlotsAgg - Dictionary containing ranked arrays of parking locations, by availability, weather condition, and hourly rate
 * @param {Object} preferences - Dictionary containing the user's preferences
 * 
 * @returns {Object} - Dictionary containing the final ranked array of parking locations, by weighted score
 */
function calculateFinalScore(parkingSlotsAgg, preferences) {

    const availabilityRankedSlots = parkingSlotsAgg.availability;
    const weatherRankedSlots = parkingSlotsAgg.weather;
    const hourlyRateRankedSlots = parkingSlotsAgg.hourlyRate;

    const availabilityPreference = preferences.availability;
    const weatherPreference = preferences.weather;
    const hourlyRatePreference = preferences.hourlyRate;

    let groupedSlots = groupByCarparkId(
        availabilityRankedSlots,
        weatherRankedSlots,
        hourlyRateRankedSlots
    );

    groupedSlots = calculateWeightedScore(
        availabilityPreference,
        weatherPreference,
        hourlyRatePreference,
        groupedSlots
    );

    const finalRankedSlots = Object.entries(groupedSlots)
        .sort(([, a], [, b]) => b.weightedScore - a.weightedScore)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    return finalRankedSlots;
}


/**
 * Groups the parking locations by carpark ID
 * 
 * @param {Array<Object>} availabilityRankedSlots - Array of parking locations, ranked by availability
 * @param {Array<Object>} weatherRankedSlots - Array of parking locations, ranked by weather condition
 * @param {Array<Object>} hourlyRateRankedSlots - Array of parking locations, ranked by hourly rate
 * 
 * @returns {Object} - Dictionary containing the respective scores of parking locations, grouped by carpark ID,
 * where for each carpark ID, the dictionary contains the individual scores of the parking location for three criteria:
 * availability, weather condition, and hourly rate
 */
function groupByCarparkId(
    availabilityRankedSlots,
    weatherRankedSlots,
    hourlyRateRankedSlots
) {
    const groupedSlots = {};

    [
        availabilityRankedSlots,
        weatherRankedSlots,
        hourlyRateRankedSlots,
    ].forEach((rankList) => {
        rankList.forEach((item) => {
            const carparkId = item.carparkId;
            const criterion = item.criterion;
            const score = item.score;

            if (!groupedSlots.hasOwnProperty(carparkId)) {
                groupedSlots[carparkId] = {};
                groupedSlots[carparkId]["individualScores"] = {};
            }

            groupedSlots[carparkId]["individualScores"][criterion] = score;
            groupedSlots[carparkId]["weightedScore"] = -1;
        });
    });

    return groupedSlots;
}


/**
 * Calculates the weighted score of the parking locations, based on the user's preferences for the three criteria:
 * availability, weather condition, and hourly rate
 * 
 * @param {number} availabilityPreference - User's preference ranking for "availability"
 * @param {number} weatherPreference - User's preference ranking for "weather condition"
 * @param {number} hourlyRatePreference - User's preference ranking for "hourly rate"
 * @param {Array<Object>} groupedSlots - Array of parking locations, grouped by carpark ID
 * 
 * @returns {Array<Object>} - Array of parking locations, grouped by carpark ID, with weighted scores
 */
export function calculateWeightedScore(
    availabilityPreference,
    weatherPreference,
    hourlyRatePreference,
    groupedSlots
) {
    const preferencesAgg = {
        availability: availabilityPreference,
        weather: weatherPreference,
        hourlyRate: hourlyRatePreference,
    };

    const { availabilityWeight, weatherWeight, hourlyRateWeight } =
        assignWeights(preferencesAgg);

    Object.keys(groupedSlots).forEach((key) => {
        const slot = groupedSlots[key];

        const availabilityScore = slot.individualScores.availability;
        const weatherScore = slot.individualScores.weatherCondition;
        const hourlyRateScore = slot.individualScores.hourlyRate;

        const weightedScore =
            availabilityWeight * availabilityScore +
            weatherWeight * weatherScore +
            hourlyRateWeight * hourlyRateScore;

        slot.weightedScore = weightedScore;
    });

    return groupedSlots;
}


/**
 * Assigns weights to the three criteria: availability, weather condition, and hourly rate,
 * based on the user's preferences
 * 
 * @param {Object} preferencesAgg - Dictionary containing the user's preferences for the three criteria: 
 * availability, weather condition, and hourly rate
 * 
 * @returns {Object} - Dictionary containing the weights to apply for the three criteria:
 * availability, weather condition, and hourly rate
 */
function assignWeights(preferencesAgg) {

    const { availability, weather, hourlyRate } = preferencesAgg;

    // Count the number of zeros in the rankings
    const zeroCount = [availability, weather, hourlyRate].filter(
        (rank) => rank === 0
    ).length;

    let total;
    if (zeroCount === 0) {
        total = 6; // 1 + 2 + 3
    } else if (zeroCount === 1) {
        total = 3; // 1 + 2
    } else {
        total = 1; // Just the rank of 1
    }

    return {
        availabilityWeight: availability / total,
        weatherWeight: weather / total,
        hourlyRateWeight: hourlyRate / total,
    };
}
