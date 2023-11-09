// slotPreferenceManager.js: Contains the functions for database operations on user preferences for parking location recommendation criteria

import supabase from "../../../config/supabase.js";


/**
 * Saves the preference data of a new user
 * 
 * @param {string} userID - User ID
 * @param {Object} preference - Dictionary of preferences to save
 * 
 * @returns {Promise.<string>} - error message if any, empty string otherwise
 */
export async function addPreference(userID, preference) {
    const { error } = await supabase
        .from("preferences")
        .insert({ id: userID, preferences: preference });

    return error;
}


/**
 * Updates the preference data of a user
 * 
 * @param {string} userID - User ID
 * @param {Object} preference - Dictionary of preferences to update
 * 
 * @returns {Promise.<string>} - error message if any, empty string otherwise
 */
export async function updatePreference(userID, preference) {
    const { error } = await supabase
        .from("preferences")
        .update({ preferences: preference })
        .eq("id", userID);

    return error;
}


/**
 * Retrieves the preference data of a user
 * 
 * @param {string} userID - User ID
 * 
 * @returns {Promise.<Object>} - Dictionary of preferences if any, null otherwise
 */
export async function getPreference(userID) {
    const { data, error } = await supabase
        .from("preferences")
        .select("preferences")
        .eq("id", userID);

    if (error || data.length === 0) {
        // Return null or handle the error accordingly if there's an error or no data
        return null;
    }

    const preferences = data[0].preferences;
    return preferences;
}
