
import { useState } from "react";
import {
  BarChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  MoreHorizontal,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import RiskBadge from "@/components/RiskBadge";
import { useAuth } from "@/hooks/useAuth";

// Mocked data for the dashboard
const totalEmployees = 244;
const atRiskEmployees = 32;
const retentionRate = 87;

const recentEmployees = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Developer",
    department: "Engineering",
    retentionScore: 78,
    riskLevel: "low" as const,
  },
  {
    id: 2,
    name: "Maria Garcia",
    role: "Product Manager",
    department: "Product",
    retentionScore: 45,
    riskLevel: "medium" as const,
  },
  {
    id: 3,
    name: "David Kim",
    role: "UI/UX Designer",
    department: "Design",
    retentionScore: 38,
    riskLevel: "high" as const,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    role: "Marketing Specialist",
    department: "Marketing",
    retentionScore: 56,
    riskLevel: "medium" as const,
  },
  {
    id: 5,
    name: "James Taylor",
    role: "Customer Support",
    department: "Operations",
    retentionScore: 82,
    riskLevel: "low" as const,
  },
];

// Mocked retention strategies
const retentionStrategies = [
  {
    employee: "Maria Garcia",
    strategy: "Schedule a one-on-one meeting to discuss career growth opportunities within the company.",
  },
  {
    employee: "David Kim",
    strategy: "Consider a compensation adjustment as his current salary is below market rate for his experience level.",
  },
  {
    employee: "Sarah Wilson",
    strategy: "Offer additional training and mentorship to help develop skills in her area of interest.",
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-thrive-600"
          >
            <path d="M16 16h6"></path>
            <path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h7"></path>
            <path d="M12 4v4"></path>
            <path d="M9 4v1"></path>
            <path d="M15 4v1"></path>
            <path d="M16 19h6"></path>
            <path d="M19 16v6"></path>
          </svg>
          <span className="text-lg font-semibold text-thrive-600">Thrive</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Settings"
          >
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Notifications"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <span className="hidden md:inline-block">
                  {user?.email || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {}}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-8 md:gap-8">
        <div className="grid auto-rows-max gap-4 md:gap-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Dashboard
              </h1>
              <p className="text-gray-500">
                Monitor employee retention metrics and predictions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <span>New</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Add Employee</DropdownMenuItem>
                  <DropdownMenuItem>Upload Data</DropdownMenuItem>
                  <DropdownMenuItem>Generate Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Employees
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      +3 since last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      At-Risk Employees
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{atRiskEmployees}</div>
                    <p className="text-xs text-muted-foreground">
                      13% of workforce
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Retention Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{retentionRate}%</div>
                    <p className="text-xs text-muted-foreground">
                      +2% from previous quarter
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Employees</CardTitle>
                    <CardDescription>
                      Viewing {recentEmployees.length} employees with their
                      retention scores
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Retention Score</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">
                              {employee.name}
                            </TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.retentionScore}%</TableCell>
                            <TableCell>
                              <RiskBadge risk={employee.riskLevel} />
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Retention Insights</CardTitle>
                    <CardDescription>
                      AI-generated strategies to improve retention
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {retentionStrategies.map((strategy, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-thrive-600" />
                          <h3 className="font-semibold">{strategy.employee}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {strategy.strategy}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
