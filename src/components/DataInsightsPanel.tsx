
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, AlertCircle, Users } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MachineLearningPanel from "@/components/ml/MachineLearningPanel";
import PredictionPanel from "@/components/ml/PredictionPanel";

interface DataInsightsProps {
  insights: {
    summary: string;
    riskEmployees: {
      name: string;
      risk: "low" | "medium" | "high";
      reason: string;
      recommendation: string;
    }[];
    retentionRate: number;
    keyFactors: string[];
    departmentInsights: {
      department: string;
      riskLevel: string;
      recommendations: string;
    }[];
  };
  csvData?: any[] | null;
}

const DataInsightsPanel = ({ insights, csvData }: DataInsightsProps) => {
  const [activeTab, setActiveTab] = useState<string>("ai-insights");
  const [features, setFeatures] = useState<string[]>([]);
  
  // Extract potential feature columns from CSV data
  useState(() => {
    if (csvData && csvData.length > 0) {
      const numericColumns = Object.keys(csvData[0]).filter(key => {
        const val = csvData[0][key];
        return typeof val === 'number' || !isNaN(Number(val));
      });
      setFeatures(numericColumns);
    }
  });

  return (
    <Tabs defaultValue="ai-insights" onValueChange={setActiveTab}>
      <TabsList className="mb-4 grid w-full grid-cols-3 h-auto">
        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        <TabsTrigger value="ml-train">ML Training</TabsTrigger>
        <TabsTrigger value="ml-predict">ML Predictions</TabsTrigger>
      </TabsList>
      <TabsContent value="ai-insights">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Real-time Data Insights</CardTitle>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                AI Generated
              </div>
            </div>
            <CardDescription>
              Analysis based on {insights.riskEmployees.length} employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-md border">
              <p className="text-sm">{insights.summary}</p>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-md border">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-500">Retention Rate</h4>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-semibold mt-1">{insights.retentionRate}%</p>
              </div>
              
              <div className="bg-white p-3 rounded-md border">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-500">At-Risk Employees</h4>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {insights.riskEmployees.filter(e => e.risk === "high").length}
                </p>
              </div>
              
              <div className="bg-white p-3 rounded-md border">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-500">Departments</h4>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-semibold mt-1">
                  {insights.departmentInsights.length}
                </p>
              </div>
            </div>
            
            {/* Key Risk Factors */}
            <div>
              <h4 className="text-sm font-medium mb-2">Key Risk Factors</h4>
              <div className="flex flex-wrap gap-2">
                {insights.keyFactors.map((factor, index) => (
                  <Badge key={index} variant="outline">{factor}</Badge>
                ))}
              </div>
            </div>
            
            {/* Employee Risk Analysis */}
            <div>
              <h4 className="text-sm font-medium mb-2">Employee Risk Analysis</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {insights.riskEmployees.map((employee, index) => (
                  <div key={index} className="border rounded-lg p-2 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{employee.name}</div>
                      <Badge variant={employee.risk}>
                        {employee.risk === "low" ? "Low Risk" : 
                        employee.risk === "medium" ? "Medium Risk" : "High Risk"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{employee.reason}</div>
                    <div className="pt-1 border-t flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span className="text-sm">{employee.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Department Insights */}
            <div>
              <h4 className="text-sm font-medium mb-2">Department Insights</h4>
              <div className="space-y-2">
                {insights.departmentInsights.map((dept, index) => (
                  <div key={index} className="border rounded-lg p-2 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{dept.department}</div>
                      <Badge variant={
                        dept.riskLevel === "low" ? "default" : 
                        dept.riskLevel === "medium" ? "outline" : "destructive"
                      }>
                        {dept.riskLevel} Risk
                      </Badge>
                    </div>
                    <div className="text-sm">{dept.recommendations}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="ml-train">
        <MachineLearningPanel data={csvData} />
      </TabsContent>
      
      <TabsContent value="ml-predict">
        <PredictionPanel features={features} />
      </TabsContent>
    </Tabs>
  );
};

export default DataInsightsPanel;
