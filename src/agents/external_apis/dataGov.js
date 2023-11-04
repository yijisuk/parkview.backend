import axios from "axios";


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
