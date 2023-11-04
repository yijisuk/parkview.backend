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

// API for getting the coordinates of the parking lot that:
// - is closest to the destination
// - most fits the user's preferences
// GET: /getParkingCoordinates
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

        console.log(nearbySlots)

        // TODO:
        // - get user preference parameters from supabase
        // - update on eta (DONE)
        const eta = await getEtaGMaps(originCoords, formattedAddress);
        // temporarily using dummy preferences
        const preferences = await getPreference(userId);
        // const preferences = {
        //     availability: 1,
        //     weather: 3,
        //     hourlyRate: 2,
        // };
        const rankedParkingSlots = await rankParkingSlots(
            formattedAddress,
            nearbySlots,
            preferences,
            eta
        );

        console.log(rankedParkingSlots);

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

        console.log(firstSlot);

        return res.status(200).json({ slot: firstSlot });

    } catch (error) {
        console.error("Error in /getParkingCoordinates:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// APIs for Route Searching
// GET: /getRoutes
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


// API for getting the coordinates for a given address
// GET: /getCoordinates
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

// APIs for managing favorite locations
// GET: Get Fav Location
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


// GET: Check Fav Location
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


// POST: Add fav location
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


// DELETE: Delete fav loation
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

// POST: Add Preference
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
            data = await updatePreference(req.body.id, req.body.preference);
        } else {
            data = await addPreference(req.body.id, req.body.preference);
        }

        return res.status(200).json({ data: data });

    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


// GET: Get Preference
app.get("/getPreference", jsonParser, async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: "Missing user ID." });
        }

        const preference = await getPreference(req.query.id);

        return res.status(200).json(preference);

    } catch (error) {
        console.error(`Internal Server Error: ${error}`);
        return res
            .status(500)
            .json({ error: "Internal Server Error. Please try again later." });
    }
});


// ===== UTILS & TESTING =======================================================================

// API for Voice Query Processing
// GET: /processVoiceQuery
app.get("/processVoiceQuery", async (req, res) => {
    try {
        const { uid, audioFileName } = req.query;

        if (!uid || !audioFileName) {
            return res
                .status(400)
                .json({ error: "Missing 'audioFileName' parameter in query." });
        }

        const response = await processVoiceQueryToText(uid, audioFileName);

        if (!response) {
            return res
                .status(404)
                .json({ error: "Failed to process voice query to text." });
        }

        const destination = await extractDestinationFromQuery(
            "gpt-4",
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


// Test API
// GET: /test
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
