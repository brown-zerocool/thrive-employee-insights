
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface PredictionResult {
  employee: string;
  score: number;
  risk: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
}

interface PredictionResultsProps {
  predictions: PredictionResult[];
  employeeSearch: string;
  onSearchChange: (value: string) => void;
}

export const PredictionResults = ({
  predictions,
  employeeSearch,
  onSearchChange
}: PredictionResultsProps) => {
  const filteredPredictions = predictions.filter(p => 
    p.employee.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search employees..." 
          className="pl-8"
          value={employeeSearch}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-4 mt-4">
        {filteredPredictions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No employees found matching your search.
          </div>
        ) : (
          filteredPredictions.map((prediction, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div className="font-medium">{prediction.employee}</div>
                <Badge variant={prediction.risk}>
                  {prediction.risk === "low" ? "Low Risk" : 
                   prediction.risk === "medium" ? "Medium Risk" : "High Risk"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{prediction.reason}</div>
              <div className="pt-2 border-t flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                <span className="text-sm">{prediction.recommendation}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
