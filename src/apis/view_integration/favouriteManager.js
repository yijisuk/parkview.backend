import supabase from "../../../config/supabase.js";


export async function getFavouriteLocation(userID) {
    const { data, error } = await supabase
        .from("favorites")
        .select("id, location_name")
        .eq("id", userID);

    if (data) {
        return data.map((item) => item.location_name);
    } else {
        return [];
    }
}


export async function checkFavouriteLocation(userID, locationName) {
    const favouriteLocations = await getFavouriteLocation(userID);
    return favouriteLocations.includes(locationName);
}


export async function addFavouriteLocation(userID, location) {
    const { error } = await supabase
        .from("favorites")
        .insert({ id: userID, location_name: location });

    return error;
}


export async function deleteFavouriteLocation(userID, location) {
    const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", userID)
        .eq("location_name", location);

    return error;
}
