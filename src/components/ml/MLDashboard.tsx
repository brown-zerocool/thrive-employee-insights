
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CircleSlash, TrendingUp, BarChart3, PieChart as PieChartIcon, Download, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleExport } from "@/utils/exportUtils";

// Chart configuration
const chartConfig = {
  low: { 
    label: "Low Risk", 
    color: "#22c55e" 
  },
  medium: { 
    label: "Medium Risk", 
    color: "#f59e0b" 
  },
  high: { 
    label: "High Risk", 
    color: "#ef4444" 
  },
  department: { 
    label: "Department", 
    color: "#3b82f6" 
  },
  trend: { 
    label: "Trend", 
    color: "#8b5cf6" 
  }
};

// Risk level colors for pie chart
const RISK_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444"
};

const MLDashboard = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [predictionsCount, setPredictionsCount] = useState(0);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [departmentRiskData, setDepartmentRiskData] = useState<any[]>([]);

  useEffect(() => {
    fetchPredictions();
    fetchEmployeeCount();
  }, [timeFilter, departmentFilter]);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('predictions')
        .select(`
          id, 
          prediction_date, 
          prediction_result, 
          confidence_score,
          employee_id, 
          model_id,
          factors,
          employees:employee_id (
            first_name,
            last_name,
            department
          )
        `)
        .order('prediction_date', { ascending: false });

      // Apply time filter
      if (timeFilter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('prediction_date', oneWeekAgo.toISOString());
      } else if (timeFilter === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        query = query.gte('prediction_date', oneMonthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Process results
      let filteredData = data;
      
      // Extract unique departments
      const allDepartments = new Set<string>();
      filteredData.forEach(item => {
        if (item.employees?.department) {
          allDepartments.add(item.employees.department);
        }
      });
      setDepartments(Array.from(allDepartments));
      
      // Apply department filter
      if (departmentFilter !== "all") {
        filteredData = filteredData.filter(item => 
          item.employees?.department === departmentFilter
        );
      }
      
      setPredictions(filteredData);
      setPredictionsCount(filteredData.length);
      
      // Calculate risk distribution
      const riskCounts = {
        low: 0,
        medium: 0,
        high: 0
      };
      
      filteredData.forEach(item => {
        const risk = extractRiskLevel(item.prediction_result);
        if (risk) {
          riskCounts[risk as keyof typeof riskCounts]++;
        }
      });
      
      const riskData = [
        { name: "Low Risk", value: riskCounts.low, color: RISK_COLORS.low },
        { name: "Medium Risk", value: riskCounts.medium, color: RISK_COLORS.medium },
        { name: "High Risk", value: riskCounts.high, color: RISK_COLORS.high }
      ];
      setRiskDistribution(riskData);
      
      // Calculate department risk data
      const deptData: Record<string, {low: number, medium: number, high: number}> = {};
      
      filteredData.forEach(item => {
        const dept = item.employees?.department;
        const risk = extractRiskLevel(item.prediction_result);
        
        if (dept && risk) {
          if (!deptData[dept]) {
            deptData[dept] = {low: 0, medium: 0, high: 0};
          }
          deptData[dept][risk as keyof typeof deptData[typeof dept]]++;
        }
      });
      
      const formattedDeptData = Object.entries(deptData).map(([dept, counts]) => ({
        department: dept,
        low: counts.low,
        medium: counts.medium,
        high: counts.high
      }));
      
      setDepartmentRiskData(formattedDeptData);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      toast.error("Failed to load prediction data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      setEmployeeCount(count || 0);
    } catch (error) {
      console.error("Error fetching employee count:", error);
    }
  };

  const extractRiskLevel = (predictionResult: any): 'low' | 'medium' | 'high' | null => {
    // Extract risk level from various prediction result formats
    if (!predictionResult) return null;
    
    if (typeof predictionResult === 'string') {
      try {
        const parsed = JSON.parse(predictionResult);
        return parsed.risk || null;
      } catch (e) {
        return null;
      }
    }
    
    if (typeof predictionResult === 'object') {
      if (predictionResult.risk) {
        return predictionResult.risk.toLowerCase() as 'low' | 'medium' | 'high';
      } else if (predictionResult.employee) {
        return predictionResult.employee.risk?.toLowerCase() as 'low' | 'medium' | 'high';
      }
    }
    
    return null;
  };

  const handleExportDashboard = (format: 'csv' | 'pdf' | 'excel') => {
    const preparedData = predictions.map(p => ({
      date: new Date(p.prediction_date).toLocaleDateString(),
      employee: p.employees ? `${p.employees.first_name} ${p.employees.last_name}` : 'Unknown',
      department: p.employees?.department || 'Unknown',
      risk: extractRiskLevel(p.prediction_result) || 'Unknown',
      confidence: p.confidence_score ? `${Math.round(p.confidence_score * 100)}%` : 'N/A'
    }));
    
    handleExport(format);
    toast.success(`Dashboard exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">ML Insights Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Visualize prediction results and employee retention insights
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => handleExportDashboard('csv')}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeCount}</div>
            <p className="text-xs text-muted-foreground">Total workforce</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionsCount}</div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === 'all' ? 'All time' : 
               timeFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-risk-high">
              {riskDistribution.find(d => d.name === "High Risk")?.value || 0}
            </div>
            <p className="text-xs text-muted-foreground">Employees to focus on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {predictionsCount > 0 ? 
                `${Math.round(((predictionsCount - (riskDistribution.find(d => d.name === "High Risk")?.value || 0)) / predictionsCount) * 100)}%` : 
                'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Estimated retention</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risk" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" /> Risk Distribution
          </TabsTrigger>
          <TabsTrigger value="department" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Department Analysis
          </TabsTrigger>
          <TabsTrigger value="confidence" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Prediction Confidence
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Employee retention risk breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : riskDistribution.every(d => d.value === 0) ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <CircleSlash className="h-12 w-12 mb-2 opacity-30" />
                  <p>No prediction data available for the selected filters</p>
                </div>
              ) : (
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                  </PieChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="department" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Risk Analysis</CardTitle>
              <CardDescription>Risk distribution across departments</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : departmentRiskData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <CircleSlash className="h-12 w-12 mb-2 opacity-30" />
                  <p>No department data available for the selected filters</p>
                </div>
              ) : (
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <BarChart
                    data={departmentRiskData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="department" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend content={<ChartLegendContent />} />
                    <Bar dataKey="low" stackId="a" fill={RISK_COLORS.low} name="Low Risk" />
                    <Bar dataKey="medium" stackId="a" fill={RISK_COLORS.medium} name="Medium Risk" />
                    <Bar dataKey="high" stackId="a" fill={RISK_COLORS.high} name="High Risk" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction Confidence</CardTitle>
              <CardDescription>Confidence scores over time</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : predictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <CircleSlash className="h-12 w-12 mb-2 opacity-30" />
                  <p>No prediction data available for the selected filters</p>
                </div>
              ) : (
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <LineChart
                    data={predictions.slice(0, 50).map(p => ({
                      date: new Date(p.prediction_date).toLocaleDateString(),
                      confidence: p.confidence_score || 0
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70}
                    />
                    <YAxis domain={[0, 1]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#8b5cf6" 
                      activeDot={{ r: 8 }} 
                      name="Confidence Score"
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLDashboard;
