import { supabase } from "@/integrations/supabase/client";

// Supabase generated types currently don't include our public tables in this project.
// We centralize the (intentional) escape hatch so the rest of the app stays clean.
export const db = supabase as unknown as any;
