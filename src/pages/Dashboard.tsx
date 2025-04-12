import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Users, ArrowUp, ArrowDown, BarChart2, BrainCircuit, AlertCircle, Clock } from "lucide-react";
import DataInsightsPanel from "@/components/DataInsightsPanel";
import RetentionPrediction from "@/components/RetentionPrediction";
import PerformanceDashboard from "@/components/dashboard/PerformanceDashboard";
import AiFeedbackAnalysis from "@/components/AiFeedbackAnalysis";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import NotificationsTab from "@/components/dashboard/NotificationsTab";
import DataImportModal from "@/components/DataImportModal";

// Mocked insights data
const mockedInsights = {
  summary: "Overall employee retention is stable at 85%, but there are 24 high-risk employees who need attention. The engineering department shows the highest turnover risk (22%), primarily due to compensation concerns and limited growth opportunities.",
  riskEmployees: [
    {
      name: "John Smith",
      risk: "high" as const,
      reason: "Low engagement scores, missed last two performance reviews, and salary below market rate for position.",
      recommendation: "Schedule a one-on-one meeting to discuss career goals and consider a salary adjustment."
    },
    {
      name: "Sarah Johnson",
      risk: "high" as const,
      reason: "Working excessive overtime (40+ hours beyond regular), expressed frustration in recent surveys.",
      recommendation: "Redistribute workload and evaluate team capacity, consider adding team member."
    },
    {
      name: "Michael Brown",
      risk: "medium" as const,
      reason: "Passed over for promotion twice, despite good performance reviews.",
      recommendation: "Create a clear advancement plan with specific milestones for the next 6 months."
    },
    {
      name: "Emily Davis",
      risk: "medium" as const,
      reason: "Lower engagement on team activities, decrease in productivity over last quarter.",
      recommendation: "Explore project interests and align work assignments with career development goals."
    },
    {
      name: "Robert Wilson",
      risk: "low" as const,
      reason: "Recent decrease in positive peer feedback, though performance metrics remain strong.",
      recommendation: "Soft skills coaching and team building opportunities."
    }
  ],
  retentionRate: 85,
  keyFactors: [
    "Compensation",
    "Work-Life Balance",
    "Career Growth",
    "Management Quality",
    "Job Satisfaction",
    "Training Opportunities"
  ],
  departmentInsights: [
    {
      department: "Engineering",
      riskLevel: "high",
      recommendations: "Review compensation structure, implement career development framework, and regular skill development workshops."
    },
    {
      department: "Sales",
      riskLevel: "medium",
      recommendations: "Improve commission structure transparency, provide more consistent feedback, and clearer promotion criteria."
    },
    {
      department: "Customer Support",
      riskLevel: "low",
      recommendations: "Continue team recognition program, maintain flexible scheduling, and regular check-ins."
    },
    {
      department: "Marketing",
      riskLevel: "low",
      recommendations: "More cross-team collaboration opportunities and skill development."
    },
  ]
};

// Mock feedback data for AiFeedbackAnalysis
const mockFeedbacks = [
  {
    id: "1",
    topic: "Work-Life Balance",
    sentiment: "negative",
    feedback: "Many employees mentioned they are working long hours and feel burnout.",
    actionItems: [
      "Review workload distribution across teams",
      "Consider implementing flexible work schedule",
      "Train managers on recognizing burnout signals"
    ],
    impactScore: 85
  },
  {
    id: "2",
    topic: "Compensation",
    sentiment: "neutral",
    feedback: "Employees appreciate recent adjustments but still consider compensation below market average.",
    actionItems: [
      "Conduct market compensation analysis",
      "Develop clearer salary progression framework",
      "Consider non-monetary benefits"
    ],
    impactScore: 75
  },
  {
    id: "3",
    topic: "Career Growth",
    sentiment: "positive",
    feedback: "Recent training opportunities and mentorship program have been well received.",
    actionItems: [
      "Expand mentorship program to junior employees",
      "Create individualized development plans",
      "Establish clear promotion criteria"
    ],
    impactScore: 60
  }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [csvData, setCsvData] = useState<any[] | null>(null);
  
  const handleDataImport = (data: any[]) => {
    console.log("Data imported:", data);
    setCsvData(data);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-green-500 mt-1">
              +2.5% from last quarter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">At-Risk Employees</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-red-500 mt-1">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Employee Tenure</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 yrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              -0.3 yrs from last year
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Data Import Alert */}
          {!csvData && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No data imported</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>Import your employee data to see retention insights and predictions.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit"
                >
                  Import Data
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Main Dashboard Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <PerformanceDashboard />
              <AiFeedbackAnalysis feedbacks={mockFeedbacks} />
            </div>
            <div className="space-y-4">
              <DataInsightsPanel insights={mockedInsights} csvData={csvData} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <RetentionPrediction />
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
      
      {/* Import Modal */}
      <DataImportModal onDataImport={handleDataImport} />
    </div>
  );
};

export default Dashboard;
