
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
  const [config, setConfig] = useState<PredictionConfig>({
    timeFrame: "3m",
    includeFactors: {
      compensation: true,
      workload: true,
      engagement: true,
      growth: true,
    },
  });

  // Sample predictions (in a real app, these would come from the OpenAI API)
  const samplePredictions: PredictionResult[] = [
    {
      employee: "Maria Garcia",
      score: 65,
      risk: "medium",
      reason: "3 consecutive missed team events, decreased collaboration in the last month, requested fewer training opportunities",
      recommendation: "Schedule a one-on-one meeting to discuss career growth opportunities within the company.",
    },
    {
      employee: "David Kim",
      score: 48,
      risk: "high",
      reason: "Compensation below market rate for similar positions, increased workload in recent projects, reduced participation in meetings",
      recommendation: "Consider a compensation adjustment as his current salary is below market rate for his experience level.",
    },
    {
      employee: "Sarah Wilson",
      score: 72,
      risk: "medium",
      reason: "Expressed interest in skills outside current role, mentored fewer junior staff recently, longer response times to communications",
      recommendation: "Offer additional training and mentorship to help develop skills in her area of interest.",
    },
    {
      employee: "Robert Johnson",
      score: 88,
      risk: "low",
      reason: "Active participation in company events, regular knowledge sharing with team, positive feedback in recent performance review",
      recommendation: "Maintain engagement through continued recognition and opportunities for professional growth.",
    },
    {
      employee: "Emma Williams",
      score: 42,
      risk: "high",
      reason: "Recent negative feedback about management style, decreased productivity, increased absence rate",
      recommendation: "Immediate intervention needed. Schedule meeting with HR and consider reassigning to a different team or manager.",
    }
  ];

  const handleGeneratePredictions = () => {
    setLoading(true);
    toast.info("Analyzing employee data and generating predictions...");
    
    // Simulate API call to OpenAI
    setTimeout(() => {
      setPredictions(samplePredictions);
      setLoading(false);
      toast.success("Retention predictions generated successfully");
    }, 3000);
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
              <CardDescription>Use AI to identify employees at risk and get tailored retention strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                  disabled={loading}
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
                  <Badge variant="prediction">AI Generated</Badge>
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
                  Configure settings and generate predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">No predictions yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Configure your prediction settings on the left and click "Generate AI Predictions" to identify employees who might be at risk.
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
