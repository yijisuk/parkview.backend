import { SearchParkingSlots } from "./apis/non_view_integration/process_parking_slots/searchParkingSlots.js";
import { getCoordinatesFromAddress } from "./agents/alternativeGeocoding.js";
import { processVoiceQuery } from "./apis/view_integration/recommend_parking_slots/userQueryFormat.js";

// test 1
// const searchAddress = "National University of Singapore";

// const coordinates = await getCoordinatesFromAddress(searchAddress);
// console.log(coordinates);

// test 2
// const searchParkingSlots = new SearchParkingSlots(searchAddress);

// const testSlots = await searchParkingSlots.processPipeline();
// console.log(testSlots);

// test 3
const name = "jfk";

processVoiceQuery(name).then((response) => {
    console.log(JSON.stringify(response));
});
