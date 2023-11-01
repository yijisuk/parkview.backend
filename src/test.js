import { SearchParkingSlots } from "./apis/non_view_integration/process_parking_slots/searchParkingSlots.js";
import { getCoordinatesFromAddress } from "./agents/alternativeGeocoding.js";
import { processVoiceQuery } from "./apis/view_integration/recommend_parking_slots/userQueryFormat.js";
import { getSignedUrlFromSupabase } from "./agents/supabaseFunctions.js";
import { getCoordinates, getRoutes } from "./agents/googleMaps.js";

// test 1
// const searchAddress = "National University of Singapore";

// const coordinates = await getCoordinatesFromAddress(searchAddress);
// console.log(coordinates);

// test 2
// const searchParkingSlots = new SearchParkingSlots(searchAddress);

// const testSlots = await searchParkingSlots.processPipeline();
// console.log(testSlots);

// test 3
// const name = "jfk";

// processVoiceQuery(name).then((response) => {
//     console.log(JSON.stringify(response));
// });

// test 4
// const fileName = "jfk";
// const durationInSeconds = 60;

// const signedURL = await getSignedUrlFromSupabase(fileName, durationInSeconds);
// console.log(signedURL);

// test 5
const origin = await getCoordinates("Nanyang Technological University");
const destination = await getCoordinates("National University of Singapore");

const route = await getRoutes(origin, destination);

console.log(route);
