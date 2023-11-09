// vectorOperations.js: Contains the functions for vector operations

/**
 * Computes the Euclidean distance between two points
 * 
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * 
 * @returns {number} - Euclidean distance between the two points
 */
export function calcDistance(lat1, lon1, lat2, lon2) {
    const dx = lat1 - lat2;
    const dy = lon1 - lon2;
    return Math.sqrt(dx * dx + dy * dy);
}


/**
 * Sorts the parking slots by distance from a particular location
 * 
 * @param {Array<Object>} nearbySlots - Array of parking slots
 * @param {number} destLatitude - Latitude of the destination
 * @param {number} destLongitude - Longitude of the destination
 * @returns 
 */
export function sortByDistance(nearbySlots, destLatitude, destLongitude) {
    return nearbySlots.sort((a, b) => {
        const aDistance = calcDistance(
            destLatitude,
            destLongitude,
            a.latitude,
            a.longitude
        );
        const bDistance = calcDistance(
            destLatitude,
            destLongitude,
            b.latitude,
            b.longitude
        );
        return aDistance - bDistance;
    });
}
