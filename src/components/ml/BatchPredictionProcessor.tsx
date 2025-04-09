import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, Upload, Database, Play, Download, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import * as tf from '@tensorflow/tfjs';
import { loadModel, listSavedModels } from "@/utils/mlService";
import { makePredictions, savePredictionResult } from "@/utils/mlService";
import FileUpload from "@/components/data-import/FileUpload";
import { parseCSV } from "@/utils/dataAnalysisUtils";

interface BatchPredictionProps {
  onPredictionsComplete?: (results: any[]) => void;
}

const BatchPredictionProcessor: React.FC<BatchPredictionProps> = ({ onPredictionsComplete }) => {
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [inputData, setInputData] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [mode, setMode] = useState<'upload' | 'database'>('upload');
  const [selectedEmployees, setSelectedEmployees] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  React.useEffect(() => {
    fetchModels();
    fetchEmployees();
  }, []);

  const fetchModels = async () => {
    try {
      const models = await listSavedModels();
      setAvailableModels(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load saved models");
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const content = await file.text();
      const parsedData = await parseCSV(content);
      setInputData(parsedData);
      toast.success(`Uploaded ${parsedData.length} records`);
    } catch (error) {
      console.error("Error parsing CSV file:", error);
      toast.error("Failed to parse CSV file");
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleEmployeeToggle = (employee: any) => {
    if (selectedEmployees.some(e => e.id === employee.id)) {
      setSelectedEmployees(selectedEmployees.filter(e => e.id !== employee.id));
    } else {
      setSelectedEmployees([...selectedEmployees, employee]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees([...employees]);
    }
  };

  const runBatchPrediction = async () => {
    if (!selectedModelId) {
      toast.error("Please select a model first");
      return;
    }

    let dataToProcess: any[] = [];
    
    if (mode === 'upload' && inputData.length > 0) {
      dataToProcess = inputData;
    } else if (mode === 'database' && selectedEmployees.length > 0) {
      dataToProcess = selectedEmployees;
    } else {
      toast.error("No data available for prediction");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const selectedModel = availableModels.find(m => m.id === selectedModelId);
      if (!selectedModel) {
        throw new Error("Selected model not found");
      }
      
      const loadedModelData = await loadModel(selectedModelId);
      const model = loadedModelData.model;
      const min = loadedModelData.min || {};
      const max = loadedModelData.max || {};
      
      const featureColumns = Array.isArray(selectedModel.features) ? selectedModel.features : [];
      
      const batchSize = 10;
      const batches = Math.ceil(dataToProcess.length / batchSize);
      let processedResults: any[] = [];
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, dataToProcess.length);
        const batch = dataToProcess.slice(start, end);
        
        const predictions = makePredictions(model, batch, featureColumns, min, max);
        
        const batchResults = batch.map((item, index) => {
          const predictionValue = predictions[index];
          const score = predictionValue;
          
          let risk = 'low';
          if (score > 0.7) {
            risk = 'high';
          } else if (score > 0.3) {
            risk = 'medium';
          }
          
          return {
            employee: mode === 'database' ? `${item.first_name} ${item.last_name}` : 
              (item.first_name && item.last_name ? `${item.first_name} ${item.last_name}` : `Employee ${index + 1}`),
            employeeId: item.id,
            score: score,
            risk: risk,
            department: item.department || 'Unknown',
            timestamp: new Date().toISOString()
          };
        });
        
        processedResults = [...processedResults, ...batchResults];
        
        if (session) {
          for (const result of batchResults) {
            if (result.employeeId) {
              await savePredictionResult(
                {
                  score: result.score,
                  risk: result.risk,
                  timestamp: result.timestamp,
                },
                selectedModelId,
                result.employeeId
              );
            }
          }
        }
        
        setProgress(Math.round(((i + 1) / batches) * 100));
        setResults(processedResults);
      }
      
      toast.success(`Successfully processed ${processedResults.length} predictions`);
      
      if (onPredictionsComplete) {
        onPredictionsComplete(processedResults);
      }
      
    } catch (error) {
      console.error("Error in batch prediction:", error);
      toast.error("Failed to process predictions");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const exportResults = (format: 'csv' | 'pdf' | 'excel') => {
    if (results.length === 0) {
      toast.error("No results to export");
      return;
    }
    
    if (format === 'csv') {
      const headers = ["Employee", "Department", "Risk Level", "Score", "Timestamp"];
      const csvContent = [
        headers.join(","),
        ...results.map(result => 
          [
            result.employee,
            result.department,
            result.risk,
            result.score,
            result.timestamp
          ].join(",")
        )
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `predictions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Predictions exported as CSV");
    } else {
      toast.info(`${format.toUpperCase()} export will be available in a future update`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Prediction Processor</CardTitle>
        <CardDescription>
          Process multiple predictions at once using your trained models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="source" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="source">1. Select Data Source</TabsTrigger>
            <TabsTrigger value="model">2. Run Predictions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="source" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer ${mode === 'upload' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/20'}`}
                onClick={() => setMode('upload')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <h4 className="font-medium">CSV Upload</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with employee data for batch processing
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer ${mode === 'database' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/20'}`}
                onClick={() => setMode('database')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5" />
                  <h4 className="font-medium">Database Records</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select employees from your database to process
                </p>
              </div>
            </div>
            
            {mode === 'upload' ? (
              <div className="border rounded-lg p-4">
                <FileUpload accept=".csv" label="Upload employee data CSV">
                  {(file: File) => handleFileUpload(file)}
                </FileUpload>
                
                {inputData.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{inputData.length} records loaded</span>
                      <Button variant="outline" size="sm" onClick={() => setInputData([])}>
                        Clear
                      </Button>
                    </div>
                    
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(inputData[0] || {}).slice(0, 5).map((header) => (
                                <th key={header} className="px-4 py-2 text-left">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {inputData.slice(0, 3).map((row, i) => (
                              <tr key={i} className="border-t">
                                {Object.values(row).slice(0, 5).map((value: any, j) => (
                                  <td key={j} className="px-4 py-2">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {inputData.length > 3 && (
                        <div className="px-4 py-2 bg-muted/50 text-center text-sm text-muted-foreground">
                          ... {inputData.length - 3} more records
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Select Employees</h4>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedEmployees.length === employees.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                
                <div className="h-60 overflow-y-auto border rounded-lg p-2">
                  {employees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                      <p>No employees found in database</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {employees.map(employee => (
                        <div 
                          key={employee.id}
                          className={`flex items-center p-2 rounded ${
                            selectedEmployees.some(e => e.id === employee.id) 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted/50'
                          } cursor-pointer`}
                          onClick={() => handleEmployeeToggle(employee)}
                        >
                          <div className={`w-4 h-4 border rounded mr-2 ${
                            selectedEmployees.some(e => e.id === employee.id)
                              ? 'bg-primary border-primary'
                              : 'border-input'
                          } flex items-center justify-center`}>
                            {selectedEmployees.some(e => e.id === employee.id) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {employee.department || 'No department'} · {employee.position || 'No position'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  {selectedEmployees.length} of {employees.length} employees selected
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="model" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Select Model</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableModels.length === 0 ? (
                  <div className="col-span-2 text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground">No saved models found</p>
                    <p className="text-xs mt-1">Train a model first before running predictions</p>
                  </div>
                ) : (
                  availableModels.map(model => (
                    <div 
                      key={model.id}
                      className={`border rounded-lg p-3 cursor-pointer ${
                        selectedModelId === model.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground/20'
                      }`}
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {model.model_type} · {model.features?.length || 0} features
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(model.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button 
                onClick={runBatchPrediction} 
                disabled={
                  isProcessing || 
                  !selectedModelId || 
                  (mode === 'upload' && inputData.length === 0) || 
                  (mode === 'database' && selectedEmployees.length === 0)
                }
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run Batch Prediction
              </Button>
              
              {isProcessing && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
            
            {results.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-3 bg-muted/30">
                  <h4 className="font-medium">Results ({results.length})</h4>
                  <Button variant="outline" size="sm" onClick={() => exportResults('csv')}>
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Employee</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Risk Level</th>
                        <th className="px-4 py-2 text-left">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.slice(0, 10).map((result, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2">{result.employee}</td>
                          <td className="px-4 py-2">{result.department}</td>
                          <td className="px-4 py-2">
                            <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              result.risk === 'high' ? 'bg-red-100 text-risk-high' : 
                              result.risk === 'medium' ? 'bg-yellow-100 text-risk-medium' : 
                              'bg-green-100 text-risk-low'
                            }`}>
                              {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)}
                            </div>
                          </td>
                          <td className="px-4 py-2">{result.score.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.length > 10 && (
                    <div className="px-4 py-2 bg-muted/50 text-center text-sm text-muted-foreground">
                      ... {results.length - 10} more results
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BatchPredictionProcessor;
