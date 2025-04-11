import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Save, TestTube2 } from "lucide-react";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import { loadModel, savePredictionResult } from "@/utils/mlService";

interface PredictionPanelProps {
  features: string[];
}

const PredictionPanel = ({ features }: PredictionPanelProps) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});
  const [predictionResult, setPredictionResult] = useState<{ value: number; confidence: number; timestamp: string } | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [modelFeatures, setModelFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await (listSavedModels() as any);
        setAvailableModels(models);
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("Failed to load models");
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    const loadModelFeatures = async () => {
      if (selectedModel) {
        try {
          const loadedModel = await loadModel(selectedModel);
          setModelFeatures(loadedModel.features);
        } catch (error) {
          console.error("Error loading model info:", error);
          toast.error("Failed to load model info");
        }
      }
    };

    loadModelFeatures();
  }, [selectedModel]);

  const handleInputChange = (feature: string, value: string) => {
    setFormValues({ ...formValues, [feature]: value });
  };

  const handlePredict = async () => {
    if (!selectedModel || !formValues) {
      toast.error("Please select a model and enter feature values");
      return;
    }

    setIsPredicting(true);

    try {
      const loadedModel = await loadModel(selectedModel);
      
      // Extract feature values in the correct order
      const featureArray = [];
      for (const feature of modelFeatures) {
        featureArray.push(parseFloat(formValues[feature] || "0"));
      }
      
      // Make prediction
      const inputTensor = tf.tensor2d([featureArray]);
      
      // Normalize input using the model's min-max values
      const minArray = modelFeatures.map(f => loadedModel.min[f] || 0);
      const maxArray = modelFeatures.map(f => loadedModel.max[f] || 1);
      
      const minTensor = tf.tensor1d(minArray);
      const maxTensor = tf.tensor1d(maxArray);
      
      const normalizedInput = inputTensor.sub(minTensor).div(
        maxTensor.sub(minTensor).add(tf.scalar(1e-6))
      );
      
      // Get prediction
      const predictionTensor = loadedModel.model.predict(normalizedInput) as tf.Tensor;
      const predictionValue = predictionTensor.dataSync()[0];
      
      // Clean up tensors
      inputTensor.dispose();
      normalizedInput.dispose();
      predictionTensor.dispose();
      minTensor.dispose();
      maxTensor.dispose();
      
      // Set result
      setPredictionResult({
        value: predictionValue,
        confidence: 0.85, // Placeholder - would need actual confidence calculation
        timestamp: new Date().toISOString()
      });
      
      toast.success("Prediction completed");
    } catch (error) {
      console.error("Error making prediction:", error);
      toast.error("Failed to make prediction");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSavePrediction = async () => {
    if (!predictionResult || !selectedModel) {
      toast.error("No prediction to save");
      return;
    }
    
    try {
      const saved = await savePredictionResult(
        predictionResult,
        selectedModel,
        null // No specific employee ID for generic predictions
      );
      
      if (saved) {
        toast.success("Prediction saved successfully");
      } else {
        toast.error("Failed to save prediction");
      }
    } catch (error) {
      console.error("Error saving prediction:", error);
      toast.error("An error occurred while saving the prediction");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <TestTube2 className="h-5 w-5 text-purple-500" />
            Retention Prediction
          </CardTitle>
        </div>
        <CardDescription>Predict employee retention using trained models</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="modelSelect">Select Model</Label>
            <Select onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trained model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedModel && modelFeatures && (
            <div className="space-y-4">
              {modelFeatures.map((feature) => (
                <div key={feature}>
                  <Label htmlFor={`feature-${feature}`}>{feature}</Label>
                  <Input
                    type="number"
                    id={`feature-${feature}`}
                    placeholder={`Enter ${feature} value`}
                    onChange={(e) => handleInputChange(feature, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handlePredict}
            disabled={isPredicting || !selectedModel}
            className="w-full"
          >
            {isPredicting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Predicting...
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-4 w-4" />
                Predict Retention
              </>
            )}
          </Button>

          {predictionResult && (
            <div className="bg-gray-50 p-4 rounded-md border">
              <h4 className="font-medium mb-2">Prediction Result</h4>
              <p className="text-sm">
                Predicted Retention Score: {predictionResult.value.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500">
                Confidence: {predictionResult.confidence.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                Timestamp: {predictionResult.timestamp}
              </p>
            </div>
          )}

          {predictionResult && (
            <Button
              onClick={handleSavePrediction}
              variant="outline"
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Prediction
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionPanel;
