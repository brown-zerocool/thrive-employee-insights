
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, Activity, BarChart2 } from "lucide-react";
import { loadModel, listSavedModels } from "@/utils/mlService";
import * as tf from "@tensorflow/tfjs";

interface PredictionPanelProps {
  onPredictionComplete?: (results: any) => void;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ onPredictionComplete }) => {
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [inputValues, setInputValues] = useState<Record<string, number>>({});
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelFeatures, setModelFeatures] = useState<string[]>([]);
  
  useEffect(() => {
    // Load saved models on component mount
    const models = listSavedModels();
    setSavedModels(models);
  }, []);
  
  const handleModelChange = async (modelName: string) => {
    setSelectedModel(modelName);
    setPredictionResult(null);
    
    try {
      // Find the selected model's metadata
      const modelInfo = savedModels.find(model => model.name === modelName);
      
      if (modelInfo && modelInfo.featureNames) {
        setModelFeatures(modelInfo.featureNames);
        
        // Initialize input values
        const initialValues: Record<string, number> = {};
        modelInfo.featureNames.forEach((feature: string) => {
          initialValues[feature] = 0;
        });
        
        setInputValues(initialValues);
      }
    } catch (error) {
      console.error("Error loading model metadata:", error);
    }
  };
  
  const handleInputChange = (feature: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [feature]: parseFloat(value) || 0,
    }));
  };
  
  const handlePredict = async () => {
    if (!selectedModel) return;
    
    setIsLoading(true);
    
    try {
      // Load the selected model
      const modelData = await loadModel(selectedModel);
      const { model, normalization, featureNames } = modelData;
      
      // Normalize input values based on saved normalization parameters
      const normalizedInputs = featureNames.map(feature => {
        const value = inputValues[feature] || 0;
        
        // Normalize using min-max scaling
        const min = normalization.min[feature] || 0;
        const max = normalization.max[feature] || 1;
        
        return (value - min) / (max - min);
      });
      
      // Convert to tensor
      const inputTensor = tf.tensor2d([normalizedInputs]);
      
      // Make prediction
      const predictions = model.predict(inputTensor) as tf.Tensor;
      const result = await predictions.data();
      
      // Get the prediction value
      const predictionValue = result[0];
      setPredictionResult(predictionValue);
      
      // Clean up
      inputTensor.dispose();
      predictions.dispose();
      
      // Call the callback if provided
      if (onPredictionComplete) {
        onPredictionComplete({
          modelName: selectedModel,
          inputValues,
          predictionValue,
          predictionThreshold: 0.5,
          atRisk: predictionValue >= 0.5,
        });
      }
      
    } catch (error) {
      console.error("Error making prediction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Employee Retention Prediction
        </CardTitle>
        <CardDescription>
          Use trained models to predict individual employee retention risk
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {savedModels.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Models Available</AlertTitle>
            <AlertDescription>
              Train and save a model before making predictions.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="modelSelect">Select Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger id="modelSelect">
                  <SelectValue placeholder="Choose a trained model" />
                </SelectTrigger>
                <SelectContent>
                  {savedModels.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name} ({model.modelType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedModel && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium">Input Employee Data</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {modelFeatures.map(feature => (
                      <div key={feature} className="space-y-2">
                        <Label htmlFor={feature}>{feature}</Label>
                        <Input
                          id={feature}
                          type="number"
                          value={inputValues[feature] || "0"}
                          onChange={e => handleInputChange(feature, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handlePredict}
                  disabled={isLoading}
                >
                  {isLoading ? "Predicting..." : "Predict Retention Risk"}
                </Button>
                
                {predictionResult !== null && (
                  <div className="space-y-2 mt-4 p-4 bg-muted rounded-md">
                    <h4 className="font-medium flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      Prediction Result
                    </h4>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Attrition Risk</span>
                        <span className="font-medium">{(predictionResult * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={predictionResult * 100} />
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-sm font-medium">Risk Level: </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        predictionResult >= 0.7
                          ? "bg-red-100 text-red-800"
                          : predictionResult >= 0.4
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {predictionResult >= 0.7
                          ? "High Risk"
                          : predictionResult >= 0.4
                          ? "Medium Risk"
                          : "Low Risk"}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionPanel;
