import supabase from "../../../config/supabase.js";


export async function addPreference(userID, preference) {
    const { error } = await supabase
        .from("preferences")
        .insert({ id: userID, preferences: preference });

    return error;
}

export async function updatePreference(userID, preference) {
    const { error } = await supabase
        .from("preferences")
        .update({ preferences: preference })
        .eq("id", userID);

    return error;
}

export async function getPreference(userID) {
    const { data, error } = await supabase
        .from("preferences")
        .select("preferences")
        .eq("id", userID);

    if (error) {
        return error;
    }

    const preferences = data[0].preferences;
    return preferences;
}