
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Check, X, BarChart3, LineChart as LineChartIcon, ChevronDown, ChevronUp, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ModelComparison {
  id: string;
  name: string;
  modelType: string;
  accuracy: number;
  rmse?: number;
  mse?: number;
  r2?: number;
  createdAt: string;
  featureCount: number;
  features: string[];
  parameters: any;
}

// Define chart config for consistent colors
const chartConfig = {
  accuracy: { label: "Accuracy", color: "#3b82f6" },
  rmse: { label: "RMSE", color: "#f59e0b" },
  mse: { label: "MSE", color: "#ef4444" },
  r2: { label: "R²", color: "#10b981" }
};

const ModelComparisonTool = () => {
  const [models, setModels] = useState<ModelComparison[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof ModelComparison>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [modelDetailsOpen, setModelDetailsOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ml_models")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const formattedModels: ModelComparison[] = (data || []).map(model => ({
        id: model.id,
        name: model.name,
        modelType: model.model_type,
        accuracy: getModelAccuracy(model.metrics),
        rmse: model.metrics?.rmse,
        mse: model.metrics?.mse,
        r2: model.metrics?.r2,
        createdAt: model.created_at,
        featureCount: model.features?.length || 0,
        features: model.features || [],
        parameters: model.parameters || {}
      }));

      setModels(formattedModels);
      
      // Auto-select up to 3 most recent models
      if (formattedModels.length > 0 && selectedModels.length === 0) {
        setSelectedModels(formattedModels.slice(0, Math.min(3, formattedModels.length)).map(m => m.id));
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load models for comparison");
    } finally {
      setIsLoading(false);
    }
  };

  const getModelAccuracy = (metrics: any): number => {
    if (!metrics) return 0;
    
    // Calculate accuracy based on available metrics
    if (metrics.accuracy !== undefined) {
      return metrics.accuracy;
    } else if (metrics.r2 !== undefined) {
      // R² is a measure of fit, can be used as a proxy for accuracy
      return Math.max(0, Math.min(1, metrics.r2));
    } else if (metrics.rmse !== undefined) {
      // Normalize RMSE to a 0-1 scale (lower is better)
      // This is just an approximation
      return Math.max(0, 1 - (metrics.rmse / 10));
    }
    
    return 0;
  };

  const toggleModelSelection = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter(id => id !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const handleSort = (field: keyof ModelComparison) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (fieldA === undefined || fieldB === undefined) return 0;
    
    const comparison = 
      typeof fieldA === 'string' && typeof fieldB === 'string'
        ? fieldA.localeCompare(fieldB)
        : (fieldA as any) - (fieldB as any);
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const deleteModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from("ml_models")
        .delete()
        .eq("id", modelId);

      if (error) throw error;

      // Remove from selected models if present
      if (selectedModels.includes(modelId)) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
      
      // Remove from models list
      setModels(models.filter(model => model.id !== modelId));
      
      toast.success("Model deleted successfully");
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  };

  // Get comparison chart data
  const getComparisonData = (field: keyof ModelComparison) => {
    return models
      .filter(model => selectedModels.includes(model.id))
      .map(model => ({
        name: model.name,
        value: model[field] || 0
      }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Comparison Tool</CardTitle>
        <CardDescription>
          Compare performance metrics across different models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Compare</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleSort("name")}
                  >
                    Model Name
                    {sortField === "name" && (
                      sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleSort("modelType")}
                  >
                    Type
                    {sortField === "modelType" && (
                      sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleSort("accuracy")}
                  >
                    Accuracy
                    {sortField === "accuracy" && (
                      sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleSort("featureCount")}
                  >
                    Features
                    {sortField === "featureCount" && (
                      sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer" 
                    onClick={() => handleSort("createdAt")}
                  >
                    Created
                    {sortField === "createdAt" && (
                      sortDirection === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Loading models...
                  </TableCell>
                </TableRow>
              ) : sortedModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No models found. Train some models first.
                  </TableCell>
                </TableRow>
              ) : (
                sortedModels.map(model => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div 
                        className={`w-5 h-5 border rounded ${
                          selectedModels.includes(model.id) 
                            ? 'bg-primary border-primary' 
                            : 'border-input'
                        } flex items-center justify-center cursor-pointer`}
                        onClick={() => toggleModelSelection(model.id)}
                      >
                        {selectedModels.includes(model.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.modelType}</Badge>
                    </TableCell>
                    <TableCell>{(model.accuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell>{model.featureCount}</TableCell>
                    <TableCell>{formatDate(model.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setModelDetailsOpen(model.id)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteModel(model.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete model</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Comparison Charts */}
        {selectedModels.length > 0 && (
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-4">Model Comparison</h3>
            
            <Tabs defaultValue="accuracy" className="space-y-4">
              <TabsList>
                <TabsTrigger value="accuracy" className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" /> Performance Metrics
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1">
                  <LineChartIcon className="h-4 w-4" /> Feature Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="accuracy">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accuracy Comparison */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ChartContainer config={chartConfig}>
                          <BarChart data={getComparisonData("accuracy")}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis
                              domain={[0, 1]}
                              tickFormatter={(value) => `${Math.round(value * 100)}%`}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent 
                                formatter={(value: any) => `${(value * 100).toFixed(1)}%`} 
                              />}
                            />
                            <Bar dataKey="value" fill="#3b82f6" name="accuracy" />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* RMSE Comparison */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Error Metrics (RMSE)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-60">
                        <ChartContainer config={chartConfig}>
                          <BarChart data={getComparisonData("rmse")}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip
                              content={<ChartTooltipContent 
                                formatter={(value: any) => value.toFixed(3)} 
                              />}
                            />
                            <Bar dataKey="value" fill="#f59e0b" name="rmse" />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feature Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Feature</th>
                            {models
                              .filter(model => selectedModels.includes(model.id))
                              .map(model => (
                                <th key={model.id} className="text-center py-2 px-4 font-medium">
                                  {model.name}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Get all unique features across selected models */}
                          {Array.from(
                            new Set(
                              models
                                .filter(model => selectedModels.includes(model.id))
                                .flatMap(model => model.features)
                            )
                          ).map(feature => (
                            <tr key={feature} className="border-b">
                              <td className="py-2">{feature}</td>
                              {models
                                .filter(model => selectedModels.includes(model.id))
                                .map(model => (
                                  <td key={model.id} className="text-center py-2 px-4">
                                    {model.features.includes(feature) ? (
                                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-500 mx-auto" />
                                    )}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Model details dialog */}
        <Dialog open={modelDetailsOpen !== null} onOpenChange={() => setModelDetailsOpen(null)}>
          <DialogContent className="max-w-xl">
            {modelDetailsOpen && (() => {
              const model = models.find(m => m.id === modelDetailsOpen);
              if (!model) return null;
              
              return (
                <>
                  <DialogHeader>
                    <DialogTitle>{model.name}</DialogTitle>
                    <DialogDescription>
                      {model.modelType} model trained on {formatDate(model.createdAt)}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Performance Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-muted/30 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                          <div className="font-medium">{(model.accuracy * 100).toFixed(1)}%</div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground">RMSE</div>
                          <div className="font-medium">{model.rmse?.toFixed(3) || 'N/A'}</div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground">MSE</div>
                          <div className="font-medium">{model.mse?.toFixed(3) || 'N/A'}</div>
                        </div>
                        <div className="bg-muted/30 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground">R²</div>
                          <div className="font-medium">{model.r2?.toFixed(3) || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Features ({model.features.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {model.features.map(feature => (
                          <Badge key={feature} variant="secondary">{feature}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Parameters</h4>
                      <div className="bg-muted/30 p-2 rounded-lg">
                        <pre className="text-xs overflow-auto max-h-40">
                          {JSON.stringify(model.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ModelComparisonTool;
