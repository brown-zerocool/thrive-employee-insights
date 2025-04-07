
import { supabase } from "@/integrations/supabase/client";
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";

interface ModelMetrics {
  mse: number;
  rmse: number;
  r2: number;
}

interface SaveModelParams {
  name: string;
  description?: string;
  modelType: string;
  features: string[];
  parameters?: any;
  metrics?: ModelMetrics;
}

export const saveModelToSupabase = async (
  model: tf.LayersModel,
  params: SaveModelParams
): Promise<string | null> => {
  try {
    // First save the model locally to get its serialized format
    await model.save(`localstorage://${params.name}`);
    
    // Get model info for normalization
    const modelInfo = localStorage.getItem(`localstorage://${params.name}_info`);
    
    // Create a record in the ml_models table
    const { data, error } = await supabase
      .from('ml_models')
      .insert({
        name: params.name,
        description: params.description || `Model trained on ${params.features.length} features`,
        model_type: params.modelType,
        features: params.features,
        parameters: params.parameters || {},
        metrics: params.metrics || {},
        model_data: modelInfo ? JSON.parse(modelInfo) : null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error saving model to Supabase:", error);
      toast.error("Failed to save model to database");
      return null;
    }
    
    toast.success("Model saved to database successfully");
    return data.id;
  } catch (error) {
    console.error("Error in saveModelToSupabase:", error);
    toast.error("Failed to save model");
    return null;
  }
};

export const listModelsFromSupabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('ml_models')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching models from Supabase:", error);
      toast.error("Failed to fetch models");
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in listModelsFromSupabase:", error);
    toast.error("Failed to fetch models");
    return [];
  }
};

export const deleteModelFromSupabase = async (modelId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('ml_models')
      .delete()
      .eq('id', modelId);
    
    if (error) {
      console.error("Error deleting model from Supabase:", error);
      toast.error("Failed to delete model");
      return false;
    }
    
    toast.success("Model deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteModelFromSupabase:", error);
    toast.error("Failed to delete model");
    return false;
  }
};

export const savePredictionToSupabase = async (
  prediction: any,
  employeeId?: string,
  modelId?: string,
  timeFrame?: string,
  factors?: any
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        prediction_result: prediction,
        employee_id: employeeId,
        model_id: modelId,
        time_frame: timeFrame,
        factors: factors || {},
        confidence_score: prediction.confidence || null,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error saving prediction to Supabase:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in savePredictionToSupabase:", error);
    return null;
  }
};

export const getPredictionHistoryFromSupabase = async (
  employeeId?: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    let query = supabase
      .from('predictions')
      .select('*')
      .order('prediction_date', { ascending: false })
      .limit(limit);
    
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching predictions from Supabase:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPredictionHistoryFromSupabase:", error);
    return [];
  }
};
