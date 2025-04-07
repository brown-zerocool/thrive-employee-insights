
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";

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
