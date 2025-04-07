
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, MoveRight, BarChart } from "lucide-react";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import { loadModel } from "@/utils/mlService";

interface PredictionPanelProps {
  features: string[];
  modelName?: string;
}

const PredictionPanel = ({ features, modelName = "employee-retention-model" }: PredictionPanelProps) => {
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  
  const handleInputChange = (feature: string, value: string) => {
    const numValue = parseFloat(value);
    setFeatureValues(prev => ({
      ...prev,
      [feature]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handlePredict = async () => {
    if (!modelName) {
      toast.error("Please select a model first");
      return;
    }
    
    if (features.length === 0) {
      toast.error("No feature columns defined");
      return;
    }
    
    setLoading(true);
    
    try {
      const model = await loadModel(modelName);
      if (!model) {
        throw new Error("Failed to load model");
      }
      
      // Get min and max values for normalization
      // In a real application, these should be stored with the model
      const modelInfo = localStorage.getItem(`localstorage://${modelName}_info`);
      let min: tf.Tensor, max: tf.Tensor;
      
      if (modelInfo) {
        const info = JSON.parse(modelInfo);
        min = tf.tensor1d(info.min);
        max = tf.tensor1d(info.max);
      } else {
        // Use default values if not found
        min = tf.tensor1d(features.map(() => 0));
        max = tf.tensor1d(features.map(() => 1));
      }
      
      // Create input tensor
      const inputArray = features.map(f => featureValues[f] || 0);
      const inputTensor = tf.tensor2d([inputArray]);
      
      // Normalize
      const normalizedInput = inputTensor.sub(min).div(max.sub(min));
      
      // Predict
      const predictionTensor = model.predict(normalizedInput) as tf.Tensor;
      const predictionValue = predictionTensor.dataSync()[0];
      
      // Set prediction
      setPrediction(predictionValue);
      toast.success("Prediction generated!");
    } catch (error) {
      console.error("Error making prediction:", error);
      toast.error("Failed to make prediction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-purple-500" />
          Generate Predictions
        </CardTitle>
        <CardDescription>
          Use a trained model to make predictions on new data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(feature => (
            <div key={feature} className="space-y-2">
              <Label htmlFor={`feature-${feature}`}>{feature}</Label>
              <Input 
                id={`feature-${feature}`}
                type="number"
                value={featureValues[feature] || ""}
                onChange={(e) => handleInputChange(feature, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        
        <Button 
          onClick={handlePredict} 
          disabled={loading || features.length === 0} 
          className="w-full"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Predicting...
            </>
          ) : (
            <>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Generate Prediction
            </>
          )}
        </Button>
        
        {prediction !== null && (
          <div className="mt-4 p-4 bg-primary/5 rounded-md border flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Prediction Result</div>
              <div className="text-xl font-semibold">{prediction.toFixed(2)}</div>
            </div>
            <MoveRight className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionPanel;
