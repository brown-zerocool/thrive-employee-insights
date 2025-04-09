import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  FileText,
  Plus,
  UserIcon,
  Settings,
  LogOut,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RiskBadge from "@/components/RiskBadge";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { handleExport, recentEmployees } from "@/utils/exportUtils";
import NewEmployeeModal from "@/components/NewEmployeeModal";
import DataImportModal from "@/components/DataImportModal";
import { toast } from "sonner";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import NotificationsTab from "@/components/dashboard/NotificationsTab";
import UserProfileModal from "@/components/UserProfileModal";
import SettingsModal from "@/components/SettingsModal";
import RetentionPrediction from "@/components/RetentionPrediction";

const totalEmployees = 244;
const atRiskEmployees = 32;
const retentionRate = 87;

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
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const navigate = useNavigate();

  const handleDataImport = () => {
    setShowImportModal(true);
  };

  const handleGenerateReport = () => {
    toast.success("Report generation started. This may take a few moments.");
    
    // Simulate report generation
    setTimeout(() => {
      toast.success("Report generated successfully", {
        description: "Your report is now available in the Reports tab"
      });
      setActiveTab("reports");
    }, 3000);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleLogout = () => {
    toast.success("Logging out...");
    setTimeout(() => {
      logout();
      navigate("/login");
    }, 1000);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

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
            onClick={handleSettingsClick}
          >
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            aria-label="Notifications"
            onClick={() => setActiveTab("notifications")}
          >
            <AlertCircle className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-thrive-600 text-white flex items-center justify-center">
                  {getUserInitials()}
                </div>
                <span className="hidden md:inline-block">
                  {user?.email || "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="h-10 w-10 rounded-full bg-thrive-600 text-white flex items-center justify-center text-lg">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || 'User'}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48">
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => handleExport("csv")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => handleExport("pdf")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export as PDF
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start" 
                      onClick={() => handleExport("excel")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Export as Excel
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>New</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowNewEmployeeModal(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    Add Employee
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDataImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleGenerateReport}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Generate Report
                  </DropdownMenuItem>
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
              <TabsTrigger value="predictions" className="flex items-center gap-1">
                <BrainCircuit className="h-4 w-4" />
                Predictions
              </TabsTrigger>
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
                                  <DropdownMenuItem>
                                    <Link to={`/employee/${employee.id}`}>
                                      View details
                                    </Link>
                                  </DropdownMenuItem>
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
            
            <TabsContent value="analytics" className="space-y-4">
              <AnalyticsTab />
            </TabsContent>
            
            <TabsContent value="predictions" className="space-y-4">
              <RetentionPrediction />
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <ReportsTab />
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <NotificationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Fix the props for the modals */}
      <NewEmployeeModal 
        open={showNewEmployeeModal} 
        onOpenChange={setShowNewEmployeeModal} 
      />
      <DataImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
      />
      <UserProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
    </div>
  );
};

export default Dashboard;
