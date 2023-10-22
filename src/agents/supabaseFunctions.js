import supabase from "../../config/supabase.js";


export async function getSignedUrlFromSupabase(fileName, durationInSeconds) {

    const fileFullName = `temp/${fileName}.wav`;
    
    const { data, error } = await supabase.storage
        .from(process.env.PARKVIEW_STORAGE_BUCKET)
        .createSignedUrl(fileFullName, durationInSeconds);

    if (error) {
        console.error("Error generating signed URL: ", error);
        return null;
    }

    return data.signedUrl;
}
