
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Save, BarChart4, Sigma } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import {
  prepareDataForTraining,
  trainModel,
  evaluateModel,
  saveModel,
  loadModel,
  listSavedModels,
  makePredictions
} from "@/utils/mlService";

interface MachineLearningPanelProps {
  data: any[] | null;
}

export const MachineLearningPanel = ({ data }: MachineLearningPanelProps) => {
  const [targetColumn, setTargetColumn] = useState<string>("");
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [modelName, setModelName] = useState("employee-retention-model");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainedModel, setTrainedModel] = useState<tf.LayersModel | null>(null);
  const [modelMetrics, setModelMetrics] = useState<{ mse: number; rmse: number; r2: number } | null>(null);
  const [normalizedData, setNormalizedData] = useState<{
    min: tf.Tensor;
    max: tf.Tensor;
    featureNames: string[];
  } | null>(null);
  const [testResults, setTestResults] = useState<Array<{ actual: number; predicted: number; }>>([]);

  // Initialize available columns when data changes
  useState(() => {
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      setAvailableColumns(columns);
    }
  });

  const handleSelectTarget = (column: string) => {
    setTargetColumn(column);
    // Remove selected target from features
    setFeatureColumns(prevFeatures => prevFeatures.filter(f => f !== column));
  };

  const handleToggleFeature = (column: string) => {
    if (featureColumns.includes(column)) {
      setFeatureColumns(prev => prev.filter(f => f !== column));
    } else if (column !== targetColumn) {
      setFeatureColumns(prev => [...prev, column]);
    }
  };

  const handleTrainModel = async () => {
    if (!data || data.length === 0) {
      toast.error("No data available for training");
      return;
    }

    if (featureColumns.length === 0) {
      toast.error("Please select at least one feature column");
      return;
    }

    if (!targetColumn) {
      toast.error("Please select a target column to predict");
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // Split data into train (80%) and test (20%) sets
      const shuffledData = [...data].sort(() => Math.random() - 0.5);
      const splitIndex = Math.floor(shuffledData.length * 0.8);
      const trainData = shuffledData.slice(0, splitIndex);
      const testData = shuffledData.slice(splitIndex);
      
      // Prepare training data
      const preparedData = prepareDataForTraining(trainData, featureColumns, targetColumn);
      setNormalizedData({
        min: preparedData.min,
        max: preparedData.max,
        featureNames: preparedData.featureNames
      });
      
      // Train model
      const model = await trainModel(preparedData.features, preparedData.targets, 100);
      setTrainedModel(model);

      // Test model on test data
      const testPreparedData = prepareDataForTraining(testData, featureColumns, targetColumn);
      const metrics = evaluateModel(model, testPreparedData.features, testPreparedData.targets);
      setModelMetrics(metrics);
      
      // Get some test predictions for display
      const predictions = makePredictions(
        model, 
        testData.slice(0, 10), 
        featureColumns,
        preparedData.min,
        preparedData.max
      );
      
      // Combine actual and predicted values for display
      const results = predictions.map((pred, i) => ({
        actual: Number(testData[i][targetColumn]),
        predicted: pred
      }));
      setTestResults(results);
      
      toast.success("Model trained successfully!");
    } catch (error) {
      console.error("Error in training process:", error);
      toast.error("Failed to train model. See console for details.");
    } finally {
      setTrainingProgress(100);
      setIsTraining(false);
    }
  };

  const handleSaveModel = async () => {
    if (!trainedModel) {
      toast.error("No trained model available to save");
      return;
    }
    
    if (!modelName.trim()) {
      toast.error("Please enter a name for the model");
      return;
    }
    
    await saveModel(trainedModel, modelName);
  };

  const handleLoadModel = async () => {
    if (!modelName.trim()) {
      toast.error("Please enter a name for the model to load");
      return;
    }
    
    const model = await loadModel(modelName);
    if (model) {
      setTrainedModel(model);
      toast.success("Model loaded successfully");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" />
          Machine Learning Analysis
        </CardTitle>
        <CardDescription>
          Train a neural network to predict employee metrics and retention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Target Column (Value to Predict)</Label>
            <Select value={targetColumn} onValueChange={handleSelectTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select column to predict" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map(column => (
                  <SelectItem key={column} value={column}>{column}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Select Feature Columns (Input Variables)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableColumns.map(column => (
                <div key={column} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`feature-${column}`}
                    checked={featureColumns.includes(column)}
                    onChange={() => handleToggleFeature(column)}
                    disabled={column === targetColumn}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label 
                    htmlFor={`feature-${column}`}
                    className={column === targetColumn ? "text-gray-400" : ""}
                  >
                    {column}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Model Training */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="employee-retention-model"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button 
                variant="outline" 
                onClick={handleLoadModel}
                disabled={isTraining}
              >
                Load Model
              </Button>
              <Button 
                variant="outline" 
                disabled={!trainedModel || isTraining} 
                onClick={handleSaveModel}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Model
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={handleTrainModel} 
            disabled={isTraining || !targetColumn || featureColumns.length === 0}
            className="w-full"
          >
            {isTraining ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Training Model...
              </>
            ) : (
              <>
                <Sigma className="mr-2 h-4 w-4" />
                Train Model
              </>
            )}
          </Button>
          
          {isTraining && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Training Progress</div>
              <Progress value={trainingProgress} />
            </div>
          )}
        </div>
        
        {/* Results */}
        {modelMetrics && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Model Performance</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-xs text-muted-foreground">MSE</div>
                  <div className="text-lg font-semibold">{modelMetrics.mse.toFixed(4)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-xs text-muted-foreground">RMSE</div>
                  <div className="text-lg font-semibold">{modelMetrics.rmse.toFixed(4)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="text-xs text-muted-foreground">R² Score</div>
                  <div className="text-lg font-semibold">{modelMetrics.r2.toFixed(4)}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Sample Predictions</h4>
                <div className="max-h-60 overflow-y-auto rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-2 text-left text-xs font-medium text-gray-500">Actual</th>
                        <th className="p-2 text-left text-xs font-medium text-gray-500">Predicted</th>
                        <th className="p-2 text-left text-xs font-medium text-gray-500">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 text-sm">{result.actual.toFixed(2)}</td>
                          <td className="p-2 text-sm">{result.predicted.toFixed(2)}</td>
                          <td className={`p-2 text-sm ${Math.abs(result.actual - result.predicted) > (result.actual * 0.2) ? 'text-red-500' : 'text-green-500'}`}>
                            {(result.actual - result.predicted).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MachineLearningPanel;
