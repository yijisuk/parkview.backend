import { SearchParkingSlots } from "./apis/non_view_integration/process_parking_slots/searchParkingSlots.js";
import { getCoordinatesFromAddress } from "./agents/alternativeGeocodingAgent.js";

const searchAddress = "National University of Singapore";

// const coordinates = await getCoordinatesFromAddress(searchAddress);
// console.log(coordinates);

const searchParkingSlots = new SearchParkingSlots(searchAddress);

const testSlots = await searchParkingSlots.processPipeline();
console.log(testSlots);