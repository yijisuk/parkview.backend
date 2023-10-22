import axios from "axios";
import { getSignedUrlFromSupabase } from "../../../agents/supabaseFunctions.js";


/**
 * 
 * @param {string} audioFileName - name of the audio file to be processed
 * @returns {string} - Returns the transcribed text of the audio file
 */
export async function processVoiceQuery(audioFileName) {

    const audioFileURL = await getSignedUrlFromSupabase(audioFileName);

    try {
        const audioResponse = await axios.get(audioFileURL, {
            responseType: "arraybuffer",
        });
        const wavData = Buffer.from(audioResponse.data);

        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
            {
                headers: {
                    Authorization: `Bearer ${process.env.HFACE_API_KEY}`,
                },
                method: "POST",
                body: wavData,
            }
        );

        const result = await response.json();

        if (result && result.text) {
            const transcribedText = result.text.toLowerCase();
            return transcribedText;

        } else {
            console.log("Unexpected result shape:", result);
            return null;
        }

    } catch (error) {
        console.log(error);
        return null;
    }
}
