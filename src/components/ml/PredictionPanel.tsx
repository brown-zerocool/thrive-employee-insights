import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BrainCircuit, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface PredictionPanelProps {
  features?: string[];
  onPredictionComplete?: (result: any) => void;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ 
  features = [],
  onPredictionComplete 
}) => {
  const { toast } = useToast();
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handleInputChange = (feature: string, value: string) => {
    setInputValues({
      ...inputValues,
      [feature]: value,
    });
  };

  const handlePredict = () => {
    if (!features || features.length === 0) {
      toast({
        title: "No Features Available",
        description: "Please upload data and train a model to enable predictions.",
        variant: "destructive",
      });
      return;
    }

    // Validate that all feature values are provided
    const missingFeatures = features.filter(feature => !inputValues[feature]);
    if (missingFeatures.length > 0) {
      toast({
        title: "Missing Features",
        description: `Please provide values for all features: ${missingFeatures.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsPredicting(true);
    // Mock prediction logic
    setTimeout(() => {
      const mockPrediction = Math.random() * 100;
      setPrediction(mockPrediction);
      setIsPredicting(false);

      toast({
        title: "Prediction Complete",
        description: `Predicted value: ${mockPrediction.toFixed(2)}`,
      });

      if (onPredictionComplete) {
        onPredictionComplete({
          ...inputValues,
          prediction: mockPrediction,
        });
      }
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          Retention Prediction
        </CardTitle>
        <CardDescription>
          Enter employee data to predict retention risk
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!features || features.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <AlertCircle className="inline-block h-8 w-8 mb-2" />
            <p>No features available. Please upload data and train a model.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature} className="space-y-2">
                <Label htmlFor={feature}>{feature}</Label>
                <Input
                  id={feature}
                  placeholder={`Enter ${feature}`}
                  value={inputValues[feature] || ""}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                  type="number"
                />
              </div>
            ))}
            
            <Separator />
            
            <Button onClick={handlePredict} disabled={isPredicting} className="w-full">
              {isPredicting ? (
                <>
                  Predicting...
                </>
              ) : (
                <>
                  Predict Retention <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            {prediction !== null && (
              <div className="mt-4 p-4 rounded-md bg-muted">
                <h4 className="text-sm font-medium">Prediction Result:</h4>
                <p className="text-2xl font-bold">{prediction.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionPanel;
