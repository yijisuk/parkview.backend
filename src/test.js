import SearchParkingSlots from "./apis/main/searchParkingSlots.js";
import { processVoiceQueryToText } from "./apis/view_integration/userQueryFormat.js";
import { extractDestinationFromQuery } from "./apis/view_integration/userQueryFormat.js";
import { getSignedUrlFromSupabase } from "./agents/supabase/supabaseFunctions.js";
import {
    getCoordinatesGMaps,
    getRoutesGMaps,
    getEtaGMaps,
} from "./agents/external_apis/googleMaps.js";
import { getCoordinatesFreeGeocoding } from "./agents/external_apis/alternativeGeocoding.js";
import { whisperTranscription } from "./agents/external_apis/speech_to_text/whisper.js";

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
// const id = "8688eac8-b231-4f4a-ab9a-6b5ed92278f2";
// const fileName = "rec-7kztxkg8hn8.m4a";
// const fileName = "harvard";
// const result = await processVoiceQueryToText(id, fileName);
// console.log(result);

// const url = await getSignedUrlFromSupabase(id, fileName, 60);
// console.log(url);

// test 9
// const originAddress = "Nanyang Technological University";
// const destinationAddress = "National University of Singapore";

// const originCoords = await getCoordinatesGMaps(originAddress);
// const destinationCoords = await getCoordinatesGMaps(destinationAddress);

// const dd = await getEtaGMaps(originCoords, destinationCoords);
// console.log(dd);

// test 10
const uid = "a99450e5-130a-4afe-ba8b-0f24411282dc";
const fileName = "rec-f8iibxjxsvs.m4a";

const transcription = await processVoiceQueryToText("whisper", uid, fileName);
const dest = await extractDestinationFromQuery("gpt-4", transcription);

console.log(dest);
