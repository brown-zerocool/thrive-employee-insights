import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Users, Badge } from "lucide-react";
import { toast } from "sonner";
import { generateRetentionPredictions } from "@/utils/openAiService";
import { ApiKeyInput } from "@/components/prediction/ApiKeyInput";
import { PredictionConfigForm } from "@/components/prediction/PredictionConfig";
import { PredictionResults } from "@/components/prediction/PredictionResults";
import { EmptyPredictionState } from "@/components/prediction/EmptyPredictionState";
import { savePredictionResult } from "@/utils/mlService";
import { supabase } from "@/integrations/supabase/client";

interface PredictionResult {
  employee: string;
  score: number;
  risk: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
}

interface PredictionConfig {
  department?: string;
  timeFrame: string;
  includeFactors: {
    compensation: boolean;
    workload: boolean;
    engagement: boolean;
    growth: boolean;
  };
}

const RetentionPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [config, setConfig] = useState<PredictionConfig>({
    timeFrame: "3m",
    includeFactors: {
      compensation: true,
      workload: true,
      engagement: true,
      growth: true,
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const handleGeneratePredictions = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key to continue");
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    toast.info("Analyzing employee data and generating predictions...");
    
    try {
      const results = await generateRetentionPredictions(apiKey, config);
      
      if (results && results.length > 0) {
        setPredictions(results);
        
        if (session) {
          for (const prediction of results) {
            await savePredictionResult(
              {
                employee_name: prediction.employee,
                score: prediction.score,
                risk_level: prediction.risk,
                reason: prediction.reason,
                recommendation: prediction.recommendation
              },
              null,
              null,
              config.timeFrame,
              {
                factors: Object.entries(config.includeFactors)
                  .filter(([_, included]) => included)
                  .map(([factor]) => factor),
                department: config.department || 'all'
              }
            );
          }
        }
        
        toast.success("Retention predictions generated successfully");
      } else {
        toast.error("Failed to generate predictions. Please check your API key and try again.");
      }
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("An error occurred while generating predictions");
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
  };

  const handleUpdateConfig = (key: keyof PredictionConfig, value: any) => {
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const handleUpdateFactors = (factor: keyof PredictionConfig["includeFactors"], checked: boolean) => {
    setConfig({
      ...config,
      includeFactors: {
        ...config.includeFactors,
        [factor]: checked,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-4 flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-500" />
                AI Retention Prediction
              </CardTitle>
              <CardDescription>Use GPT-4o to identify employees at risk and get tailored retention strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ApiKeyInput 
                  apiKey={apiKey}
                  onChange={handleApiKeyChange}
                />

                <PredictionConfigForm 
                  department={config.department}
                  timeFrame={config.timeFrame}
                  includeFactors={config.includeFactors}
                  onUpdateDepartment={(value) => handleUpdateConfig("department", value)}
                  onUpdateTimeFrame={(value) => handleUpdateConfig("timeFrame", value)}
                  onUpdateFactors={handleUpdateFactors}
                />
                
                <Button 
                  onClick={handleGeneratePredictions} 
                  className="w-full" 
                  disabled={loading || !apiKey}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading ? "Generating Predictions..." : "Generate AI Predictions"}
                </Button>

                {!session && (
                  <div className="text-xs text-muted-foreground p-2 bg-gray-50 rounded border mt-2">
                    <p>Sign in to save your predictions and access them later.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4 flex-1">
          {predictions.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Retention Predictions</CardTitle>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    GPT-4o Generated
                  </div>
                </div>
                <CardDescription>
                  Based on {Object.values(config.includeFactors).filter(Boolean).length} 
                  {" "}factors over the next {config.timeFrame === "1m" ? "month" : 
                  config.timeFrame === "3m" ? "3 months" : 
                  config.timeFrame === "6m" ? "6 months" : "year"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PredictionResults 
                  predictions={predictions}
                  employeeSearch={employeeSearch}
                  onSearchChange={setEmployeeSearch}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Retention Predictions</CardTitle>
                  <div className="inline-flex items-center rounded-full border border-input px-2.5 py-0.5 text-xs font-semibold">
                    Ready
                  </div>
                </div>
                <CardDescription>
                  Configure settings and generate predictions with GPT-4o
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <EmptyPredictionState />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetentionPrediction;
