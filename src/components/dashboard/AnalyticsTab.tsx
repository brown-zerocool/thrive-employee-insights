
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LineChart,
  PieChart,
  RefreshCcw,
} from "lucide-react";
import { analyticsData, generateAnalyticsReport } from "@/utils/exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [departmentDistribution, setDepartmentDistribution] = useState(analyticsData.departmentDistribution);
  const [riskDistribution, setRiskDistribution] = useState(analyticsData.riskDistribution);
  const totalEmployees = departmentDistribution.reduce((sum, item) => sum + item.value, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing analytics data...");
    
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Analytics data refreshed");
    }, 2000);
  };

  const handleGenerateReport = (type: string) => {
    generateAnalyticsReport(type);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        
        <Button onClick={() => handleGenerateReport("analytics")}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>
              Employee distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-80">
              {departmentDistribution.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(item.value / totalEmployees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>
              Employee risk level breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {riskDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.level}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}% ({item.count})</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        item.level.toLowerCase().includes("low") 
                          ? "bg-risk-low" 
                          : item.level.toLowerCase().includes("medium") 
                            ? "bg-risk-medium" 
                            : "bg-risk-high"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Retention Trend</CardTitle>
          <CardDescription>
            6-month retention rate trend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60 flex items-end space-x-2">
            {analyticsData.retentionTrend.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-primary rounded-t w-full"
                  style={{ height: `${item.rate * 0.6}%` }}
                ></div>
                <div className="mt-2 text-xs text-muted-foreground">{item.month}</div>
                <div className="text-xs font-medium">{item.rate}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
