export function filterLocationsWithinDistance(
    locations,
    currentLocation,
    maxDistance
) {
    const [currentLat, currentLon] = currentLocation.split(" ").map(Number);

    return locations.filter((location) => {
        const [lat, lon] = location.Location.split(" ").map(Number);
        const distance = haversineDistance(
            [currentLat, currentLon],
            [lat, lon]
        );
        return distance <= maxDistance;
    });
}

function haversineDistance([lat1, lon1], [lat2, lon2]) {
    // Radius of the Earth in km
    const R = 6371;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}
