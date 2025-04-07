
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
