
import * as tf from '@tensorflow/tfjs';
import { supabase } from "@/integrations/supabase/client";
import { saveModelToSupabase } from "@/services/mlModelService";
import { toast } from "sonner";

export interface ModelWithNormalization {
  model: tf.LayersModel;
  min: Record<string, number>;
  max: Record<string, number>;
}

export const loadModel = async (modelId: string): Promise<ModelWithNormalization> => {
  // Get model data from database
  const { data: modelData, error } = await supabase
    .from('ml_models')
    .select('model_data')
    .eq('id', modelId)
    .single();
    
  if (error) throw error;
  if (!modelData?.model_data) throw new Error("Model data not found");
  
  // Extract parameters and model definition
  const modelJson = modelData.model_data as any;
  const modelDefinition = modelJson.modelDefinition;
  const min = modelJson.min || {};
  const max = modelJson.max || {};
  
  // Load model from json
  const model = await tf.loadLayersModel(
    tf.io.fromMemory(modelDefinition)
  );
  
  return { model, min, max };
};

/**
 * Prepares data for ML training by normalizing features
 */
export const prepareDataForTraining = (
  data: any[],
  featureColumns: string[],
  targetColumn: string
): { 
  features: tf.Tensor2D; 
  targets: tf.Tensor1D; 
  featureNames: string[]; 
  min: tf.Tensor; 
  max: tf.Tensor 
} => {
  // Extract features and targets
  const featureData: number[][] = data.map(row => {
    return featureColumns.map(col => Number(row[col]));
  });

  const targetData: number[] = data.map(row => Number(row[targetColumn]));

  // Convert to tensors
  const featuresTensor = tf.tensor2d(featureData);
  const targetsTensor = tf.tensor1d(targetData);

  // Normalize features (min-max scaling)
  const featureMin = featuresTensor.min(0);
  const featureMax = featuresTensor.max(0);
  
  const normalizedFeatures = featuresTensor.sub(featureMin).div(
    featureMax.sub(featureMin).add(tf.scalar(1e-6))
  );

  return {
    features: normalizedFeatures as tf.Tensor2D,
    targets: targetsTensor,
    featureNames: featureColumns,
    min: featureMin,
    max: featureMax
  };
};

/**
 * Creates and trains a simple neural network model
 */
export const trainModel = async (
  features: tf.Tensor,
  targets: tf.Tensor,
  epochs: number = 100
): Promise<tf.LayersModel> => {
  // Create a simple neural network model
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({
    inputShape: [features.shape[1]],
    units: 10,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 5,
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({
    units: 1
  }));
  
  // Compile the model
  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
    metrics: ['mse']
  });
  
  // Train the model
  try {
    await model.fit(features, targets, {
      epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(5)}`);
          }
        }
      }
    });
    
    return model;
  } catch (error) {
    console.error("Error training model:", error);
    toast.error("Failed to train model. Check console for details.");
    throw error;
  }
};

/**
 * Evaluates model performance on test data
 */
export const evaluateModel = (
  model: tf.LayersModel,
  testFeatures: tf.Tensor,
  testTargets: tf.Tensor
): { mse: number, rmse: number, r2: number } => {
  // Predict with test data
  const predictions = model.predict(testFeatures) as tf.Tensor;
  
  // Calculate MSE
  const mse = tf.losses.meanSquaredError(testTargets, predictions).dataSync()[0];
  
  // Calculate RMSE
  const rmse = Math.sqrt(mse);
  
  // Calculate R-squared (coefficient of determination)
  const targetMean = tf.mean(testTargets);
  const totalVariance = tf.sum(testTargets.sub(targetMean).square());
  const residualVariance = tf.sum(testTargets.sub(predictions).square());
  const r2 = 1 - (residualVariance.div(totalVariance).dataSync()[0]);
  
  return { mse, rmse, r2 };
};

/**
 * Makes predictions using a trained model
 */
export const makePredictions = (
  model: tf.LayersModel,
  data: any[],
  featureColumns: string[],
  min: Record<string, number>,
  max: Record<string, number>
): number[] => {
  // Extract features
  const featureData: number[][] = data.map(row => {
    return featureColumns.map(col => Number(row[col]));
  });

  // Convert to tensor
  const featuresTensor = tf.tensor2d(featureData);
  
  // Normalize features using the same min-max values from training
  const minTensor = tf.tensor1d(Object.values(min));
  const maxTensor = tf.tensor1d(Object.values(max));
  
  const normalizedFeatures = featuresTensor.sub(minTensor).div(
    maxTensor.sub(minTensor).add(tf.scalar(1e-6))
  );
  
  // Make predictions
  const predictionsTensor = model.predict(normalizedFeatures) as tf.Tensor;
  const predictions = predictionsTensor.dataSync();
  
  // Clean up tensors
  featuresTensor.dispose();
  normalizedFeatures.dispose();
  predictionsTensor.dispose();
  minTensor.dispose();
  maxTensor.dispose();
  
  return Array.from(predictions);
};

/**
 * Saves model to localStorage and Supabase
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
 * Saves prediction result to Supabase
 */
export const savePredictionResult = async (
  result: any,
  modelId: string,
  employeeId: string
) => {
  try {
    const { error } = await supabase
      .from('predictions')
      .insert({
        prediction_result: result,
        model_id: modelId,
        employee_id: employeeId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving prediction result:", error);
    return false;
  }
};

/**
 * Lists all saved models in localStorage
 */
export const listSavedModels = async (): Promise<string[]> => {
  try {
    const models: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('localstorage://') && !key.endsWith('_info')) {
        models.push(key.replace('localstorage://', ''));
      }
    }
    return models;
  } catch (error) {
    console.error("Error listing saved models:", error);
    return [];
  }
};

