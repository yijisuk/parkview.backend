// VECTOR OPERATIONS
// Function to compute Euclidean distance
export function calcDistance(lat1, lon1, lat2, lon2) {
    const dx = lat1 - lat2;
    const dy = lon1 - lon2;
    return Math.sqrt(dx * dx + dy * dy);
}


// Sort the parking slots by distance from a particular location
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
