
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BrainCircuit, Save, TrendingUp, BarChart3, Trash } from "lucide-react";
import { toast } from "sonner";
import * as tf from '@tensorflow/tfjs';
import { 
  prepareDataForTraining, 
  trainModel, 
  evaluateModel, 
  saveModel, 
  listSavedModels 
} from "@/utils/mlService";
import { listModelsFromSupabase, deleteModelFromSupabase } from "@/services/mlModelService";
import { supabase } from "@/integrations/supabase/client";

interface MachineLearningPanelProps {
  data?: any[] | null;
}

const MachineLearningPanel = ({ data }: MachineLearningPanelProps) => {
  const [features, setFeatures] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [target, setTarget] = useState<string>("");
  const [epochs, setEpochs] = useState<number>(100);
  const [trainTestSplit, setTrainTestSplit] = useState<number>(0.8);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [metrics, setMetrics] = useState<{ mse: number; rmse: number; r2: number } | null>(null);
  const [modelName, setModelName] = useState<string>("");
  const [savedModels, setSavedModels] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

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

  // Extract columns from data
  useEffect(() => {
    if (data && data.length > 0) {
      const numericColumns = Object.keys(data[0]).filter(key => {
        const val = data[0][key];
        return typeof val === 'number' || !isNaN(Number(val));
      });
      setFeatures(numericColumns);
    }
  }, [data]);
  
  // Load saved models
  useEffect(() => {
    const loadSavedModels = async () => {
      if (!session) {
        // If not logged in, only load from localStorage
        const localModels = await listSavedModels();
        const formattedModels = localModels.map(name => ({
          name,
          source: 'local',
          created_at: 'Unknown'
        }));
        setSavedModels(formattedModels);
        return;
      }
      
      try {
        const supabaseModels = await listModelsFromSupabase();
        const localModels = await listSavedModels();
        const formattedLocalModels = localModels.map(name => ({
          name,
          source: 'local',
          created_at: 'Unknown'
        }));
        
        // Combine both sources, with Supabase models taking precedence
        const combinedModels = [
          ...supabaseModels.map(model => ({
            ...model,
            source: 'supabase'
          })),
          ...formattedLocalModels.filter(lm => 
            !supabaseModels.some(sm => sm.name === lm.name)
          )
        ];
        
        setSavedModels(combinedModels);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    
    loadSavedModels();
  }, [session]);

  const handleFeatureSelect = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleTrainModel = async () => {
    if (!data || data.length === 0) {
      toast.error("No data available for training");
      return;
    }

    if (selectedFeatures.length === 0) {
      toast.error("Please select at least one feature");
      return;
    }

    if (!target) {
      toast.error("Please select a target variable");
      return;
    }

    setIsTraining(true);
    setMetrics(null);

    try {
      // Prepare data
      const { features: featureTensor, targets, featureNames, min, max } = prepareDataForTraining(
        data,
        selectedFeatures,
        target
      );

      // Split data into train/test
      const splitIdx = Math.floor(data.length * trainTestSplit);
      const trainFeatures = featureTensor.slice([0, 0], [splitIdx, -1]);
      const testFeatures = featureTensor.slice([splitIdx, 0], [-1, -1]);
      const trainTargets = targets.slice([0], [splitIdx]);
      const testTargets = targets.slice([splitIdx], [-1]);

      // Train the model
      const trainedModel = await trainModel(trainFeatures, trainTargets, epochs);
      
      // Evaluate the model
      const evalMetrics = evaluateModel(trainedModel, testFeatures, testTargets);
      
      // Store model and metrics
      setModel(trainedModel);
      setMetrics(evalMetrics);
      
      // Store normalization info
      const modelInfo = {
        features: featureNames,
        min: Array.from(min.dataSync()),
        max: Array.from(max.dataSync()),
        metrics: evalMetrics
      };
      
      // Create a default model name if none provided
      if (!modelName || modelName.trim() === "") {
        setModelName(`retention-model-${new Date().toISOString().split('T')[0]}`);
      }
      
      // Store model info in localStorage
      localStorage.setItem(`localstorage://${modelName || 'temp-model'}_info`, JSON.stringify(modelInfo));
      
      toast.success("Model training completed successfully");
    } catch (error) {
      console.error("Error training model:", error);
      toast.error("Failed to train model");
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveModel = async () => {
    if (!model) {
      toast.error("No model to save");
      return;
    }

    if (!modelName.trim()) {
      toast.error("Please enter a model name");
      return;
    }

    try {
      await saveModel(model, modelName, selectedFeatures, metrics || undefined);
      
      // Refresh the models list
      if (session) {
        const supabaseModels = await listModelsFromSupabase();
        const localModels = await listSavedModels();
        const formattedLocalModels = localModels.map(name => ({
          name,
          source: 'local',
          created_at: 'Unknown'
        }));
        
        setSavedModels([
          ...supabaseModels.map(model => ({
            ...model,
            source: 'supabase'
          })),
          ...formattedLocalModels.filter(lm => 
            !supabaseModels.some(sm => sm.name === lm.name)
          )
        ]);
      } else {
        const localModels = await listSavedModels();
        const formattedLocalModels = localModels.map(name => ({
          name,
          source: 'local',
          created_at: 'Unknown'
        }));
        setSavedModels(formattedLocalModels);
      }
    } catch (error) {
      console.error("Error saving model:", error);
      toast.error("Failed to save model");
    }
  };

  const handleDeleteModel = async (model: any) => {
    try {
      if (model.source === 'supabase' && model.id) {
        await deleteModelFromSupabase(model.id);
      }
      
      // Delete from localStorage regardless of source
      try {
        localStorage.removeItem(`localstorage://${model.name}`);
        localStorage.removeItem(`localstorage://${model.name}_info`);
      } catch (e) {
        console.error("Error removing from localStorage:", e);
      }
      
      // Refresh models list
      setSavedModels(savedModels.filter(m => m.name !== model.name));
      toast.success(`Model "${model.name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            Machine Learning Training
          </CardTitle>
        </div>
        <CardDescription>Train a neural network model on your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data || data.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-md border">
            <BrainCircuit className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Please import employee data first to train a machine learning model for retention prediction.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="modelName">Model Name</Label>
                  <Input
                    id="modelName"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g., retention-model-v1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetVariable">Target Variable (to predict)</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map((feature) => (
                        <SelectItem key={feature} value={feature}>
                          {feature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-1 block">Training Parameters</Label>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm">Epochs: {epochs}</span>
                      </div>
                      <Slider
                        value={[epochs]}
                        min={10}
                        max={500}
                        step={10}
                        onValueChange={(value) => setEpochs(value[0])}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Train/Test Split: {Math.round(trainTestSplit * 100)}% / {Math.round((1 - trainTestSplit) * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[trainTestSplit * 100]}
                        min={50}
                        max={90}
                        step={5}
                        onValueChange={(value) => setTrainTestSplit(value[0] / 100)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={handleTrainModel}
                    disabled={isTraining || selectedFeatures.length === 0 || !target}
                    className="w-full"
                  >
                    {isTraining ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Training...
                      </>
                    ) : (
                      <>
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        Train Model
                      </>
                    )}
                  </Button>
                </div>
                
                {model && (
                  <div className="pt-2">
                    <Button
                      onClick={handleSaveModel}
                      disabled={!model || !modelName.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Model
                    </Button>
                  </div>
                )}
                
                {metrics && (
                  <div className="bg-gray-50 p-4 rounded-md border">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      Model Performance
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">MSE</p>
                        <p className="font-medium">{metrics.mse.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">RMSE</p>
                        <p className="font-medium">{metrics.rmse.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">R² Score</p>
                        <p className="font-medium">{metrics.r2.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <Label>Select Features for Training</Label>
                <div className="border rounded-md h-80 overflow-y-auto p-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`feature-${feature}`}
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureSelect(feature)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor={`feature-${feature}`} className="text-sm">
                        {feature}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedFeatures.length} of {features.length} features selected
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Saved Models ({savedModels.length})
              </h3>
              
              {savedModels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {savedModels.map((savedModel) => (
                    <div
                      key={savedModel.id || savedModel.name}
                      className="border rounded-md p-3 flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{savedModel.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            savedModel.source === 'supabase' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {savedModel.source === 'supabase' ? 'Database' : 'Local'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {savedModel.source === 'supabase' 
                              ? `Created: ${formatDate(savedModel.created_at)}` 
                              : 'Local storage only'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteModel(savedModel)}
                      >
                        <Trash className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No saved models yet. Train and save a model to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MachineLearningPanel;
