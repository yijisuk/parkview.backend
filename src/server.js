import express from "express";
import https from "https";
import bodyParser from 'body-parser'
import fs from "fs";
import cors from "cors";
import { processVoiceQueryToText, extractDestinationFromQuery } from "./apis/view_integration/recommend_parking_slots/userQueryFormat.js";
import { SearchParkingSlots } from "./apis/non_view_integration/process_parking_slots/searchParkingSlots.js";
import { getCoordinates, getRoutes } from "./agents/googleMaps.js";
import { getFavouriteLocation, checkFavouriteLocation, addFavouriteLocation, deleteFavouriteLocation }from "./apis/view_integration/favourite_location/favouriteManager.js";

const app = express();
const jsonParser = bodyParser.json();
const PORT = 3000;


app.use(cors());

// APIs for Voice Query Processing
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

        const destination = await extractDestinationFromQuery("gpt-4", response);

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



// APIs for Route Searching
// GET: /getRoutes
app.get("/getRoutes", async (req, res) => {

    try {
        const { originLat, originLon, destinationLat, destinationLon } =
            req.query;

        if (!originLat || !originLon || !destinationLat || !destinationLon) {
            return res
                .status(400)
                .json({
                    error: "Missing required query parameters: originLat, originLon, destinationLat, destinationLon",
                });
        }

        if (
            isNaN(originLat) ||
            isNaN(originLon) ||
            isNaN(destinationLat) ||
            isNaN(destinationLon)
        ) {
            return res
                .status(400)
                .json({
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

        const routes = await getRoutes(originCoords, destinationCoords);

        if (routes) {
            return res.status(200).json(routes);
        } else {
            return res
                .status(404)
                .json({
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


app.get("/getParkingCoordinates", async (req, res) => {

    try {
        const { destinationAddress } = req.query;

        if (!destinationAddress) {
            return res
                .status(400)
                .json({ error: "Destination address is required." });
        }

        const searchParkingSlots = new SearchParkingSlots(destinationAddress);
        const parkingSlots = await searchParkingSlots.processPipeline();

        if (!parkingSlots || parkingSlots.length === 0) {
            return res.status(404).json({ error: "No parking slots found." });
        }

        const firstSlot = parkingSlots[0];
        return res.status(200).json({ firstSlot });
    } catch (error) {
        console.error("Error in /getParkingCoordinates:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// GET: /getCoordinates
app.get("/getCoordinates", async (req, res) => {

    try {
        const { address } = req.query;

        if (!address) {
            return res
                .status(400)
                .json({ error: "Missing 'address' parameter in query." });
        }

        const coordinates = await getCoordinates(address);

        if (coordinates) {
            return res.status(200).json(coordinates);
        } else {
            return res
                .status(404)
                .json({
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


// APIs for managing favorite locations
// GET: Get Fav Location
app.get("/getFavouriteLocation", jsonParser, async(req, res) => {
	
	try {
		//console.log(req.query);
		if (!req.query["id"]){
			return res.status(400).json({error: "Missing user ID."})
		}

		const location = await getFavouriteLocation(req.query.id);

		return res.status(200).json({data: location});

	} catch (error) {
		console.error(`Internal Server Error: ${error}`);
		return res
		.status(500)
		.json({ error: "Internal Server Error. Please try again later." });

	}
});


// GET: Check Fav Location
app.get("/checkFavouriteLocation", jsonParser, async(req, res) => {

	try {
		//console.log(req.query);
		if (!req.query["id"]){
			return res.status(400).json({error: "Missing user ID."})
		}

		if (!req.query["location"]){
			return res.status(401).json({error: "Missing location."})
		}

		const isFavourite = await checkFavouriteLocation(req.query.id, req.query.location);

		return res.status(200).json({data: isFavourite});

	} catch (error) {

		console.error(`Internal Server Error: ${error}`);
		return res
		.status(500)
		.json({ error: "Internal Server Error. Please try again later." });
	}
});


// POST: Add fav location
app.post("/addFavouriteLocation", jsonParser, async(req, res) => {
	try{
		//console.log(req.query);
		if (!req.query["id"]){
			return res.status(400).json({error: "Missing user ID."})
		}
		if (!req.query["location"]){
			return res.status(401).json({error: "Missing location."})
		}

		const data = await addFavouriteLocation(req.query.id, req.query.location);

		return res.status(200).json({data: data});

	} catch (error) {
		console.error(`Internal Server Error: ${error}`);
		return res
		.status(500)
		.json({ error: "Internal Server Error. Please try again later." });

	}

});


// DELETE: Delete fav loation
app.delete("/deleteFavouriteLocation", jsonParser, async(req, res) => {
	try{
		//console.log(req.query);
		if (!req.query["id"]){
			return res.status(400).json({error: "Missing user ID."})
		}
		if (!req.query["location"]){
			return res.status(401).json({error: "Missing location."})
		}

		const data = deleteFavouriteLocation(req.query.id, req.query.location);

		return res.status(200).json({data: "OK"});

	} catch (error) {
		console.error(`Internal Server Error: ${error}`);
		return res
		.status(500)
		.json({ error: "Internal Server Error. Please try again later." });

	}
});


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