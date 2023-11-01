import { SearchParkingSlots } from "./apis/non_view_integration/process_parking_slots/searchParkingSlots.js";
import { getCoordinatesFromAddress } from "./agents/alternativeGeocoding.js";
import { processVoiceQueryToText } from "./apis/view_integration/recommend_parking_slots/userQueryFormat.js";
import { extractDestinationFromQuery } from "./apis/view_integration/recommend_parking_slots/userQueryFormat.js";
import { getSignedUrlFromSupabase } from "./agents/supabaseFunctions.js";
import { getCoordinates, getRoutes } from "./agents/googleMaps.js";

// test 1
// const searchAddress = "National University of Singapore";

// const gMapsCoordinates = await getCoordinates(searchAddress);
// const alterMapsCoordinates = await getCoordinatesFromAddress(searchAddress);

// console.log("Google Maps: ", gMapsCoordinates);
// console.log("Alternative Maps: ", alterMapsCoordinates);

// test 2
// const searchParkingSlots = new SearchParkingSlots(searchAddress);
// const parkingSlots = await searchParkingSlots.processPipeline();

// const firstSlot = parkingSlots[0];
// console.log(firstSlot);

// test 3
// const name = "harvard";

// processVoiceQueryToText(name).then((response) => {
//     console.log(JSON.stringify(response));
// });

// test 4
// const fileName = "jfk";
// const durationInSeconds = 60;

// const signedURL = await getSignedUrlFromSupabase(fileName, durationInSeconds);
// console.log(signedURL);

// test 5
// const origin = await getCoordinates("Nanyang Technological University");
// const destination = await getCoordinates("National University of Singapore");

// const route = await getRoutes(origin, destination);

// console.log(route);

// test 6
// const test = await extractDestinationFromQuery("Hello there, ");
// console.log(test);

// test 7
// const query = "Hello there, I would like to go to National University of Singapore."
// const response = await extractDestinationFromQuery("gpt-3.5", query);
// console.log(response);

// test 8
// const fileName = "8688eac8-b231-4f4a-ab9a-6b5ed92278f2/audio-qiyrl8d6tfl.m4a";
const id = "8688eac8-b231-4f4a-ab9a-6b5ed92278f2";
const fileName = "rec-7kztxkg8hn8.m4a";
// const fileName = "harvard";
const result = await processVoiceQueryToText(id, fileName);
console.log(result);

// const url = await getSignedUrlFromSupabase(id, fileName, 60);
// console.log(url);