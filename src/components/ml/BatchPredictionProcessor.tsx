import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchMLModels } from "@/services/databaseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileUpload from "@/components/FileUpload";

interface PredictionResult {
  employee_id: string;
  prediction: string;
  confidence: number;
}

const BatchPredictionProcessor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [predictionResults, setPredictionResults] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ["mlModels"],
    queryFn: fetchMLModels,
  });

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedData(results.data);
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "Error parsing CSV",
          description: error.message,
        });
      },
    });
  };

  const handlePredict = async () => {
    if (!selectedFile || !selectedModel) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please upload a file and select a model.",
      });
      return;
    }

    setIsLoading(true);
    // Simulate prediction processing
    setTimeout(() => {
      const simulatedResults: PredictionResult[] = parsedData.map((row, index) => ({
        employee_id: row.employee_id || `EMP${index + 1}`,
        prediction: Math.random() > 0.5 ? "High Risk" : "Low Risk",
        confidence: parseFloat((Math.random() * 100).toFixed(2)),
      }));

      setPredictionResults(simulatedResults);
      setIsLoading(false);

      toast({
        title: "Predictions complete",
        description: `Generated predictions for ${parsedData.length} employees.`,
      });
    }, 2000);
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-lg font-semibold">Batch Prediction</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a CSV file with employee data to generate predictions in bulk
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Employee Data</CardTitle>
          <CardDescription>
            The file should be a CSV with headers matching the required features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!selectedModel ? (
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No model selected</AlertTitle>
                <AlertDescription>
                  Please select a model before uploading employee data
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <FileUpload
                  label="Upload employee CSV file"
                  accept=".csv"
                  onUpload={handleFileUpload}
                />
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing data...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Model</CardTitle>
          <CardDescription>Choose the model to use for predictions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingModels ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Select onValueChange={handleModelSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              First 5 rows of the uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(parsedData[0]).map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, i) => (
                        <TableCell key={i}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {parsedData.length > 0 && (
        <Button onClick={handlePredict} disabled={isLoading || !selectedModel}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Generate Predictions"
          )}
        </Button>
      )}

      {predictionResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>
              Generated predictions for the uploaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictionResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.employee_id}</TableCell>
                      <TableCell>{result.prediction}</TableCell>
                      <TableCell>{result.confidence}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchPredictionProcessor;
