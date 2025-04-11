
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

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

// Create a type-safe helper function for our custom tables
export const from = <T extends keyof Database['public']['Tables']>(
  table: T
) => supabase.from(table);

// Export type-safe functions for each table
export const fromAuditLogs = () => from('audit_logs');
export const fromNotifications = () => from('notifications');
export const fromUserPreferences = () => from('user_preferences');
export const fromEmployees = () => from('employees');
export const fromMlModels = () => from('ml_models');
export const fromPredictions = () => from('predictions');
export const fromProfiles = () => from('profiles');
