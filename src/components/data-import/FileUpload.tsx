
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void> | void;
  accept?: string;
  label?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  accept = "*", 
  label = "Upload a file" 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    try {
      await onFileUpload(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    try {
      await onFileUpload(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-colors text-center ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/30"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            Drag and drop or click to upload
          </p>
        </div>

        {fileName && !isUploading && (
          <div className="mt-2 text-sm text-muted-foreground">
            Selected: <span className="font-medium">{fileName}</span>
          </div>
        )}

        {isUploading ? (
          <div className="mt-2">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            <span className="ml-2 text-sm">Uploading...</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => inputRef.current?.click()}
          >
            Select File
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
