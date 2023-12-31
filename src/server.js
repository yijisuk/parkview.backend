// server.js: Contains the server code for the backend.

import express from "express";
import https from "https";
import bodyParser from "body-parser";
import fs from "fs";
import cors from "cors";
import {
    processVoiceQueryToText,
    extractDestinationFromQuery,
} from "./apis/view_integration/userQueryFormat.js";
import SearchParkingSlots from "./apis/main/searchParkingSlots.js";
import rankParkingSlots from "./apis/main/rankParkingSlots.js";
import {
    getCoordinatesGMaps,
    getRoutesGMaps,
    getEtaGMaps,
} from "./agents/external_apis/googleMaps.js";
import { formatAddressToCoordinates } from "./utils/coordOperations.js";
import {
    getFavouriteLocation,
    checkFavouriteLocation,
    addFavouriteLocation,
    deleteFavouriteLocation,
} from "./apis/view_integration/favouriteManager.js";
import { 
    addPreference, 
    updatePreference, 
    getPreference 
} from "./apis/view_integration/slotPreferenceManager.js";

const app = express();
const jsonParser = bodyParser.json();
const PORT = 3000;

app.use(cors());

// ===== PARKING SLOTS & ROUTING ============================================================

/**
 * API for getting the coordinates of the parking lot that:
 * - is closest to the destination
 * - most fits the user's preferences
 * 
 * GET: /getParkingCoordinates
 * 
 * @param {string} userId - The user's ID.
 * @param {string} originLat - The latitude of the user's origin. (will be parsed to float later)
 * @param {string} originLon - The longitude of the user's origin. (will be parsed to float later)
 * @param {string} destinationAddress - The user's destination address.
 * 
 * @returns {object} - Dictionary containing the parking slot details that best fits the user's preferences.
 */
