
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { analyzeEmployeeData } from "@/utils/dataAnalysisUtils";
import DataInsightsPanel from "@/components/DataInsightsPanel";

// Import our new components
import FileUpload from "@/components/data-import/FileUpload";
import ApiKeyInput from "@/components/data-import/ApiKeyInput";
import AnalyzeButton from "@/components/data-import/AnalyzeButton";

interface DataImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DataImportModal = ({ open, onOpenChange }: DataImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (selectedFile: File | null, parsedData: any[] | null) => {
    setFile(selectedFile);
    setCsvData(parsedData);
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
              <ApiKeyInput 
                apiKey={apiKey}
                setApiKey={setApiKey}
              />
            )}
            
            {/* File Upload Component */}
            <FileUpload 
              onFileSelect={handleFileSelect}
              file={file}
              csvData={csvData}
            />
            
            {/* Data Analysis Button */}
            {csvData && !insights && (
              <AnalyzeButton 
                onClick={handleAnalyzeData}
                disabled={isAnalyzing || !apiKey}
                isAnalyzing={isAnalyzing}
              />
            )}
            
            {/* Insights Display */}
            {insights && (
              <div className="mt-4">
                <DataInsightsPanel insights={insights} />
              </div>
            )}
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
