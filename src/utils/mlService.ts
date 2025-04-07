
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";
import { saveModelToSupabase, savePredictionToSupabase } from "@/services/mlModelService";

/**
 * Processes data for training by extracting features and targets
 * @param data The raw data as an array of objects
 * @param featureColumns Array of column names to use as features
 * @param targetColumn Column name to predict
 * @returns Object with features and targets as tensors
 */
export const prepareDataForTraining = (
  data: any[],
  featureColumns: string[],
  targetColumn: string
): { features: tf.Tensor, targets: tf.Tensor, featureNames: string[], min: tf.Tensor, max: tf.Tensor } => {
  try {
    // Extract features and targets from data
    const filteredData = data.filter(row => 
      featureColumns.every(col => row[col] !== undefined && row[col] !== null && !isNaN(Number(row[col])))
      && row[targetColumn] !== undefined && row[targetColumn] !== null && !isNaN(Number(row[targetColumn]))
    );

    if (filteredData.length === 0) {
      throw new Error("No valid data found for training after filtering");
    }

    // Extract feature values as arrays
    const featureValues = filteredData.map(row => 
      featureColumns.map(col => Number(row[col]))
    );

    // Extract target values
    const targetValues = filteredData.map(row => Number(row[targetColumn]));

    // Convert to tensors
    const featuresTensor = tf.tensor2d(featureValues);
    const targetsTensor = tf.tensor1d(targetValues);

    // Normalize features (important for ML)
    const featureMin = featuresTensor.min(0);
    const featureMax = featuresTensor.max(0);
    const normalizedFeatures = featuresTensor.sub(featureMin).div(featureMax.sub(featureMin));

    return {
      features: normalizedFeatures,
      targets: targetsTensor,
      featureNames: featureColumns,
      min: featureMin,
      max: featureMax
    };
  } catch (error) {
    console.error("Error preparing data for training:", error);
    toast.error("Failed to prepare data for training. Check console for details.");
    throw error;
  }
};

/**
 * Creates and trains a simple neural network model
 * @param features Training features tensor
 * @param targets Training targets tensor
 * @param epochs Number of training epochs
 * @returns Trained tensorflow model
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
    const result = await model.fit(features, targets, {
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
 * Makes predictions using a trained model
 * @param model Trained TensorFlow model
 * @param inputData Input data for predictions
 * @param featureColumns Feature columns to use
 * @param min Min values for normalization
 * @param max Max values for normalization
 * @returns Array of prediction values
 */
export const makePredictions = (
  model: tf.LayersModel,
  inputData: any[],
  featureColumns: string[],
  min: tf.Tensor,
  max: tf.Tensor
): number[] => {
  try {
    // Extract and normalize features
    const featureValues = inputData.map(row => 
      featureColumns.map(col => Number(row[col]))
    );
    
    const inputTensor = tf.tensor2d(featureValues);
    const normalizedInput = inputTensor.sub(min).div(max.sub(min));
    
    // Make predictions
    const predictions = model.predict(normalizedInput) as tf.Tensor;
    
    // Convert to array
    return Array.from(predictions.dataSync());
  } catch (error) {
    console.error("Error making predictions:", error);
    toast.error("Failed to make predictions. Check console for details.");
    return [];
  }
};

/**
 * Evaluates model performance on test data
 * @param model Trained model
 * @param testFeatures Test features
 * @param testTargets Test targets
 * @returns Object with evaluation metrics
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
  const r2 = 1 - residualVariance.div(totalVariance).dataSync()[0];
  
  return { mse, rmse, r2 };
};

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

/**
 * Save prediction results to database
 * @param predictionData The prediction data object
 * @param modelId Optional ID of the model used
 * @param employeeId Optional ID of the employee
 */
export const savePredictionResult = async (
  predictionData: any,
  modelId?: string,
  employeeId?: string,
  timeFrame?: string,
  factors?: any
): Promise<string | null> => {
  return await savePredictionToSupabase(
    predictionData,
    employeeId,
    modelId,
    timeFrame,
    factors
  );
};
