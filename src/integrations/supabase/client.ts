// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lxlnulbsrtbwiougnzlh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4bG51bGJzcnRid2lvdWduemxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NzkxMzAsImV4cCI6MjA1NDM1NTEzMH0.gp6VnjiGLiPMETsPyRF0C5gcIMXdlOsLM02b6TZKjwI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);