
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";
import { saveModelToSupabase } from "@/services/mlModelService";

/**
 * Saves a model to localStorage and Supabase
 * @param model Model to save
 * @param modelName Custom name for the model
 * @param features Feature columns used for training
 * @param metrics Evaluation metrics
 */
export const saveModel = async (
  model: tf.LayersModel, 
  modelName: string, 
  features: string[],
  metrics?: { mse: number, rmse: number, r2: number }
): Promise<string | null> => {
  try {
    // First save to localStorage
    await model.save(`localstorage://${modelName}`);
    
    // Then save to Supabase if user is authenticated
    const modelId = await saveModelToSupabase(model, {
      name: modelName,
      modelType: "neural_network",
      features: features,
      metrics
    });
    
    toast.success(`Model "${modelName}" saved successfully`);
    return modelId;
  } catch (error) {
    console.error("Error saving model:", error);
    toast.error("Failed to save model");
    return null;
  }
};

/**
 * Loads a model from localStorage
 * @param modelName Name of the model to load
 * @returns The loaded model or null if not found
 */
export const loadModel = async (modelName: string): Promise<tf.LayersModel | null> => {
  try {
    const model = await tf.loadLayersModel(`localstorage://${modelName}`);
    toast.success(`Model "${modelName}" loaded successfully`);
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    toast.error("Failed to load model");
    return null;
  }
};

/**
 * Lists all saved models in localStorage
 * @returns Array of saved model names
 */
export const listSavedModels = (): string[] => {
  const models: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('localstorage://') && !key.endsWith('_info')) {
      models.push(key.replace('localstorage://', ''));
    }
  }
  return models;
};
