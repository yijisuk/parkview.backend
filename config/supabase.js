import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.PARKVIEW_SUPABASE_URL;
const supabaseKey = process.env.PARKVIEW_ANNON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
