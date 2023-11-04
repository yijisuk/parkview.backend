// TIME OPERATIONS
// Function to convert 12-hour time format to 24-hour time format
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


// Function to get today's date
export function getTodaysDate() {
    const today = new Date();
    return today.getDay();
}
