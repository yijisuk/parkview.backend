// supabaseFunctions.js: Contains the functions that interacts with Supabase.

import supabase from "../../../config/supabase.js";


/**
 * Generates a signed URL that provides access to the specified file for the specified duration.
 * 
 * @param {string} uid - User ID
 * @param {string} fileName - File name to get signed URL for
 * @param {string} durationInSeconds - Valid duration of the signed URL
 * 
 * @returns {Promise.<string>} - Signed URL providing access to the specified file
 */
export async function getSignedUrlFromSupabase(
    uid,
    fileName,
    durationInSeconds
) {
    const fileFullName = `${uid}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(process.env.PARKVIEW_STORAGE_BUCKET)
        .createSignedUrl(fileFullName, durationInSeconds);

    if (error) {
        console.error("Error generating signed URL: ", error);
        return null;
    }

    return data.signedUrl;
}
