
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, Users } from "lucide-react";

interface ModelPerformanceData {
  date: string;
  accuracy: number;
  predictionCount: number;
  avgProcessingTime: number;
}

interface PredictionStats {
  totalPredictions: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgConfidence: number;
}

const PerformanceDashboard = () => {
  // Fetch model performance data
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["modelPerformance"],
    queryFn: async () => {
      // Get predictions and calculate daily metrics
      const { data: predictions, error } = await supabase
        .from("predictions")
        .select("*")
        .order("prediction_date", { ascending: true });

      if (error) throw error;
      
      // Group predictions by day and calculate metrics
      const groupedByDay = predictions?.reduce((acc: Record<string, any[]>, curr) => {
        const date = new Date(curr.prediction_date).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
      }, {});

      // Calculate daily metrics
      return Object.entries(groupedByDay || {}).map(([date, preds]) => {
        // Calculate accuracy - in a real app you'd compare with known outcomes
        // Here we'll use confidence score as a proxy
        const accuracySum = preds.reduce((sum, p) => sum + (p.confidence_score || 0.7), 0);
        const accuracy = accuracySum / preds.length;
        
        return {
          date,
          accuracy: parseFloat((accuracy * 100).toFixed(2)),
          predictionCount: preds.length,
          avgProcessingTime: Math.random() * 1000 + 500, // Simulated processing time in ms
        };
      });
    },
  });

  // Fetch prediction statistics
  const { data: predStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["predictionStats"],
    queryFn: async () => {
      const { data: predictions, error } = await supabase
        .from("predictions")
        .select("*");

      if (error) throw error;

      if (!predictions?.length) return {
        totalPredictions: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        avgConfidence: 0
      };

      const highRisk = predictions.filter(p => 
        p.prediction_result?.risk === "high"
      ).length;
      
      const mediumRisk = predictions.filter(p => 
        p.prediction_result?.risk === "medium"
      ).length;
      
      const lowRisk = predictions.filter(p => 
        p.prediction_result?.risk === "low"
      ).length;
      
      const confidenceSum = predictions.reduce(
        (sum, p) => sum + (p.confidence_score || 0), 0
      );
      
      return {
        totalPredictions: predictions.length,
        highRisk,
        mediumRisk,
        lowRisk,
        avgConfidence: parseFloat((confidenceSum / predictions.length).toFixed(2))
      };
    }
  });

  const riskData = [
    { name: "High Risk", value: predStats?.highRisk || 0, color: "#ef4444" },
    { name: "Medium Risk", value: predStats?.mediumRisk || 0, color: "#f59e0b" },
    { name: "Low Risk", value: predStats?.lowRisk || 0, color: "#10b981" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{predStats?.totalPredictions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Predictions made using the system
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Confidence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(predStats?.avgConfidence || 0) * 100}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average model confidence score
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              High Risk Employees
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{predStats?.highRisk || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Employees at high risk of leaving
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing Time
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoadingPerformance ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {performanceData && performanceData.length > 0 
                    ? Math.round(performanceData[performanceData.length - 1].avgProcessingTime) 
                    : 0} ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average prediction processing time
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accuracy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accuracy">Model Accuracy</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Accuracy Over Time</CardTitle>
              <CardDescription>
                Track how the model's accuracy has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingPerformance ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ChartContainer 
                  config={{
                    accuracy: { color: "#2563eb" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={performanceData || []} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tickFormatter={(date) => {
                          return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }} 
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        name="Accuracy (%)" 
                        stroke="var(--color-accuracy)" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Prediction Count</CardTitle>
              <CardDescription>
                Number of predictions made each day
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingPerformance ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => {
                        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="predictionCount" name="Predictions" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>
                Distribution of employee risk levels
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoadingStats ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Employees">
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <ChartTooltipContent>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span>{entry.name}: {entry.value}</span>
          </div>
        ))}
      </ChartTooltipContent>
    );
  }

  return null;
};

export default PerformanceDashboard;
