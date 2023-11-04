import { get2HWeatherForecast } from "../../../agents/external_apis/dataGov.js";
import { calcDistance } from "../../../utils/vectorOperations.js";


// PARKING LOC OPERATIONS
export function scoreLocations(parkingSlots, crit) {

    if (parkingSlots.length === 1) {
        
        const slot = parkingSlots[0];
        const commonProperties = {
            carparkId: slot.carparkId,
            area: slot.area,
            development: slot.development,
            latitude: slot.latitude,
            longitude: slot.longitude,
            availableLots: slot.availableLots,
            lotType: slot.lotType,
            agency: slot.agency,
            criterion: crit,
            score: 1,
        };

        if (crit === "hourlyRate") {
            return [
                {
                    ...commonProperties,
                    parkingRate: slot.parkingRate,
                },
            ];
        } else if (crit === "availability" || crit === "weatherCondition") {
            return [commonProperties];
        }
    }

    return parkingSlots.map((slot, index) => {
        const score = 1 - index / (parkingSlots.length - 1);

        const commonProperties = {
            carparkId: slot.carparkId,
            area: slot.area,
            development: slot.development,
            latitude: slot.latitude,
            longitude: slot.longitude,
            availableLots: slot.availableLots,
            lotType: slot.lotType,
            agency: slot.agency,
            criterion: crit,
            score: score,
        };

        if (crit === "hourlyRate") {
            return {
                ...commonProperties,
                parkingRate: slot.parkingRate,
            };
        } else if (crit === "availability" || crit === "weatherCondition") {
            return commonProperties;
        }
    });
}


// WEATHER FORECAST
export async function getLocation2HWeatherForecast(locationDetails) {
    const { latitude, longitude } = locationDetails;
    const { areaMetadata, forecasts } = await get2HWeatherForecast();

    // Find the closest location
    let closestLocation = areaMetadata[0];
    let minDistance = calcDistance(
        latitude,
        longitude,
        closestLocation.label_location.latitude,
        closestLocation.label_location.longitude
    );

    for (let location of areaMetadata) {
        let currentDistance = calcDistance(
            latitude,
            longitude,
            location.label_location.latitude,
            location.label_location.longitude
        );

        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            closestLocation = location;
        }
    }

    const districtName = closestLocation.name;
    const forecastDetails = forecasts.find(
        (forecast) => forecast.area === districtName
    );
    const forecastWeather = forecastDetails.forecast;

    return { districtName, forecastWeather };
}
