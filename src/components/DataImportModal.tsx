
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileIcon, Upload, X, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseCSV, analyzeEmployeeData } from "@/utils/dataAnalysisUtils";
import DataInsightsPanel from "@/components/DataInsightsPanel";

interface DataImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DataImportModal = ({ open, onOpenChange }: DataImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      'text/csv', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type. Please upload a CSV or Excel file.");
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    
    setFile(selectedFile);
    
    // Process CSV data immediately after setting the file
    if (selectedFile.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (e.target?.result) {
            const csvContent = e.target.result as string;
            const parsedData = await parseCSV(csvContent);
            setCsvData(parsedData);
            toast.success("CSV data parsed successfully");
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          toast.error("Failed to parse CSV data");
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setCsvData(null);
    setInsights(null);
  };

  const handleAnalyzeData = async () => {
    if (!csvData) {
      toast.error("No data available to analyze");
      return;
    }
    
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key to analyze the data");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const analysisResult = await analyzeEmployeeData(apiKey, csvData);
      setInsights(analysisResult);
      toast.success("Data analysis completed successfully");
    } catch (error) {
      console.error("Error analyzing data:", error);
      toast.error("Failed to analyze data");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate API call for file upload
    setTimeout(() => {
      setIsUploading(false);
      
      if (insights) {
        toast.success(`File "${file.name}" uploaded with insights`);
      } else {
        toast.success(`File "${file.name}" uploaded successfully`);
      }
      
      onOpenChange(false);
      setFile(null);
      setCsvData(null);
      setInsights(null);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import & Analyze Employee Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing employee data for real-time analysis and predictions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* API Key Input */}
            {csvData && (
              <div className="space-y-2 mb-4">
                <Label htmlFor="api-key" className="text-sm font-medium">
                  OpenAI API Key for Data Analysis
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Required to generate insights and predictions from your data.{" "}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
                    Get your API key
                  </a>
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="file">File (CSV or Excel)</Label>
              
              {!file ? (
                <div 
                  className={`mt-2 rounded-md border border-dashed p-8 ${isDragging ? 'border-primary bg-primary/5' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Drag & drop your file here or</p>
                      <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                        browse files
                      </Label>
                      <Input 
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                      Supported formats: CSV, XLS, XLSX (Max 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 rounded-md border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1].toUpperCase()}
                        </p>
                        {csvData && (
                          <Badge variant="outline" className="mt-1">
                            {csvData.length} rows loaded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Data Analysis Button */}
              {csvData && !insights && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={handleAnalyzeData}
                  disabled={isAnalyzing || !apiKey}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      <BarChart className="mr-2 h-4 w-4" />
                      Analyze Data for Predictions
                    </>
                  )}
                </Button>
              )}
              
              {/* Insights Display */}
              {insights && (
                <div className="mt-4">
                  <DataInsightsPanel insights={insights} />
                </div>
              )}
              
              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Required Columns</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Name</Badge>
                    <Badge>Role</Badge>
                    <Badge>Department</Badge>
                    <Badge>Email</Badge>
                    <Badge>Tenure</Badge>
                    <Badge>Performance</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={isUploading || isAnalyzing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isUploading || isAnalyzing}>
              {isUploading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Uploading...
                </>
              ) : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DataImportModal;
