// googleMaps.js: Contains the functions that interacts with the Google Maps API.

import fetch from "node-fetch";
import polyline from "@mapbox/polyline";

/**
 * Geocodes the address using the Google Maps Geocoding API.
 *
 * @param {string} address - String of the address to be geocoded
 * 
 * @returns {Promise.<Object>} - Dictionary containing the latitude and longitude values
 */
export async function getCoordinatesGMaps(address) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
    )}&key=${apiKey}`;

    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "OK") {
                const latitude = data.results[0].geometry.location.lat;
                const longitude = data.results[0].geometry.location.lng;
                return { latitude: latitude, longitude: longitude };
            } else {
                console.log(address);
                console.error(`GMaps Geocoding API error: ${data.status}`);
                return null;
            }
        })
        .catch((error) => {
            console.error("Error fetching data: ", error);
            return null;
        });
}


/**
 * Retrieves the routes between the origin and destination using the Google Maps Routing API.
 * 
 * @param {Object} origin - Dictionary containing the latitude and longitude values of the origin
 * @param {Object} destination - Dictionary containing the latitude and longitude values of the destination
 * 
 * @returns {Promise<Object>} - Dictionary containing the array of coordinates that compose the routes, estimated distance and estimated time
 */
export async function getRoutesGMaps(origin, destination) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${apiKey}`;

    return fetch(apiURL)
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }

            let array = polyline.decode(
                data.routes[0].overview_polyline.points
            );

            const coordArray = array.map((point) => ({
                latitude: point[0],
                longitude: point[1],
            }));

            const estDist = data.routes[0].legs[0].distance.text;
            const estTime = data.routes[0].legs[0].duration.text;

            return {
                coordArray: coordArray,
                estDist: estDist,
                estTime: estTime,
            };
        })
        .catch((error) => {
            console.error(`GMaps Routing API error: ${error.message}`);
            return null;
        });
}


/**
 * Retrieves the estimated time of arrival between the origin and destination using the Google Maps Distance Matrix API.
 * 
 * @param {Object} origin - Dictionary containing the latitude and longitude values of the origin
 * @param {Object} destination - Dictionary containing the latitude and longitude values of the destination
 * 
 * @returns {Promise<string>} - String containing the ETA in the format of {hours}:{minutes}
 */
export async function getEtaGMaps(origin, destination) {
    const apiKey = process.env.GOOGLE_API_KEY;

    const placeIdRequestUrl = (lat, lon) => {
        return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}&enable_address_descriptor=true`;
    };

    let originResponse;
    let destinationResponse;

    try {
        originResponse = await fetch(
            placeIdRequestUrl(origin.latitude, origin.longitude)
        ).then((response) => response.json());

        destinationResponse = await fetch(
            placeIdRequestUrl(destination.latitude, destination.longitude)
        ).then((response) => response.json());
    } catch (error) {
        throw new Error("Failed to fetch Place ID: " + error.message);
    }

    if (
        originResponse.status !== "OK" ||
        !originResponse.results ||
        !originResponse.results[0] ||
        !originResponse.results[0].place_id
    ) {
        throw new Error("Unable to obtain Place ID for origin.");
    }

    if (
        destinationResponse.status !== "OK" ||
        !destinationResponse.results ||
        !destinationResponse.results[0] ||
        !destinationResponse.results[0].place_id
    ) {
        throw new Error("Unable to obtain Place ID for destination.");
    }

    const originPlaceId = originResponse.results[0].place_id;
    const destinationPlaceId = destinationResponse.results[0].place_id;

    const travelDurationRequestUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:${originPlaceId}&destinations=place_id:${destinationPlaceId}&key=${apiKey}`;

    let travelDurationResponse;

    try {
        travelDurationResponse = await fetch(travelDurationRequestUrl).then(
            (response) => response.json()
        );
    } catch (error) {
        throw new Error("Failed to fetch travel duration: " + error.message);
    }

    if (
        travelDurationResponse.status !== "OK" ||
        !travelDurationResponse.rows ||
        !travelDurationResponse.rows[0] ||
        !travelDurationResponse.rows[0].elements ||
        !travelDurationResponse.rows[0].elements[0].duration
    ) {
        throw new Error("Unable to obtain travel duration.");
    }

    const duration = travelDurationResponse.rows[0].elements[0].duration.value;

    const currentTimeInSeconds = Math.round(new Date().getTime() / 1000);
    const estimatedArrivalTimeInSeconds = currentTimeInSeconds + duration;

    const date = new Date(estimatedArrivalTimeInSeconds * 1000);
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`;

    return formattedTime;
}
