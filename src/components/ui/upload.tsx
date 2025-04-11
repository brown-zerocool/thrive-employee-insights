
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./input";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  onUploadComplete: (file: File) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  className?: string;
}

export const FileUpload = ({
  onUploadComplete,
  accept = "",
  maxSize = 10485760, // 10MB default
  label = "Drop file here or click to browse",
  className,
}: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      setIsUploading(true);

      if (acceptedFiles.length === 0) {
        setError("No file was uploaded");
        setIsUploading(false);
        return;
      }

      const file = acceptedFiles[0];

      if (maxSize && file.size > maxSize) {
        setError(`File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB`);
        setIsUploading(false);
        return;
      }

      // Simulate upload completion
      setTimeout(() => {
        setIsUploading(false);
        onUploadComplete(file);
      }, 500);
    },
    [maxSize, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept.includes('/') ? accept : `${accept.replace(/^\./, '')}/*`]: [] } : undefined,
    maxSize,
  });

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50 transition-colors",
          isDragActive ? "border-primary bg-accent/50" : "border-border",
          error && "border-destructive"
        )}
      >
        <Input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={cn(
              "h-10 w-10 mb-2",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <p className={cn("text-sm", isDragActive ? "text-primary" : "text-muted-foreground")}>
            {isDragActive ? "Drop the file here" : label}
          </p>
          {isUploading && (
            <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            {accept && `Supported formats: ${accept}`}
            {maxSize && ` (max ${Math.round(maxSize / 1024 / 1024)}MB)`}
          </p>
        </div>
      </div>
    </div>
  );
};
