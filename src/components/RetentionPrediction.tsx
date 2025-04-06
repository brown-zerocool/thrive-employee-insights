
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, AlertTriangle, Users, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateRetentionPredictions } from "@/utils/openAiService";

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
  const [config, setConfig] = useState<PredictionConfig>({
    timeFrame: "3m",
    includeFactors: {
      compensation: true,
      workload: true,
      engagement: true,
      growth: true,
    },
  });

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

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
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

  const filteredPredictions = predictions.filter(p => 
    p.employee.toLowerCase().includes(employeeSearch.toLowerCase())
  );

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
                <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    OpenAI API Key Required
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder="sk-..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is used only for this session and is not stored.{" "}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
                      Get your API key here
                    </a>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department Filter</Label>
                    <Select 
                      value={config.department} 
                      onValueChange={(value) => handleUpdateConfig("department", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeFrame">Prediction Time Frame</Label>
                    <Select 
                      value={config.timeFrame} 
                      onValueChange={(value) => handleUpdateConfig("timeFrame", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time frame" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">Next Month</SelectItem>
                        <SelectItem value="3m">Next 3 Months</SelectItem>
                        <SelectItem value="6m">Next 6 Months</SelectItem>
                        <SelectItem value="1y">Next Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Prediction Factors</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="compensation" 
                        checked={config.includeFactors.compensation}
                        onCheckedChange={(checked) => handleUpdateFactors("compensation", !!checked)}
                      />
                      <Label htmlFor="compensation" className="cursor-pointer">Compensation Data</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="workload" 
                        checked={config.includeFactors.workload}
                        onCheckedChange={(checked) => handleUpdateFactors("workload", !!checked)}
                      />
                      <Label htmlFor="workload" className="cursor-pointer">Work Hours & Capacity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="engagement" 
                        checked={config.includeFactors.engagement}
                        onCheckedChange={(checked) => handleUpdateFactors("engagement", !!checked)}
                      />
                      <Label htmlFor="engagement" className="cursor-pointer">Engagement Metrics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="growth" 
                        checked={config.includeFactors.growth}
                        onCheckedChange={(checked) => handleUpdateFactors("growth", !!checked)}
                      />
                      <Label htmlFor="growth" className="cursor-pointer">Career Growth</Label>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGeneratePredictions} 
                  className="w-full" 
                  disabled={loading || !apiKey}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loading ? "Generating Predictions..." : "Generate AI Predictions"}
                </Button>
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
                  <Badge variant="ai-generated">GPT-4o Generated</Badge>
                </div>
                <CardDescription>
                  Based on {Object.values(config.includeFactors).filter(Boolean).length} 
                  {" "}factors over the next {config.timeFrame === "1m" ? "month" : 
                  config.timeFrame === "3m" ? "3 months" : 
                  config.timeFrame === "6m" ? "6 months" : "year"}
                </CardDescription>
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employees..." 
                      className="pl-8"
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Retention Predictions</CardTitle>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <CardDescription>
                  Configure settings and generate predictions with GPT-4o
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">No predictions yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Enter your OpenAI API key, configure your prediction settings, and click "Generate AI Predictions" to identify employees who might be at risk.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetentionPrediction;
