// dataGov.js: Contains the functions that interacts with the data.gov.sg API.

import axios from "axios";


/**
 * Retrieves the 2 hour weather forecast across the whole of Singapore.
 * 
 * @returns {Promise.<Object>} - Dictionary containing the area metadata and the weather forecasts
 */
export async function get2HWeatherForecast() {
    
    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast",
        headers: {},
    };

    try {
        const response = await axios.request(config);

        const areaMetadata = response.data["area_metadata"];
        const forecasts = response.data.items[0].forecasts;

        return { areaMetadata, forecasts };
    } catch (error) {
        console.log(error);
        return null;
    }
}