app.get("/getParkingCoordinates", async (req, res) => {
    try {
        const { userId, originLat, originLon, destinationAddress } = req.query;

        if (!userId || !originLat || !originLon || !destinationAddress) {
            return res
                .status(400)
                .json({
                    error: "Missing required query parameters: originLat, originLon, destinationAddress",
                });
        }

        const formattedAddress = await formatAddressToCoordinates(
            destinationAddress
        );
        const originCoords = {
            latitude: parseFloat(originLat),
            longitude: parseFloat(originLon),
        };

        const searchParkingSlots = new SearchParkingSlots(formattedAddress);
        const nearbySlots = await searchParkingSlots.init();

        const eta = await getEtaGMaps(originCoords, formattedAddress);
        const preferences = await getPreference(userId);

        const rankedParkingSlots = await rankParkingSlots(
            formattedAddress,
            nearbySlots,
            preferences,
            eta
        );

        if (
            !rankedParkingSlots ||
            Object.keys(rankedParkingSlots).length === 0
        ) {
            return res.status(404).json({ error: "No parking slots found." });
        }

        const firstSlotId = Object.keys(rankedParkingSlots)[0];

        const firstSlot = nearbySlots.find(
            (slot) => slot.carparkId === firstSlotId
        );

        return res.status(200).json(firstSlot);

    } catch (error) {
        console.error("Error in /getParkingCoordinates:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * API for getting the details of parking slots that are within the 1 to 5km range of the user's origin.
 * GET: /getNearbyParkingSlots
 * 
 * @param {string} latitude - The latitude of the user's origin. (will be parsed to float later)
 * @param {string} longitude - The longitude of the user's origin. (will be parsed to float later)
 * 
 * @returns {object} - Dictionary containing the nearby parking slot details, within the 1 to 5km range.
 */
app.get("/getNearbyParkingSlots", async (req, res) => {

    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                error: "Missing required query parameters: originLat, originLon",
            });
        }

        const originCoords = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
        };

        const searchParkingSlots = new SearchParkingSlots(originCoords, 1, 5);
        const nearbySlots = await searchParkingSlots.init();

        return res.status(200).json(nearbySlots);

    } catch (error) {
        console.error("Error in /getNearbyParkingSlots:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * API for getting the routes between the user's origin and destination.
 * Interacts with the Google Maps Directions API.
 * 
 * GET: /getRoutes
 * 
 * @param {string} originLat - The latitude of the user's origin. (will be parsed to float later)
 * @param {string} originLon - The longitude of the user's origin. (will be parsed to float later)
 * @param {string} destinationLat - The latitude of the user's destination. (will be parsed to float later)
 * @param {string} destinationLon - The longitude of the user's destination. (will be parsed to float later)
 * 
 * @returns {object} - Dictionary containing the routes between the user's origin and destination.
 */
app.get("/getRoutes", async (req, res) => {
    try {
        const { originLat, originLon, destinationLat, destinationLon } =
            req.query;

        if (!originLat || !originLon || !destinationLat || !destinationLon) {
            return res.status(400).json({
                error: "Missing required query parameters: originLat, originLon, destinationLat, destinationLon",
            });
        }

        if (
            isNaN(originLat) ||
            isNaN(originLon) ||
            isNaN(destinationLat) ||
            isNaN(destinationLon)
        ) {
            return res.status(400).json({
                error: "Latitude and longitude values must be numbers.",
            });
        }

        const originCoords = {
            latitude: parseFloat(originLat),
            longitude: parseFloat(originLon),
        };

        const destinationCoords = {
            latitude: parseFloat(destinationLat),
            longitude: parseFloat(destinationLon),
        };

        const routes = await getRoutesGMaps(originCoords, destinationCoords);

        if (routes) {
            return res.status(200).json(routes);
        } else {
            return res.status(404).json({
                error: "Routes between the given points could not be found.",
            });
        }
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


/**
 * API for getting the coordinates for a given address.
 * Interacts with the Google Maps Geocoding API.
 * 
 * GET: /getCoordinates
 * 
 * @param {string} address - The address to get the coordinates for.
 * 
 * @returns {object} - Dictionary containing the coordinates for the given address.
 */
app.get("/getCoordinates", async (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res
                .status(400)
                .json({ error: "Missing 'address' parameter in query." });
        }

        const coordinates = await getCoordinatesGMaps(address);

        if (coordinates) {
            return res.status(200).json(coordinates);
        } else {
            return res.status(404).json({
                error: "Coordinates for the given address could not be found.",
            });
        }
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


// ===== FAVOURITE LOCATION ============================================================

/**
 * API for getting the user's favourite location.
 * 
 * GET: /getFavouriteLocation
 * 
 * @param {string} id - The user's ID.
 * 
 * @returns {object} - Array containing the dictionaries containing the user's favourite location details.
 */
app.get("/getFavouriteLocation", jsonParser, async (req, res) => {
    try {
        //console.log(req.query);
        if (!req.query["id"]) {
            return res.status(400).json({ error: "Missing user ID." });
        }

        const location = await getFavouriteLocation(req.query.id);

        return res.status(200).json({ data: location });
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


/**
 * API for checking if a given location is the user's favourite location.
 * 
 * GET: /checkFavouriteLocation
 * 
 * @param {string} id - The user's ID.
 * 
 * @returns {object} - Boolean value indicating if the given location is the user's favourite location.
 */
app.get("/checkFavouriteLocation", jsonParser, async (req, res) => {
    try {
        //console.log(req.query);
        if (!req.query["id"]) {
            return res.status(400).json({ error: "Missing user ID." });
        }

        if (!req.query["location"]) {
            return res.status(401).json({ error: "Missing location." });
        }

        const isFavourite = await checkFavouriteLocation(
            req.query.id,
            req.query.location
        );

        return res.status(200).json({ data: isFavourite });
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


/**
 * API for adding a location to the user's favourite location.
 * 
 * POST: /addFavouriteLocation
 * 
 * @param {string} id - The user's ID.
 * @param {string} location - The location to add to the user's favourite location.
 * 
 * @returns {object} - Boolean value indicating if the given location is the user's favourite location.
 */
app.post("/addFavouriteLocation", jsonParser, async (req, res) => {
    try {
        //console.log(req.query);
        if (!req.query["id"]) {
            return res.status(400).json({ error: "Missing user ID." });
        }
        if (!req.query["location"]) {
            return res.status(401).json({ error: "Missing location." });
        }

        const data = await addFavouriteLocation(
            req.query.id,
            req.query.location
        );

        return res.status(200).json({ data: data });
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


/**
 * API for deleting a location from the user's favourite location.
 * 
 * DELETE: /deleteFavouriteLocation
 * 
 * @param {string} id - The user's ID.
 * @param {string} location - The location to delete from the user's favourite location.
 * 
 * @returns {object} - Boolean value indicating if the given location is the user's favourite location.
 */
app.delete("/deleteFavouriteLocation", jsonParser, async (req, res) => {
    try {
        //console.log(req.query);
        if (!req.query["id"]) {
            return res.status(400).json({ error: "Missing user ID." });
        }
        if (!req.query["location"]) {
            return res.status(401).json({ error: "Missing location." });
        }

        const data = deleteFavouriteLocation(req.query.id, req.query.location);

        return res.status(200).json({ data: "OK" });
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


// ===== SLOT RANKING CRITERIA PREFERENCE ============================================================

/**
 * API for adding or updating a user's preference.
 * 
 * POST: /addPreference
 * 
 * @param {string} id - The user's ID.
 * @param {string} preference - The user's preference.
 * 
 * @returns {object} - Error message if there is an error, else returns null.
 */
app.post("/addPreference", jsonParser, async (req, res) => {

    try {
        const { id, preference } = req.body;

        if (!id) {
            return res.status(400).json({ error: "Missing user ID." });
        }
        if (!preference) {
            return res.status(400).json({ error: "Missing preferences." });
        }

        const userPreference = await getPreference(id);
        let data = null;

        if (userPreference) {
            // If user has existing preference, update it
            data = await updatePreference(id, preference);
        } else {
            // Else, add new preference
            data = await addPreference(id, preference);
        }

        return res.status(200).json({ data: data });

    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


/**
 * API for getting a user's preference.
 * 
 * GET: /getPreference
 * 
 * @param {string} id - The user's ID.
 * 
 * @returns {object} - Dictionary containing the user's preference details.
 */
app.get("/getPreference", jsonParser, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: "Missing user ID." });
        }

        const preference = await getPreference(id);

        return res.status(200).json(preference);

    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


// ===== UTILS & TESTING =======================================================================

/**
 * API for processing a voice query to text, and extracting the destination from the text.
 * 
 * GET: /processVoiceQuery
 * 
 * @param {string} uid - The user's ID.
 * @param {string} audioFileName - The name of the audio file containing the user's voice query.
 * 
 * @returns {object} - Dictionary containing the destination extracted from the user's voice query.
 */
app.get("/processVoiceQuery", async (req, res) => {
    try {
        const { uid, audioFileName } = req.query;
        const transcriptionModel = "whisper";
        const extractionModel = "gpt-4";

        if (!uid || !audioFileName) {
            return res
                .status(400)
                .json({ error: "Missing 'audioFileName' parameter in query." });
        }

        const response = await processVoiceQueryToText(
            transcriptionModel,
            uid,
            audioFileName
        );

        if (!response) {
            return res
                .status(404)
                .json({ error: "Failed to process voice query to text." });
        }

        const destination = await extractDestinationFromQuery(
            extractionModel,
            response
        );

        if (!destination) {
            return res
                .status(404)
                .json({ error: "Failed to extract destination from query." });
        }

        return res.status(200).json({ destination });
    } catch (error) {
        console.error("Error in /processVoiceQuery:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


/**
 * API for testing purposes.
 * Confirms whether the server is running.
 */
app.get("/test", async (req, res) => {
    try {
        console.log("Test GET request called.");
        return res.status(200).json({ message: "Test GET" });
    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
