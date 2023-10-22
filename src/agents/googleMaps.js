import fetch from "node-fetch";


/**
 * 
 * @param {string} address - string of the address to be geocoded
 * @returns {Array.<number>} - array containing latitude and longitude values
 */
export async function getCoordinates(address) {

    const apiKey = process.env.GMAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {

        const latitude = data.results[0].geometry.location.lat;
        const longitude = data.results[0].geometry.location.lng;
        return { latitude, longitude };
        
    } else {
        throw new Error(`Geocoding API error: ${data.status}`);
    }
}