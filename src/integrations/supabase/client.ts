
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ngfvobmqmalmhmtxcypw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZnZvYm1xbWFsbWhtdHhjeXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MzI5NDMsImV4cCI6MjA1OTUwODk0M30.aWGkjd9ohq6w1Un2JsO4unHB5dgoWz6pUYH12QR1dm8";

// Configure the Supabase client with auth options
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
