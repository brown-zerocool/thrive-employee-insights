import * as tf from "@tensorflow/tfjs";

// Types
export interface TrainingData {
  trainX: tf.Tensor;
  trainY: tf.Tensor;
  testX: tf.Tensor;
  testY: tf.Tensor;
  featureNames: string[];
  normalization: {
    min: Record<string, number>;
    max: Record<string, number>;
  };
}

export interface TrainModelParams {
  modelType: string;
  trainX: tf.Tensor;
  trainY: tf.Tensor;
  params: any;
  onEpochEnd?: (epoch: number, logs: any) => void;
}

export interface EvaluateModelParams {
  model: tf.LayersModel;
  testX: tf.Tensor;
  testY: tf.Tensor;
  featureNames: string[];
}

export interface SaveModelParams {
  model: tf.LayersModel;
  name: string;
  modelType: string;
  featureNames: string[];
  metrics: any;
  normalization: {
    min: Record<string, number>;
    max: Record<string, number>;
  };
}

export interface ModelWithNormalization {
  model: tf.LayersModel;
  normalization: {
    min: Record<string, number>;
    max: Record<string, number>;
  };
  featureNames: string[];
  name: string;
  metrics: any;
}

// Data preparation function
export const prepareDataForTraining = (data: any[]): Promise<TrainingData> => {
  return new Promise((resolve) => {
    // Extract features and target
    const featureNames = Object.keys(data[0]).filter(
      (key) => key !== "id" && key !== "target" && key !== "left_company"
    );
    
    // Normalize data
    const { normalizedData, min, max } = normalizeData(data, featureNames);
    
    // Split data into features and target
    const X = normalizedData.map((row) => 
      featureNames.map((feature) => row[feature])
    );
    
    const y = data.map((row) => {
      // Check which column contains the target variable
      if ('left_company' in row) return row.left_company;
      if ('target' in row) return row.target;
      return 0; // Default fallback
    });
    
    // Convert to tensors
    const xTensor = tf.tensor2d(X);
    const yTensor = tf.tensor1d(y).expandDims(1);
    
    // Split data into training and testing sets (80/20 split)
    const splitIdx = Math.floor(data.length * 0.8);
    
    const trainX = xTensor.slice([0, 0], [splitIdx, featureNames.length]);
    const testX = xTensor.slice([splitIdx, 0], [data.length - splitIdx, featureNames.length]);
    
    const trainY = yTensor.slice([0, 0], [splitIdx, 1]);
    const testY = yTensor.slice([splitIdx, 0], [data.length - splitIdx, 1]);
    
    resolve({
      trainX,
      trainY,
      testX,
      testY,
      featureNames,
      normalization: { min, max },
    });
  });
};

// Helper function to normalize data
const normalizeData = (data: any[], features: string[]) => {
  // Calculate min and max for each feature
  const min: Record<string, number> = {};
  const max: Record<string, number> = {};
  
  features.forEach((feature) => {
    min[feature] = Math.min(...data.map((row) => row[feature] || 0));
    max[feature] = Math.max(...data.map((row) => row[feature] || 0));
  });
  
  // Normalize data
  const normalizedData = data.map((row) => {
    const normalizedRow: Record<string, any> = { ...row };
    
    features.forEach((feature) => {
      if (max[feature] - min[feature] !== 0) {
        normalizedRow[feature] = (row[feature] - min[feature]) / (max[feature] - min[feature]);
      } else {
        normalizedRow[feature] = 0;
      }
    });
    
    return normalizedRow;
  });
  
  return { normalizedData, min, max };
};

