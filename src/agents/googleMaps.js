import fetch from "node-fetch";
import polyline from "@mapbox/polyline";

/**
 *
 * @param {string} address - string of the address to be geocoded
 * @returns {Array.<number>} - array containing latitude and longitude values
 */
export function getCoordinates(address) {
    const apiKey = process.env.GMAPS_API_KEY;
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

export async function getRoutes(origin, destination) {
    const apiKey = process.env.GMAPS_API_KEY;
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
