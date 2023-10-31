import express from "express";
import https from "https";
import bodyParser from 'body-parser'
import fs from "fs";
import cors from "cors";
import { getFavouriteLocation, addFavouriteLocation, deleteFavouriteLocation }from "./apis/view_integration/favourite_location/favouriteManager.js";


const app = express();
const jsonParser = bodyParser.json();
const PORT = 3000;


app.use(cors());

//get Fav Location
app.get("/favouriteLocation", jsonParser, async(req, res) => {
	
	try{
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

//add fav location
app.post("/favouriteLocation", jsonParser, async(req, res) => {
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

//delete fav loation
app.delete("/favouriteLocation", jsonParser, async(req, res) => {
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


app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}/`);
});