// Function to train a model
export const trainModel = async (params: TrainModelParams): Promise<tf.LayersModel> => {
  const { modelType, trainX, trainY, params: modelParams, onEpochEnd } = params;
  
  let model: tf.LayersModel;
  
  if (modelType === "neuralNetwork") {
    model = tf.sequential();
    
    // Add input layer
    model.layers.push(tf.layers.dense({
      units: modelParams.hiddenLayers[0],
      activation: 'relu',
      inputShape: [trainX.shape[1]],
    }));
    
    // Add hidden layers
    for (let i = 1; i < modelParams.hiddenLayers.length; i++) {
      model.layers.push(tf.layers.dense({
        units: modelParams.hiddenLayers[i],
        activation: 'relu',
      }));
    }
    
    // Add output layer
    model.layers.push(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    }));
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(modelParams.learningRate),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    
    // Train the model
    await model.fit(trainX, trainY, {
      epochs: modelParams.epochs,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd) onEpochEnd(epoch, logs);
        },
      },
    });
  } else {
    // For now, since we can't fully implement random forest or xgboost in TensorFlow.js,
    // we'll use a simpler neural network as a substitute
    model = tf.sequential();
    
    model.layers.push(tf.layers.dense({
      units: 10,
      activation: 'relu',
      inputShape: [trainX.shape[1]],
    }));
    
    model.layers.push(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
    
    await model.fit(trainX, trainY, {
      epochs: 20,
      validationSplit: 0.1,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd) onEpochEnd(epoch, logs);
        },
      },
    });
  }
  
  return model;
};

// Function to evaluate a model
export const evaluateModel = async (params: EvaluateModelParams): Promise<any> => {
  const { model, testX, testY, featureNames } = params;
  
  // Evaluate the model
  const evalResult = await model.evaluate(testX, testY) as tf.Scalar[];
  const loss = evalResult[0].dataSync()[0];
  const accuracy = evalResult[1].dataSync()[0];
  
  // Calculate precision, recall and F1 score
  const predictions = model.predict(testX) as tf.Tensor;
  const predictionData = await predictions.dataSync();
  const testYData = await testY.dataSync();
  
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  for (let i = 0; i < predictionData.length; i++) {
    const predicted = predictionData[i] >= 0.5 ? 1 : 0;
    const actual = testYData[i];
    
    if (predicted === 1 && actual === 1) truePositives++;
    if (predicted === 1 && actual === 0) falsePositives++;
    if (predicted === 0 && actual === 1) falseNegatives++;
  }
  
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
  
  // Calculate feature importance (simplified approach)
  const featureImportance = await calculateFeatureImportance(model, testX, testY, featureNames);
  
  predictions.dispose();
  
  return {
    loss,
    accuracy,
    precision,
    recall,
    f1Score,
    featureImportance,
  };
};

// Function to calculate feature importance
const calculateFeatureImportance = async (
  model: tf.LayersModel, 
  testX: tf.Tensor, 
  testY: tf.Tensor,
  featureNames: string[]
): Promise<Array<{name: string; importance: number}>> => {
  const basePerformance = await evaluateBasePerformance(model, testX, testY);
  
  const importanceScores: Array<{name: string; importance: number}> = [];
  
  for (let i = 0; i < featureNames.length; i++) {
    // Create a perturbed version of testX where feature i is shuffled
    const perturbedX = testX.clone();
    const values = perturbedX.slice([0, i], [testX.shape[0], 1]);
    const shuffledValues = tf.reverse(values, 0);
    
    const update = tf.buffer(perturbedX.shape);
    for (let j = 0; j < testX.shape[0]; j++) {
      for (let k = 0; k < testX.shape[1]; k++) {
        if (k === i) {
          update.set(shuffledValues.dataSync()[j], j, k);
        } else {
          update.set(perturbedX.dataSync()[j * testX.shape[1] + k], j, k);
        }
      }
    }
    
    const perturbedXTensor = update.toTensor();
    
    // Evaluate performance on perturbed data
    const perturbedPerformance = await evaluateBasePerformance(model, perturbedXTensor, testY);
    
    // Calculate importance as decrease in performance
    const importance = Math.max(0, basePerformance - perturbedPerformance);
    
    importanceScores.push({
      name: featureNames[i],
      importance,
    });
    
    perturbedXTensor.dispose();
  }
  
  // Normalize importance scores
  const totalImportance = importanceScores.reduce((sum, item) => sum + item.importance, 0);
  
  if (totalImportance > 0) {
    importanceScores.forEach(item => {
      item.importance = item.importance / totalImportance;
    });
  }
  
  // Sort by importance
  importanceScores.sort((a, b) => b.importance - a.importance);
  
  return importanceScores;
};

