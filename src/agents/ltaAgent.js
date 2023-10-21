import axios from "axios";


/**
 * 
 * @returns {Promise.<Array.<Object>>} - Array of carpark objects, retrieved from the LTA DataMall API
 */
export async function getCarParkAvailability() {

    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2",
        headers: {
            AccountKey: process.env.LTA_API_KEY,
        },
    };

    try {

        const response = await axios.request(config);
        return response.data.value;

    } catch (error) {
        
        console.log(error);
        return null;
    }
}

