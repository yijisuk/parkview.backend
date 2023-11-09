// whisper.js: Contains the function that transcribes audio files using the OpenAI whisper model.

import { getSignedUrlFromSupabase } from "../../supabase/supabaseFunctions.js";

/**
 * Transcribes the audio file using the OpenAI whisper model.
 *
 * @param {string} uid - user id
 * @param {string} audioFileName - name of the audio file to be processed
 * 
 * @returns {Promise.<string>} - Returns the transcribed text of the audio file
 */
export async function whisperTranscription(uid, audioFileName) {

    const audioFileURL = await getSignedUrlFromSupabase(uid, audioFileName, 60);

    const audioResponse = await fetch(audioFileURL);
    const audioBlob = await audioResponse.blob();

    // Append the audio blob to the FormData
    const formData = new FormData();
    formData.append("file", audioBlob, audioFileName);
    formData.append("model", "whisper-1");

    try {
        const response = await fetch(
            "https://api.openai.com/v1/audio/transcriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: formData,
            }
        );

        const result = await response.json();

        if (response.ok && result.text) {
            return result.text;
        } else {
            console.error("Unexpected result or error:", result);
            return null;
        }
    } catch (error) {
        console.error("Error during OpenAI transcription process:", error);
        return null;
    }
}
