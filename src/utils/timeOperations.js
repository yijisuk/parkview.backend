// timeOperations.js: Contains time operations functions

/**
 * Converts 12-hour time format to 24-hour time format
 * 
 * @param {string} timeStr - Time string in 12-hour format
 * 
 * @returns {string} - Time string in 24-hour format
 */
export function convertTo24Hour(timeStr) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(".");

    if (period.toLowerCase() === "pm" && hours !== "12") {
        hours = String(Number(hours) + 12);
    } else if (period.toLowerCase() === "am" && hours === "12") {
        hours = "00";
    }
    return `${hours}:${minutes}`;
}


/**
 * Gets today's date
 * 
 * @returns {number} - Today's date
 */
export function getTodaysDate() {
    const today = new Date();
    return today.getDay();
}
