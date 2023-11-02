import axios from "axios";
import { getSignedUrlFromSupabase } from "../../../agents/supabaseFunctions.js";
import OpenAI from "openai";


/**
 * 
 * @param {string} audioFileName - name of the audio file to be processed
 * @returns {string} - Returns the transcribed text of the audio file
 */
export async function processVoiceQueryToText(uid, audioFileName) {

    try {
        const audioFileURL = await getSignedUrlFromSupabase(uid, audioFileName, 60);
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


export async function extractDestinationFromQuery(model, query) {

    try {
        // Validate model
        let useModel;
        if (model === "gpt-3.5") {
            useModel = "gpt-3.5-turbo";
        } else if (model === "gpt-4") {
            useModel = "gpt-4";
        } else {
            throw new Error("Invalid model specified.");
        }

        // Validate query
        if (!query || typeof query !== "string" || query.trim().length === 0) {
            throw new Error("Invalid query specified.");
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You assist the user's search of nearby parking slots.",
                },
                {
                    role: "user",
                    content: `Extract the user's destination from the given context. Only return the address; no extra words or punctuations, no warnings: '${query}'`,
                },
            ],
            model: useModel,
        });

        const destination = completion.choices[0].message.content;

        // Validate extracted destination
        if (
            !destination ||
            typeof destination !== "string" ||
            destination.trim().length === 0
        ) {
            throw new Error(
                "Failed to extract a valid destination from the query."
            );
        }

        return destination;

    } catch (error) {
        console.error("Error in extractDestinationFromQuery:", error);
        throw error;
    }
}
