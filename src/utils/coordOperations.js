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

    const coordinates = await getCoordinatesGMaps(address);
    formattedCoordinates = coordinates;

    if (formattedCoordinates === null) {
        formattedCoordinates = await getCoordinatesFreeGeocoding(address);
    }

    return formattedCoordinates;
}
