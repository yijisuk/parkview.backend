// coordOperations.js: Contains geocoding functions

import { getCoordinatesGMaps } from "../agents/external_apis/googleMaps.js";
import { getCoordinatesFreeGeocoding } from "../agents/external_apis/alternativeGeocoding.js";


/**
 * Formats a given string address to coordinates
 * 
 * @param {string} address - Address to be formatted to coordinates
 * 
 * @returns {Promise.<Object>} - Formatted coordinates dictionary containing latitude and longitude
 */
export async function formatAddressToCoordinates(address) {

    let formattedCoordinates = null;

    try {
        const coordinates = await getCoordinatesGMaps(address);
        formattedCoordinates = coordinates;

    } catch (initialError) {
        try {
            const coordinates = await getCoordinatesFreeGeocoding(address);
            formattedCoordinates = coordinates;
        } catch (finalError) {
            console.error("Error formatting location details:", finalError);
        }
    }

    return formattedCoordinates;
}
