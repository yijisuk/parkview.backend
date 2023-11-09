// userQueryFormat.js: Contains the functions for processing user queries

import axios from "axios";
import { getSignedUrlFromSupabase } from "../../agents/supabase/supabaseFunctions.js";
import OpenAI from "openai";
import { whisperTranscription } from "../../agents/external_apis/speech_to_text/whisper.js";
import { wav2vec2Transcription } from "../../agents/external_apis/speech_to_text/wav2vec2.js";

/**
 * Processes a user's voice query to text
 *
 * @param {string} model - Model to be used for transcription
 * @param {string} uid - User id
 * @param {string} audioFileName - Name of the audio file to be processed
 * 
 * @returns {string} - Transcribed text of the audio file
 */
export async function processVoiceQueryToText(model, uid, audioFileName) {
    
    try {
        let transcribedText;

        if (model === "whisper") {
            transcribedText = await whisperTranscription(uid, audioFileName);
        } else if (model === "wav2vec2") {
            transcribedText = await wav2vec2Transcription(uid, audioFileName);
        } else {
            console.error("Invalid model specified.");
        }

        return transcribedText;

    } catch (error) {
        console.log(error);
        return null;
    }
}


/**
 * Formats the destination address from the user's query
 * 
 * @param {string} model - Model to be used for transcription
 * @param {string} query - Query to be processed
 * 
 * @returns {string} - Formatted destination address
 */
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
                    content: `Extract the user's destination from the given context. 
                        Only return the address; no extra words or punctuations, no warnings.
                        If the content cannot be comprehended, simply return a relevant message in a single sentence:
                        '${query}'`,
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
