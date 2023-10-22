import supabase from "../../config/supabase.js";


export async function getSignedUrlFromSupabase(fileName) {
    
    const { data, error } = await supabase.storage
        .from("audiofiles")
        .createSignedUrl(`${fileName}.wav`, 60);

    if (error) {
        console.error("Error generating signed URL: ", error);
        return null;
    }

    return data.signedURL;
}