// Helper function to evaluate base performance
const evaluateBasePerformance = async (
  model: tf.LayersModel, 
  x: tf.Tensor, 
  y: tf.Tensor
): Promise<number> => {
  const evalResult = await model.evaluate(x, y) as tf.Scalar[];
  const accuracy = evalResult[1].dataSync()[0];
  return accuracy;
};

// Function to save a model
export const saveModel = async (params: SaveModelParams): Promise<void> => {
  const { model, name, modelType, featureNames, metrics, normalization } = params;
  
  // In a real app, this would save to backend storage
  // For now, we'll just save to localStorage for demo purposes
  
  // First, save the model using tf.js model saving
  await model.save(`localstorage://${name}`);
  
  // Save metadata
  const modelInfo = {
    name,
    modelType,
    featureNames,
    metrics,
    normalization,
    createdAt: new Date().toISOString(),
  };
  
  // Get existing models or initialize empty array
  const existingModelsJSON = localStorage.getItem('savedModels');
  const existingModels = existingModelsJSON ? JSON.parse(existingModelsJSON) : [];
  
  // Add new model info
  existingModels.push(modelInfo);
  
  // Save back to localStorage
  localStorage.setItem('savedModels', JSON.stringify(existingModels));
};

// Function to load a model
export const loadModel = async (name: string): Promise<ModelWithNormalization> => {
  // Load model from storage
  const model = await tf.loadLayersModel(`localstorage://${name}`);
  
  // Get metadata
  const existingModelsJSON = localStorage.getItem('savedModels');
  const existingModels = existingModelsJSON ? JSON.parse(existingModelsJSON) : [];
  
  const modelInfo = existingModels.find((m: any) => m.name === name);
  
  if (!modelInfo) {
    throw new Error(`Model metadata for ${name} not found`);
  }
  
  return {
    model,
    normalization: modelInfo.normalization,
    featureNames: modelInfo.featureNames,
    name: modelInfo.name,
    metrics: modelInfo.metrics,
  };
};

// Function to list saved models
export const listSavedModels = (): any[] => {
  const modelsJSON = localStorage.getItem('savedModels');
  if (!modelsJSON) return [];
  
  return JSON.parse(modelsJSON);
};

// Function to delete a model
export const deleteModel = async (name: string): Promise<void> => {
  // Remove from localStorage (tf.js models)
  const models = await tf.io.listModels();
  const modelKey = `localstorage://${name}`;
  
  if (models[modelKey]) {
    await tf.io.removeModel(modelKey);
  }
  
  // Remove metadata
  const existingModelsJSON = localStorage.getItem('savedModels');
  if (existingModelsJSON) {
    const existingModels = JSON.parse(existingModelsJSON);
    const filteredModels = existingModels.filter((m: any) => m.name !== name);
    localStorage.setItem('savedModels', JSON.stringify(filteredModels));
  }
};

// Additional functions needed for other components
export const savePredictionResult = async (
  prediction: {
    employee_name?: string;
    score: number;
    risk_level: string;
    reason?: string;
    recommendation?: string;
  },
  modelId: string | null,
  employeeId: string | null
): Promise<string | null> => {
  try {
    // In a real application, this would save to a database
    console.log('Saving prediction:', prediction, 'for employee:', employeeId, 'using model:', modelId);
    
    // For demo purposes, just return a mock ID
    return 'pred_' + Math.random().toString(36).substr(2, 9);
  } catch (error) {
    console.error('Error saving prediction result:', error);
    return null;
  }
};

// Function to make predictions with a model
export const makePredictions = (
  model: tf.LayersModel,
  data: any[],
  featureNames: string[],
  min: Record<string, number>,
  max: Record<string, number>
): number[] => {
  // Extract features from data
  const features = data.map(row => {
    return featureNames.map(feature => {
      const value = row[feature] || 0;
      // Normalize using the same normalization used during training
      return max[feature] - min[feature] !== 0
        ? (value - min[feature]) / (max[feature] - min[feature])
        : 0;
    });
  });
  
  // Convert to tensor
  const inputTensor = tf.tensor2d(features);
  
  // Make prediction
  const predictions = model.predict(inputTensor) as tf.Tensor;
  
  // Convert to array
  const result = Array.from(predictions.dataSync());
  
  // Clean up tensors
  inputTensor.dispose();
  predictions.dispose();
  
  return result;
};
