
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FileIcon, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FileUploadProps {
  onFileSelect: (file: File | null, csvData: any[] | null) => void;
  file: File | null;
  csvData: any[] | null;
}

const FileUpload = ({ onFileSelect, file, csvData }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

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
    
    // Process CSV data immediately after setting the file
    if (selectedFile.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (e.target?.result) {
            const csvContent = e.target.result as string;
            const { parseCSV } = await import("@/utils/dataAnalysisUtils");
            const parsedData = await parseCSV(csvContent);
            onFileSelect(selectedFile, parsedData);
            toast.success("CSV data parsed successfully");
          }
        } catch (error) {
          console.error("Error parsing CSV:", error);
          toast.error("Failed to parse CSV data");
          onFileSelect(selectedFile, null);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // For non-CSV files, just set the file without parsing
      onFileSelect(selectedFile, null);
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
    onFileSelect(null, null);
  };

  return (
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
  );
};

export default FileUpload;
