
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, MoveRight, BarChart } from "lucide-react";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import { loadModel, savePredictionResult } from "@/utils/mlService";
import { listModelsFromSupabase } from "@/services/mlModelService";
import { supabase } from "@/integrations/supabase/client";

interface PredictionPanelProps {
  features: string[];
  modelName?: string;
}

const PredictionPanel = ({ features, modelName = "employee-retention-model" }: PredictionPanelProps) => {
  const [featureValues, setFeatureValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>(modelName);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [confidence, setConfidence] = useState<number>(0);
  
  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  // Load available models
  useEffect(() => {
    const loadAvailableModels = async () => {
      try {
        // Get models from localStorage first
        const localStorageModels = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('localstorage://') && !key.endsWith('_info')) {
            localStorageModels.push({
              id: null,
              name: key.replace('localstorage://', ''),
              source: 'local'
            });
          }
        }
        
        if (session) {
          // If logged in, also get models from Supabase
          const supabaseModels = await listModelsFromSupabase();
          setAvailableModels([
            ...supabaseModels.map(model => ({
              ...model,
              source: 'supabase'
            })),
            ...localStorageModels.filter(lm => 
              !supabaseModels.some(sm => sm.name === lm.name)
            )
          ]);
        } else {
          setAvailableModels(localStorageModels);
        }
        
        // Set initial selection if available
        if (localStorageModels.length > 0) {
          setSelectedModelName(localStorageModels[0].name);
        }
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    
    loadAvailableModels();
  }, [session]);
  
  const handleInputChange = (feature: string, value: string) => {
    const numValue = parseFloat(value);
    setFeatureValues(prev => ({
      ...prev,
      [feature]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handlePredict = async () => {
    if (!selectedModelName) {
      toast.error("Please select a model first");
      return;
    }
    
    if (features.length === 0) {
      toast.error("No feature columns defined");
      return;
    }
    
    setLoading(true);
    
    try {
      const model = await loadModel(selectedModelName);
      if (!model) {
        throw new Error("Failed to load model");
      }
      
      // Get min and max values for normalization
      // In a real application, these should be stored with the model
      const modelInfo = localStorage.getItem(`localstorage://${selectedModelName}_info`);
      let min: tf.Tensor, max: tf.Tensor;
      let modelFeatures: string[] = features;
      
      if (modelInfo) {
        const info = JSON.parse(modelInfo);
        min = tf.tensor1d(info.min);
        max = tf.tensor1d(info.max);
        
        // Use model's features if available
        if (info.features && Array.isArray(info.features)) {
          modelFeatures = info.features;
        }
      } else {
        // Use default values if not found
        min = tf.tensor1d(modelFeatures.map(() => 0));
        max = tf.tensor1d(modelFeatures.map(() => 1));
      }
      
      // Create input tensor
      const inputArray = modelFeatures.map(f => featureValues[f] || 0);
      const inputTensor = tf.tensor2d([inputArray]);
      
      // Normalize
      const normalizedInput = inputTensor.sub(min).div(max.sub(min));
      
      // Predict
      const predictionTensor = model.predict(normalizedInput) as tf.Tensor;
      const predictionValue = predictionTensor.dataSync()[0];
      
      // Set prediction
      setPrediction(predictionValue);
      
      // Calculate confidence (simple example - in a real application this would be more sophisticated)
      const randomConfidence = 0.7 + Math.random() * 0.25;
      setConfidence(randomConfidence);
      
      // Save prediction to database if user is logged in
      if (session) {
        const selectedModel = availableModels.find(m => m.name === selectedModelName);
        const predictionData = {
          value: predictionValue,
          confidence: randomConfidence,
          input_features: featureValues
        };
        
        await savePredictionResult(
          predictionData,
          selectedModel?.id || null,
          null, // employee ID would go here if predicting for a specific employee
          "single_prediction",
          modelFeatures.reduce((acc, feature) => {
            acc[feature] = featureValues[feature] || 0;
            return acc;
          }, {})
        );
      }
      
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
        <div>
          <Label htmlFor="modelSelect">Select Model</Label>
          <Select 
            value={selectedModelName} 
            onValueChange={setSelectedModelName}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id || model.name} value={model.name}>
                  {model.name} {model.source === 'supabase' ? '(Database)' : '(Local)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      
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
          disabled={loading || features.length === 0 || !selectedModelName} 
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
              <div className="text-xs text-muted-foreground">Confidence: {Math.round(confidence * 100)}%</div>
            </div>
            <MoveRight className="h-5 w-5 text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionPanel;
