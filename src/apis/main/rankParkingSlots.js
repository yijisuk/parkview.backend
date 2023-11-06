import SearchParkingSlots from "./searchParkingSlots.js";
import RankByAvailability from "./ranking_functions/rankByAvailability.js";
import RankByHourlyRate from "./ranking_functions/rankByHourlyRate.js";
import RankByWeatherCondition from "./ranking_functions/rankByWeatherCondition.js";
import { formatAddressToCoordinates } from "../../utils/coordOperations.js";


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


function calculateWeightedScore(
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
