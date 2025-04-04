
import { useState } from "react";
import Navbar from "@/components/Navbar";
import EmployeeTable from "@/components/EmployeeTable";
import RiskBadge from "@/components/RiskBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, UserCheck, UserX, Users, Briefcase, LineChart, BarChart } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Monitor employee retention metrics and identify at-risk employees.
          </p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="employees">Employees</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Employees
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">158</div>
                  <p className="text-xs text-muted-foreground">
                    +12 from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">At Risk Employees</CardTitle>
                  <UserX className="h-4 w-4 text-risk-high" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <div className="flex items-center">
                    <p className="text-xs text-muted-foreground">
                      15.2% of workforce
                    </p>
                    <RiskBadge risk="high" className="ml-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.5%</div>
                  <p className="text-xs text-risk-low">
                    +2.1% from last quarter
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Satisfaction</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.8/5</div>
                  <p className="text-xs text-risk-medium">
                    -0.2 from last quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Employee breakdown by risk level</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-16 text-sm font-medium">High Risk</div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-risk-high" style={{ width: "15%" }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">24</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-16 text-sm font-medium">Medium Risk</div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-risk-medium" style={{ width: "27%" }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">43</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-16 text-sm font-medium">Low Risk</div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div className="h-2 rounded-full bg-risk-low" style={{ width: "58%" }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">91</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Retention Insights</CardTitle>
                  <CardDescription>AI-generated suggestions based on employee data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-thrive-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Engineering Team Risk</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            The Engineering department shows a 23% higher turnover risk than other departments, with salary satisfaction being the primary factor.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-thrive-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Senior Developer Retention</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Consider providing more growth opportunities for senior developers. Employees with 3+ years experience mention career development in feedback.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center">
                          <Brain className="h-4 w-4 text-thrive-700" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Work-Life Balance</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Recent survey results indicate work-life balance concerns across all departments. Consider reviewing workload distribution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top At-Risk Employees */}
            <Card>
              <CardHeader>
                <CardTitle>Top At-Risk Employees</CardTitle>
                <CardDescription>Employees with highest likelihood of leaving</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
                <CardDescription>View and manage employee retention data</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeeTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department Analysis</CardTitle>
                <CardDescription>Retention metrics broken down by department</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">Engineering</span>
                      </div>
                      <span className="text-sm font-medium">
                        <RiskBadge risk="high" />
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-risk-high" style={{ width: "67%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>42 employees</span>
                      <span>67% average retention score</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">Sales</span>
                      </div>
                      <span className="text-sm font-medium">
                        <RiskBadge risk="medium" />
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-risk-medium" style={{ width: "74%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>28 employees</span>
                      <span>74% average retention score</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">Marketing</span>
                      </div>
                      <span className="text-sm font-medium">
                        <RiskBadge risk="low" />
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-risk-low" style={{ width: "86%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>24 employees</span>
                      <span>86% average retention score</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">HR</span>
                      </div>
                      <span className="text-sm font-medium">
                        <RiskBadge risk="low" />
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-risk-low" style={{ width: "92%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>12 employees</span>
                      <span>92% average retention score</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="font-medium">Finance</span>
                      </div>
                      <span className="text-sm font-medium">
                        <RiskBadge risk="medium" />
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-risk-medium" style={{ width: "78%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>18 employees</span>
                      <span>78% average retention score</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Retention Over Time</CardTitle>
                    <CardDescription>Quarterly retention rates</CardDescription>
                  </div>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">Retention trend chart will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Satisfaction Factors</CardTitle>
                    <CardDescription>Key drivers of employee satisfaction</CardDescription>
                  </div>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">Satisfaction factors chart will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
