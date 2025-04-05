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
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCcw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
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
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const turnoverData = [
  { month: 'Jan', voluntary: 4, involuntary: 2 },
  { month: 'Feb', voluntary: 3, involuntary: 1 },
  { month: 'Mar', voluntary: 5, involuntary: 2 },
  { month: 'Apr', voluntary: 2, involuntary: 3 },
  { month: 'May', voluntary: 6, involuntary: 1 },
  { month: 'Jun', voluntary: 4, involuntary: 2 },
];

const engagementData = [
  { month: 'Jan', engagement: 72 },
  { month: 'Feb', engagement: 68 },
  { month: 'Mar', engagement: 75 },
  { month: 'Apr', engagement: 79 },
  { month: 'May', engagement: 82 },
  { month: 'Jun', engagement: 80 },
];

const retentionByDepartmentData = [
  { name: 'Engineering', value: 92 },
  { name: 'Sales', value: 78 },
  { name: 'Marketing', value: 86 },
  { name: 'HR', value: 94 },
  { name: 'Support', value: 83 },
];

const salaryCompetitivenessData = [
  { position: 'Junior Dev', internal: 65000, market: 70000 },
  { position: 'Senior Dev', internal: 110000, market: 115000 },
  { position: 'Designer', internal: 75000, market: 72000 },
  { position: 'Manager', internal: 120000, market: 125000 },
  { position: 'Analyst', internal: 82000, market: 80000 },
];

const AnalyticsTab = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [departmentDistribution, setDepartmentDistribution] = useState(analyticsData.departmentDistribution);
  const [riskDistribution, setRiskDistribution] = useState(analyticsData.riskDistribution);
  const [analyticsView, setAnalyticsView] = useState("overview");
  const totalEmployees = departmentDistribution.reduce((sum, item) => sum + item.value, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info("Refreshing analytics data...");
    
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
      
      <Tabs value={analyticsView} onValueChange={setAnalyticsView}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="turnover">Turnover</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
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
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData.retentionTrend}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[70, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="rate" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Total Headcount Trend</CardTitle>
                  <CardDescription>Monthly employee count changes</CardDescription>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', count: 235 },
                      { month: 'Feb', count: 238 },
                      { month: 'Mar', count: 240 },
                      { month: 'Apr', count: 242 },
                      { month: 'May', count: 243 },
                      { month: 'Jun', count: 244 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Time-to-Hire Trend</CardTitle>
                  <CardDescription>Average days to fill positions</CardDescription>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { department: 'Eng', days: 28 },
                      { department: 'Sales', days: 22 },
                      { department: 'Mktg', days: 18 },
                      { department: 'HR', days: 15 },
                      { department: 'Supp', days: 20 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="days" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="turnover" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Employee Turnover Analysis</CardTitle>
                <CardDescription>Voluntary vs. Involuntary Turnover</CardDescription>
              </div>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnoverData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="voluntary" name="Voluntary" fill="#82ca9d" />
                    <Bar dataKey="involuntary" name="Involuntary" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exit Interview Reasons</CardTitle>
                <CardDescription>Top reasons employees leave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Career Growth', value: 35 },
                          { name: 'Compensation', value: 25 },
                          { name: 'Work-Life Balance', value: 18 },
                          { name: 'Management', value: 12 },
                          { name: 'Company Culture', value: 10 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Career Growth', value: 35 },
                          { name: 'Compensation', value: 25 },
                          { name: 'Work-Life Balance', value: 18 },
                          { name: 'Management', value: 12 },
                          { name: 'Company Culture', value: 10 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tenure Distribution</CardTitle>
                <CardDescription>Employee years at company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '<1 year', count: 48 },
                      { range: '1-2 years', count: 62 },
                      { range: '2-5 years', count: 85 },
                      { range: '5-10 years', count: 36 },
                      { range: '10+ years', count: 13 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Employees" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Engagement Index</CardTitle>
              <CardDescription>6-month engagement trend based on surveys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="engagement" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retention by Department</CardTitle>
                <CardDescription>Retention rates across teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={retentionByDepartmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" name="Retention %" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Drivers</CardTitle>
                <CardDescription>Key factors affecting engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Recognition', value: 28 },
                          { name: 'Growth', value: 22 },
                          { name: 'Work-Life', value: 18 },
                          { name: 'Leadership', value: 16 },
                          { name: 'Compensation', value: 16 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Recognition', value: 28 },
                          { name: 'Growth', value: 22 },
                          { name: 'Work-Life', value: 18 },
                          { name: 'Leadership', value: 16 },
                          { name: 'Compensation', value: 16 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compensation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Market Competitiveness</CardTitle>
              <CardDescription>Internal vs. market rates for key positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryCompetitivenessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="internal" name="Internal Salary" fill="#8884d8" />
                    <Bar dataKey="market" name="Market Average" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
                <CardDescription>Employee counts by salary range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '<$50K', count: 32 },
                      { range: '$50K-$75K', count: 78 },
                      { range: '$75K-$100K', count: 56 },
                      { range: '$100K-$150K', count: 48 },
                      { range: '$150K+', count: 30 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Employees" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Compensation Satisfaction</CardTitle>
                <CardDescription>From employee surveys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Very Satisfied', value: 24 },
                          { name: 'Satisfied', value: 38 },
                          { name: 'Neutral', value: 22 },
                          { name: 'Dissatisfied', value: 12 },
                          { name: 'Very Dissatisfied', value: 4 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Very Satisfied', value: 24 },
                          { name: 'Satisfied', value: 38 },
                          { name: 'Neutral', value: 22 },
                          { name: 'Dissatisfied', value: 12 },
                          { name: 'Very Dissatisfied', value: 4 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
