
import { supabase } from "@/integrations/supabase/client";
import { MLModel, Prediction, Notification, UserPreferences, AuditLog } from "@/types/ml";

// ML Models
export const fetchMLModels = async () => {
  const { data, error } = await supabase
    .from('ml_models')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as MLModel[];
};

export const fetchMLModel = async (id: string) => {
  const { data, error } = await supabase
    .from('ml_models')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data as MLModel;
};

export const createMLModel = async (model: Omit<MLModel, 'id' | 'created_at' | 'updated_at' | 'training_date'>) => {
  const { data, error } = await supabase
    .from('ml_models')
    .insert(model)
    .select()
    .single();
    
  if (error) throw error;
  return data as MLModel;
};

// Predictions
export const fetchPredictions = async () => {
  const { data, error } = await supabase
    .from('predictions')
    .select(`
      *,
      employees:employee_id (
        first_name,
        last_name,
        department
      ),
      ml_models:model_id (
        name
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as Prediction[];
};

export const createPrediction = async (prediction: Omit<Prediction, 'id' | 'created_at' | 'prediction_date'>) => {
  const { data, error } = await supabase
    .from('predictions')
    .insert(prediction)
    .select()
    .single();
    
  if (error) throw error;
  return data as Prediction;
};

// Notifications
export const fetchNotifications = async () => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as Notification[];
};

export const markNotificationAsRead = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
    
  if (error) throw error;
  return true;
};

export const deleteNotification = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

export const deleteAllNotifications = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
    
  if (error) throw error;
  return true;
};

// User Preferences
export const fetchUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data as UserPreferences | null;
};

export const saveUserPreferences = async (preferences: UserPreferences) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(preferences, { onConflict: 'user_id' })
    .select()
    .single();
    
  if (error) throw error;
  return data as UserPreferences;
};

// Audit Logs
export const fetchAuditLogs = async (options: { 
  page: number, 
  pageSize: number, 
  action?: string, 
  entity_type?: string,
  searchTerm?: string 
}) => {
  const { page, pageSize, action, entity_type, searchTerm } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  try {
    // Use a simpler query that doesn't rely on the join with profiles
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (action) {
      query = query.eq('action', action);
    }
    
    if (entity_type) {
      query = query.eq('entity_type', entity_type);
    }
    
    if (searchTerm) {
      // Search only in details column since we don't have the email join
      query = query.textSearch('details', searchTerm);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    return { 
      data: data as AuditLog[], 
      count: count || 0 
    };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { data: [], count: 0 };
  }
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'created_at' | 'user_email'>) => {
  const { error } = await supabase
    .from('audit_logs')
    .insert(log);
    
  if (error) throw error;
  return true;
};
