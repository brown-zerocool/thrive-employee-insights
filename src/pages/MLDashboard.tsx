
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import MLDashboard from "@/components/ml/MLDashboard";
import BatchPredictionProcessor from "@/components/ml/BatchPredictionProcessor";
import ModelComparisonTool from "@/components/ml/ModelComparisonTool";
import MachineLearningPanel from "@/components/ml/MachineLearningPanel";
import NotificationsSystem from "@/components/NotificationsSystem";
import { Card } from "@/components/ui/card";

const MLDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with breadcrumb and notifications */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <span>ML Dashboard</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="mt-4 md:mt-0">
            <NotificationsSystem />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Machine Learning Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Train models, run predictions, and analyze results
          </p>
        </div>

        {/* Main Content */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid md:grid-cols-4 grid-cols-2 gap-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-3 border shadow-sm"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="train" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-3 border shadow-sm"
            >
              Train Models
            </TabsTrigger>
            <TabsTrigger 
              value="batch" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-3 border shadow-sm"
            >
              Batch Predictions
            </TabsTrigger>
            <TabsTrigger 
              value="compare" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all py-3 border shadow-sm"
            >
              Compare Models
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <Card className="p-6">
              <MLDashboard />
            </Card>
          </TabsContent>
          
          <TabsContent value="train" className="space-y-6">
            <MachineLearningPanel />
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-6">
            <BatchPredictionProcessor />
          </TabsContent>
          
          <TabsContent value="compare" className="space-y-6">
            <ModelComparisonTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MLDashboardPage;
