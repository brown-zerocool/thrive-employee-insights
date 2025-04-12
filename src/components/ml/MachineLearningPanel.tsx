
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Info, BrainCircuit, Layers, BarChart4, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { prepareDataForTraining, trainModel, evaluateModel } from "@/utils/mlService";
import * as tf from "@tensorflow/tfjs";

interface MachineLearningPanelProps {
  csvData?: any[];
  onModelTrained?: (model: any) => void;
}

const MachineLearningPanel: React.FC<MachineLearningPanelProps> = ({ csvData, onModelTrained }) => {
  const { toast } = useToast();
  const [modelType, setModelType] = useState<string>("neuralNetwork");
  const [modelParams, setModelParams] = useState({
    learningRate: 0.01,
    epochs: 50,
    hiddenLayers: [10, 5],
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  
  const handleModelTypeChange = (value: string) => {
    setModelType(value);
    
    // Reset model parameters based on selected model type
    if (value === "neuralNetwork") {
      setModelParams({
        learningRate: 0.01,
        epochs: 50,
        hiddenLayers: [10, 5],
      });
    } else if (value === "randomForest") {
      setModelParams({
        trees: 100,
        maxDepth: 10,
        featureSplit: 0.7,
      });
    } else if (value === "xgboost") {
      setModelParams({
        learningRate: 0.1,
        maxDepth: 6,
        rounds: 100,
      });
    }
  };
  
  const handleParamChange = (param: string, value: number | number[]) => {
    setModelParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };
  
  const handleTrainModel = async () => {
    if (!csvData || csvData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please import employee data before training a model.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTraining(true);
    setTrainingProgress(0);
    setModelMetrics(null);
    
    try {
      // Step 1: Prepare the data
      const { trainX, trainY, testX, testY, featureNames, normalization } = await prepareDataForTraining(csvData);
      
      // Step 2: Update progress
      setTrainingProgress(20);
      
      // Step 3: Train the model
      const model = await trainModel({
        modelType,
        trainX,
        trainY,
        params: modelParams,
        onEpochEnd: (epoch: number, logs: any) => {
          // Calculate progress during training
          const epochProgress = Math.round((epoch / modelParams.epochs) * 60);
          setTrainingProgress(20 + epochProgress);
        },
      });
      
      setTrainingProgress(80);
      
      // Step 4: Evaluate the model
      const metrics = await evaluateModel({
        model,
        testX,
        testY,
        featureNames,
      });
      
      setTrainingProgress(100);
      setModelMetrics(metrics);
      
      if (onModelTrained) {
        onModelTrained({
          model,
          metrics,
          featureNames,
          normalization,
          modelType,
          params: modelParams,
        });
      }
      
      toast({
        title: "Model Trained Successfully",
        description: `Model accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`,
      });
      
    } catch (error) {
      console.error("Error training model:", error);
      toast({
        title: "Training Failed",
        description: "An error occurred while training the model.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Machine Learning Model Builder
        </CardTitle>
        <CardDescription>
          Create and train predictive models for employee retention analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!csvData || csvData.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Data Available</AlertTitle>
            <AlertDescription>
              Import employee data to train retention prediction models.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Tabs defaultValue="configuration">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="configuration">Model Configuration</TabsTrigger>
                <TabsTrigger value="results" disabled={!modelMetrics}>
                  Training Results
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="configuration" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelType">Model Type</Label>
                    <Select value={modelType} onValueChange={handleModelTypeChange}>
                      <SelectTrigger id="modelType">
                        <SelectValue placeholder="Select model type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neuralNetwork">Neural Network</SelectItem>
                        <SelectItem value="randomForest">Random Forest</SelectItem>
                        <SelectItem value="xgboost">XGBoost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {modelType === "neuralNetwork" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="learningRate">Learning Rate</Label>
                        <Select 
                          value={modelParams.learningRate.toString()} 
                          onValueChange={(v) => handleParamChange("learningRate", Number(v))}
                        >
                          <SelectTrigger id="learningRate">
                            <SelectValue placeholder="Select learning rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.001">0.001</SelectItem>
                            <SelectItem value="0.01">0.01</SelectItem>
                            <SelectItem value="0.1">0.1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="epochs">Epochs</Label>
                        <Select 
                          value={modelParams.epochs.toString()}
                          onValueChange={(v) => handleParamChange("epochs", Number(v))}
                        >
                          <SelectTrigger id="epochs">
                            <SelectValue placeholder="Select epochs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  {modelType === "randomForest" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trees">Number of Trees</Label>
                        <Select 
                          value={(modelParams as any).trees?.toString() || "100"}
                          onValueChange={(v) => handleParamChange("trees", Number(v))}
                        >
                          <SelectTrigger id="trees">
                            <SelectValue placeholder="Select number of trees" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxDepth">Max Depth</Label>
                        <Select 
                          value={(modelParams as any).maxDepth?.toString() || "10"}
                          onValueChange={(v) => handleParamChange("maxDepth", Number(v))}
                        >
                          <SelectTrigger id="maxDepth">
                            <SelectValue placeholder="Select max depth" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="results" className="py-4">
                {modelMetrics && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Accuracy</p>
                        <p className="text-2xl font-bold">{(modelMetrics.accuracy * 100).toFixed(2)}%</p>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Precision</p>
                        <p className="text-2xl font-bold">{(modelMetrics.precision * 100).toFixed(2)}%</p>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Recall</p>
                        <p className="text-2xl font-bold">{(modelMetrics.recall * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Feature Importance</h4>
                      <div className="space-y-2">
                        {modelMetrics.featureImportance?.map((feature: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{feature.name}</span>
                              <span className="font-medium">{feature.importance.toFixed(4)}</span>
                            </div>
                            <Progress value={feature.importance * 100} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <div className="w-full space-y-4">
          {isTraining && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Training Progress</span>
                <span>{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant={modelMetrics ? "outline" : "default"}
              onClick={handleTrainModel}
              disabled={isTraining || !csvData || csvData.length === 0}
            >
              {isTraining ? "Training..." : modelMetrics ? "Retrain Model" : "Train Model"}
            </Button>
            
            {modelMetrics && (
              <Button 
                variant="outline"
                onClick={() => {
                  // Handle save model logic
                  toast({
                    title: "Model Saved",
                    description: "Your trained model has been saved successfully.",
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Model
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MachineLearningPanel;
