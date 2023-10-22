import fetch from "node-fetch";


/**
 * 
 * @param {string} address - string of the address to be geocoded
 * @returns {Array.<number>} - array containing latitude and longitude values
 */
export async function getCoordinatesFromAddress(address) {
    
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
