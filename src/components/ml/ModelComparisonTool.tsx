import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listModelsFromSupabase } from "@/services/mlModelService";
import { BarChart, ScatterChart, PieChart } from "recharts";
import { toast } from "sonner";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, Pie, Cell } from "recharts";

interface ModelComparison {
  id: string;
  name: string;
  modelType: string;
  accuracy: number;
  rmse: number;
  mse: number;
  r2: number;
  createdAt: string;
  featureCount: number;
  features: string[];
  parameters: any;
}

const ModelComparisonTool = () => {
  const [models, setModels] = useState<ModelComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("performance");
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const supabaseModels = await listModelsFromSupabase();
        
        if (!supabaseModels || supabaseModels.length === 0) {
          toast.error("No models found for comparison");
          setLoading(false);
          return;
        }
        
        // Process models for comparison
        const processedModels: ModelComparison[] = supabaseModels.map(model => {
          // Safely extract metrics from JSON
          const metrics = model.metrics ? 
            (typeof model.metrics === 'string' ? 
              JSON.parse(model.metrics) : model.metrics) : {};
          
          // Safely extract features
          const features = model.features ? 
            (Array.isArray(model.features) ? 
              model.features : 
              typeof model.features === 'string' ? 
                JSON.parse(model.features) : 
                []) : 
            [];
          
          return {
            id: model.id,
            name: model.name,
            modelType: model.model_type || "unknown",
            accuracy: (metrics?.accuracy || 0) * 100,
            rmse: metrics?.rmse || 0,
            mse: metrics?.mse || 0,
            r2: metrics?.r2 || 0,
            createdAt: new Date(model.created_at || Date.now()).toLocaleString(),
            featureCount: Array.isArray(features) ? features.length : 0,
            features: Array.isArray(features) ? features : [],
            parameters: model.parameters || {}
          };
        });
        
        setModels(processedModels);
      } catch (error) {
        console.error("Error loading models for comparison:", error);
        toast.error("Failed to load models for comparison");
      } finally {
        setLoading(false);
      }
    };
    
    loadModels();
  }, []);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57'];

  const renderPerformanceChart = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (models.length === 0) {
      return <p>No models available for comparison.</p>;
    }

    const chartData = models.map(model => ({
      name: model.name,
      MSE: model.mse,
      RMSE: model.rmse,
      R2: model.r2
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="MSE" fill="#8884d8" />
          <Bar dataKey="RMSE" fill="#82ca9d" />
          <Bar dataKey="R2" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderFeatureComparison = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (models.length === 0) {
      return <p>No models available for comparison.</p>;
    }

    const chartData = models.map(model => ({
      name: model.name,
      featureCount: model.featureCount
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="featureCount" fill="#a4de6c" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderModelTypeDistribution = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (models.length === 0) {
      return <p>No models available for comparison.</p>;
    }

    const modelTypeCounts: { [key: string]: number } = {};
    models.forEach(model => {
      const modelType = model.modelType || "Unknown";
      modelTypeCounts[modelType] = (modelTypeCounts[modelType] || 0) + 1;
    });

    const chartData = Object.keys(modelTypeCounts).map((modelType, index) => ({
      name: modelType,
      value: modelTypeCounts[modelType],
      color: COLORS[index % COLORS.length]
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {
              chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))
            }
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison Tool</CardTitle>
        <CardDescription>Compare different models and their performance metrics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="features">Feature Comparison</TabsTrigger>
            <TabsTrigger value="modelTypes">Model Types</TabsTrigger>
          </TabsList>
          <TabsContent value="performance">
            <Card className="border-none shadow-none">
              <CardContent>
                {renderPerformanceChart()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="features">
            <Card className="border-none shadow-none">
              <CardContent>
                {renderFeatureComparison()}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="modelTypes">
            <Card className="border-none shadow-none">
              <CardContent>
                {renderModelTypeDistribution()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModelComparisonTool;
