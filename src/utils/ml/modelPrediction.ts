
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";
import { savePredictionToSupabase } from "@/services/mlModelService";

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
    console.log("Making predictions with input data:", inputData);
    console.log("Using feature columns:", featureColumns);
    
    // Extract and normalize features
    const featureValues = inputData.map(row => {
      // Ensure all feature columns exist and convert to numbers
      return featureColumns.map(col => {
        const value = row[col];
        if (value === undefined || value === null) {
          console.warn(`Missing value for feature ${col} in row:`, row);
          return 0; // Default to 0 for missing values
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
          console.warn(`Non-numeric value for feature ${col}: ${value}`);
          return 0;
        }
        return numValue;
      });
    });
    
    console.log("Extracted feature values:", featureValues);
    
    // Create input tensor
    const inputTensor = tf.tensor2d(featureValues);
    
    // Check if tensors have compatible shapes for normalization
    if (min.shape[0] !== featureColumns.length || max.shape[0] !== featureColumns.length) {
      console.error("Normalization tensor shape mismatch:", {
        minShape: min.shape,
        maxShape: max.shape,
        featuresLength: featureColumns.length
      });
      
      // Create default min/max tensors if shapes don't match
      const defaultMin = tf.tensor1d(Array(featureColumns.length).fill(0));
      const defaultMax = tf.tensor1d(Array(featureColumns.length).fill(1)); 
      
      // Use simple 0-1 normalization as fallback
      const normalizedInput = inputTensor.div(defaultMax);
      
      // Make predictions
      const predictions = model.predict(normalizedInput) as tf.Tensor;
      console.log("Prediction output:", predictions.arraySync());
      
      // Convert to array
      return Array.from(predictions.dataSync());
    }
    
    // Normal case: normalize with provided min/max
    const normalizedInput = inputTensor.sub(min).div(max.sub(min));
    console.log("Normalized input shape:", normalizedInput.shape);
    
    // Make predictions
    const predictions = model.predict(normalizedInput) as tf.Tensor;
    console.log("Prediction tensor shape:", predictions.shape);
    console.log("Prediction output:", predictions.arraySync());
    
    // Convert to array
    return Array.from(predictions.dataSync());
  } catch (error) {
    console.error("Error making predictions:", error);
    toast.error("Failed to make predictions. Check console for details.");
    return [];
  }
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
  console.log("Saving prediction result:", predictionData);
  return await savePredictionToSupabase(
    predictionData,
    employeeId,
    modelId,
    timeFrame,
    factors
  );
};
