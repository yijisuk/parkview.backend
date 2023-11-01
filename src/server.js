import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";

import { getCoordinates, getRoutes } from "./agents/googleMaps.js";

const app = express();
const PORT = 3000;

app.use(cors());


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