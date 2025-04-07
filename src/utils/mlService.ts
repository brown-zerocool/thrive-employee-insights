
// Re-export all ML functionality from the separate modules for backward compatibility
import { prepareDataForTraining } from './ml/dataPreparation';
import { trainModel, evaluateModel } from './ml/modelTraining';
import { makePredictions, savePredictionResult } from './ml/modelPrediction';
import { saveModel, loadModel, listSavedModels } from './ml/modelStorage';

export {
  prepareDataForTraining,
  trainModel,
  evaluateModel,
  makePredictions,
  savePredictionResult,
  saveModel,
  loadModel,
  listSavedModels
};
