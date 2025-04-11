
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/upload";
import { useToast } from "@/components/ui/use-toast";
import { ChartBar } from "lucide-react";
import { parse } from "papaparse";

interface DataImportModalProps {
  onDataImport: (data: any[]) => void;
}

const DataImportModal = ({ onDataImport }: DataImportModalProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const { toast } = useToast();

  const parseCSV = (file: File) => {
    parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setCsvData(results.data as any[]);
          setStep(2);
        } else {
          toast({
            title: "Error",
            description: "Failed to parse CSV data.",
            variant: "destructive",
          });
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        toast({
          title: "Error",
          description: "An error occurred while parsing the CSV file.",
          variant: "destructive",
        });
      },
    });
  };

  const handleConfirmImport = () => {
    if (csvData && csvData.length > 0) {
      onDataImport(csvData);
      setOpen(false);
      setStep(1);
      setCsvData(null);
      toast({
        title: "Success",
        description: "Data imported successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "No data to import.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Employee Data</DialogTitle>
          <DialogDescription>
            Import a CSV file to analyze and predict employee retention.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Employee Data</h3>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with employee data to analyze retention risks.
              </p>
            </div>
            
            <FileUpload
              onUploadComplete={(file) => {
                if (file) {
                  setFile(file);
                  parseCSV(file);
                }
              }}
              accept=".csv"
              maxSize={5242880}
              label="Drop your CSV file here or click to browse"
            />
            
            <div className="flex items-center gap-2 text-sm">
              <ChartBar className="h-4 w-4" />
              <span>Only CSV files are supported (max 5MB)</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Confirm Data Import</h3>
              <p className="text-sm text-muted-foreground">
                Review the data before importing.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {csvData && csvData.length > 0
                      ? Object.keys(csvData[0]).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))
                      : null}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData
                    ? csvData.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((cell, i) => (
                            <td
                              key={i}
                              className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-900"
                            >
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back to Upload
              </Button>
              <Button onClick={handleConfirmImport}>Confirm Import</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DataImportModal;
