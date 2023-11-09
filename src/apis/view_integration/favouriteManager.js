// favouriteManager.js: Contains the functions for database operations on favourite locations

import supabase from "../../../config/supabase.js";


/**
 * Retrieves the favourite locations of a user
 * 
 * @param {string} userID - User ID
 * 
 * @returns {Promise.<Array.<string>>} - Array of favourite location dictionaries
 */
export async function getFavouriteLocation(userID) {
    const { data, error } = await supabase
        .from("favorites")
        .select("id, location_name")
        .eq("id", userID);

    if (data) {
        return data.map((item) => item.location_name);
    } else {
        return [];
    }
}


/**
 * Confirms if a location is a favourite of a user
 * 
 * @param {string} userID - User ID
 * @param {string} locationName - location name to search for
 * 
 * @returns {Promise.<boolean>} - true if the location is a favourite, false otherwise
 */
export async function checkFavouriteLocation(userID, locationName) {
    const favouriteLocations = await getFavouriteLocation(userID);
    return favouriteLocations.includes(locationName);
}


/**
 * Adds a location to a user's favourite locations
 * 
 * @param {string} userID - User ID
 * @param {string} location - location name to add
 * 
 * @returns {Promise.<string>} - error message if any, empty string otherwise
 */
export async function addFavouriteLocation(userID, location) {
    const { error } = await supabase
        .from("favorites")
        .insert({ id: userID, location_name: location });

    return error;
}


/**
 * Deletes a location from a user's favourite locations
 * 
 * @param {string} userID - User ID
 * @param {string} location - location name to delete
 * 
 * @returns {Promise.<string>} - error message if any, empty string otherwise
 */
export async function deleteFavouriteLocation(userID, location) {
    const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", userID)
        .eq("location_name", location);

    return error;
}
