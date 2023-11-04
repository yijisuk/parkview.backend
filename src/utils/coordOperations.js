import { getCoordinatesGMaps } from "../agents/external_apis/googleMaps.js";
import { getCoordinatesFreeGeocoding } from "../agents/external_apis/alternativeGeocoding.js";


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
