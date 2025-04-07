
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
    console.log("Preparing data for training with:", {
      dataLength: data.length,
      featureColumns,
      targetColumn
    });
    
    // Extract features and targets from data
    const filteredData = data.filter(row => 
      featureColumns.every(col => row[col] !== undefined && row[col] !== null && !isNaN(Number(row[col])))
      && row[targetColumn] !== undefined && row[targetColumn] !== null && !isNaN(Number(row[targetColumn]))
    );

    if (filteredData.length === 0) {
      throw new Error("No valid data found for training after filtering");
    }
    
    console.log(`Filtered data from ${data.length} to ${filteredData.length} valid rows`);

    // Extract feature values as arrays
    const featureValues = filteredData.map(row => 
      featureColumns.map(col => Number(row[col]))
    );

    // Extract target values
    const targetValues = filteredData.map(row => Number(row[targetColumn]));
    
    console.log("Feature values sample:", featureValues.slice(0, 2));
    console.log("Target values sample:", targetValues.slice(0, 2));

    // Convert to tensors
    const featuresTensor = tf.tensor2d(featureValues);
    const targetsTensor = tf.tensor1d(targetValues);

    // Normalize features (important for ML)
    const featureMin = featuresTensor.min(0);
    const featureMax = featuresTensor.max(0);
    
    console.log("Feature min values:", featureMin.arraySync());
    console.log("Feature max values:", featureMax.arraySync());
    
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
 * Prepares data for prediction only (no target column needed)
 * @param data The raw data as an array of objects
 * @param featureColumns Array of column names to use as features
 * @returns Object with features tensor and normalization values
 */
export const prepareDataForPrediction = (
  data: any[],
  featureColumns: string[]
): { features: tf.Tensor, min: tf.Tensor, max: tf.Tensor } => {
  try {
    console.log("Preparing data for prediction with:", {
      dataLength: data.length,
      featureColumns
    });
    
    // Extract features from data
    const filteredData = data.filter(row => 
      featureColumns.every(col => row[col] !== undefined && row[col] !== null && !isNaN(Number(row[col])))
    );

    if (filteredData.length === 0) {
      throw new Error("No valid data found for prediction after filtering");
    }
    
    console.log(`Filtered data from ${data.length} to ${filteredData.length} valid rows`);

    // Extract feature values as arrays
    const featureValues = filteredData.map(row => 
      featureColumns.map(col => Number(row[col]))
    );
    
    console.log("Feature values sample:", featureValues.slice(0, 2));

    // Convert to tensor
    const featuresTensor = tf.tensor2d(featureValues);

    // Calculate normalization values
    const featureMin = featuresTensor.min(0);
    const featureMax = featuresTensor.max(0);
    
    // Normalize features
    const normalizedFeatures = featuresTensor.sub(featureMin).div(featureMax.sub(featureMin));

    return {
      features: normalizedFeatures,
      min: featureMin,
      max: featureMax
    };
  } catch (error) {
    console.error("Error preparing data for prediction:", error);
    toast.error("Failed to prepare data for prediction. Check console for details.");
    throw error;
  }
};
