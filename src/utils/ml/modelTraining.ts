
import * as tf from '@tensorflow/tfjs';
import { toast } from "sonner";

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
