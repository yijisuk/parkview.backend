// alternativeGeoCoding.js: Contains the function that geocodes addresses using the geocode.maps.co API.
// Built in case the Google Maps Geocoding API fails.

import fetch from "node-fetch";

/**
 *
 * @param {string} address - string of the address to be geocoded
 * 
 * @returns {Promise.<Object>} - array containing latitude and longitude values
 */
export async function getCoordinatesFreeGeocoding(address) {
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(
        address
    )}`;

    try {
        const response = await fetch(url);

        const data = await response.json();
        const firstResult = data[0];

        const latitude = firstResult.lat;
        const longitude = firstResult.lon;

        return { latitude, longitude };
    } catch (error) {
        console.log(`Geocoding API error: ${error}`);
        return null;
    }
}
