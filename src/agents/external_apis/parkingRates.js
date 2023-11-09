// parkingRates.js: Contains the functions that returns the parking rates for the specified carpark for a given time.

import axios from "axios";
import { convertTo24Hour, getTodaysDate } from "../../utils/timeOperations.js";


/**
 * Retrieves the parking rate for the specified URA carpark provided for a given time.
 * 
 * @param {string} carParkID - Carpark code
 * @param {string} eta - ETA in 24 hour format
 * @param {boolean} overnight - Whether the parking is overnight
 * 
 * @returns {Promise.<number>} - Parking rate per hour
 */
export async function getURAParkingRate(carParkID, eta, overnight = false) {

    let parkingRatesData = null;

    let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Details",
        headers: {
            AccessKey: process.env.URA_ACCESS_KEY,
            Token: process.env.URA_TOKEN,
        },
    };

    try {
        const response = await axios.request(config);
        parkingRatesData = response.data.Result;
    } catch (error) {
        console.log(error);
        return null;
    }

    if (carParkID && eta) {
        // const eta24HourFormat = convertTo24Hour(eta);
        const etaTime = new Date(`1970-01-01T${eta}:00Z`);
        const dayOfWeek = getTodaysDate();

        const finalizedParkingRateData = parkingRatesData
            .filter((location) => location.vehCat === "Car")
            .filter((location) => location.ppCode == carParkID)
            .filter((location) => {
                const start24HourFormat = convertTo24Hour(location.startTime);
                const end24HourFormat = convertTo24Hour(location.endTime);
                const startTime = new Date(
                    `1970-01-01T${start24HourFormat}:00Z`
                );
                const endTime = new Date(`1970-01-01T${end24HourFormat}:00Z`);

                // If parking is overnight and the endTime is before startTime (crossing midnight)
                if (overnight && endTime < startTime) {
                    return etaTime >= startTime || etaTime <= endTime;
                }

                // Regular check for eta within the parking slot's time interval
                return etaTime >= startTime && etaTime <= endTime;
            });

        let parkingRate30m = null;

        if (dayOfWeek === 0) {
            parkingRate30m = finalizedParkingRateData[0].sunPHRate;
        } else if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            parkingRate30m = finalizedParkingRateData[0].weekdayRate;
        } else if (dayOfWeek === 6) {
            parkingRate30m = finalizedParkingRateData[0].satdayRate;
        }

        const hourlyParkingRate = parkingRate30m;
        return hourlyParkingRate;
    } else {
        console.log(
            "Unable to find parking rates for the specified carpark code."
        );
        return null;
    }
}


/**
 * Retrieves the parking rate for the specified HDB carpark provided for a given time.
 * 
 * @param {string} carParkID - Carpark code
 * @param {string} eta - ETA in 24 hour format
 * 
 * @returns {Promise.<number>} - Parking rate per hour
 */
export async function getHDBParkingRate(carParkID, eta) {

    const centralCarParks = [
        "ACB",
        "BBB",
        "BRB1",
        "CY",
        "DUXM",
        "HLM",
        "KAB",
        "KAM",
        "KAS",
        "PRM",
        "SLS",
        "SR1",
        "SR2",
        "TPM",
        "UCS",
        "WCB",
    ];

    // const eta24HourFormat = convertTo24Hour(eta);
    const [etaHour, etaMinute] = eta
        .split(":")
        .map((val) => Number(val));

    const dayOfWeek = getTodaysDate();

    if (centralCarParks.includes(carParkID)) {
        // Within Central Area

        // If it's a Sunday
        if (dayOfWeek === 0) {
            // $0.60 per half-hour
            return 1.2;
        }

        // If it's Monday to Saturday
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
            if (
                (etaHour >= 7 && etaHour < 17) ||
                (etaHour === 17 && etaMinute === 0)
            ) {
                // $1.20 per half-hour
                return 2.4;
            } else {
                // $0.60 per half-hour
                return 1.2;
            }
        }
    } else {
        // Outside Central Area
        // $0.60 per half-hour
        return 1.2;
    }
}