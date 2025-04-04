
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Brain, CalendarDays, Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RiskBadge from "@/components/RiskBadge";

// Sample employee data
const employeeData = {
  id: 2,
  name: "Jamie Smith",
  role: "Marketing Manager",
  department: "Marketing",
  email: "jamie.smith@company.com",
  phone: "(555) 123-4567",
  location: "New York",
  startDate: "2022-03-15",
  manager: "Alex Johnson",
  retentionScore: 45,
  riskLevel: "high",
  salary: 85000,
  lastPromotion: "2023-01-10",
  performanceRatings: [
    { period: "2023 Q1", score: 3.8 },
    { period: "2023 Q2", score: 3.5 },
    { period: "2023 Q3", score: 3.2 },
    { period: "2023 Q4", score: 3.0 },
  ],
  satisfactionScores: [
    { category: "Work-Life Balance", score: 2.5 },
    { category: "Compensation", score: 2.0 },
    { category: "Career Growth", score: 1.8 },
    { category: "Management", score: 3.5 },
    { category: "Company Culture", score: 3.2 },
  ],
  feedbacks: [
    { 
      date: "2023-12-10", 
      content: "I feel underpaid compared to market rates for my position. I like the team but I'm not seeing a clear path for advancement."
    },
    { 
      date: "2023-09-05", 
      content: "The workload has been increasingly difficult to manage. I often work late to meet deadlines which is affecting my personal life."
    },
  ],
};

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee] = useState(employeeData); // In a real app, this would fetch based on the ID
  const { toast } = useToast();
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const handleGenerateInsights = () => {
    setIsGeneratingInsights(true);
    // Simulate API call to GPT-4o
    setTimeout(() => {
      setIsGeneratingInsights(false);
      toast({
        title: "Insights Generated",
        description: "AI analysis has been completed for this employee.",
      });
    }, 2000);
  };

  // Calculate tenure in years and months
  const calculateTenure = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const years = today.getFullYear() - start.getFullYear();
    const months = today.getMonth() - start.getMonth();
    
    if (months < 0) {
      return `${years - 1} years, ${months + 12} months`;
    }
    return `${years} years, ${months} months`;
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Employee Profile</h1>
          <p className="text-gray-600">
            View detailed information and retention insights for {employee.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Employee Info */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>Personal and job details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <UserCircle className="h-16 w-16 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">{employee.name}</h2>
                <p className="text-gray-500">{employee.role}</p>
                <div className="mt-2">
                  <RiskBadge risk={employee.riskLevel as "low" | "medium" | "high"} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{employee.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm font-medium">{employee.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CalendarDays className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="text-sm font-medium">{formatDate(employee.startDate)}</p>
                    <p className="text-xs text-gray-400">Tenure: {calculateTenure(employee.startDate)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Job Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Department</span>
                    <span className="text-sm font-medium">{employee.department}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Manager</span>
                    <span className="text-sm font-medium">{employee.manager}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Salary</span>
                    <span className="text-sm font-medium">${employee.salary.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Promotion</span>
                    <span className="text-sm font-medium">{formatDate(employee.lastPromotion)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Analysis and Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Retention Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Retention Risk</CardTitle>
                    <CardDescription>Current retention probability</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateInsights}
                    disabled={isGeneratingInsights}
                  >
                    {isGeneratingInsights ? "Generating..." : "Generate AI Insights"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500">Retention Score</p>
                      <p className="text-3xl font-bold">{employee.retentionScore}%</p>
                    </div>
                    <div className="text-right">
                      <RiskBadge risk={employee.riskLevel as "low" | "medium" | "high"} className="text-sm" />
                      <p className="text-sm text-gray-500 mt-1">Updated today</p>
                    </div>
                  </div>

                  <div>
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          employee.retentionScore >= 70 
                            ? "bg-risk-low" 
                            : employee.retentionScore >= 50 
                              ? "bg-risk-medium" 
                              : "bg-risk-high"
                        }`} 
                        style={{ width: `${employee.retentionScore}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>High Risk</span>
                      <span>Medium Risk</span>
                      <span>Low Risk</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different data */}
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
                <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>Quarterly performance ratings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {employee.performanceRatings.map((rating, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{rating.period}</span>
                            <span className="text-sm font-medium">{rating.score}/5</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                rating.score >= 4 
                                  ? "bg-risk-low" 
                                  : rating.score >= 3 
                                    ? "bg-risk-medium" 
                                    : "bg-risk-high"
                              }`} 
                              style={{ width: `${(rating.score / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Performance Insight:</span> Jamie's performance ratings have been on a downward trend over the past year, which often correlates with increased turnover risk.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="satisfaction">
                <Card>
                  <CardHeader>
                    <CardTitle>Satisfaction Metrics</CardTitle>
                    <CardDescription>Areas of satisfaction from recent surveys</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {employee.satisfactionScores.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm font-medium">{item.score}/5</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${
                                item.score >= 4 
                                  ? "bg-risk-low" 
                                  : item.score >= 3 
                                    ? "bg-risk-medium" 
                                    : "bg-risk-high"
                              }`} 
                              style={{ width: `${(item.score / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Satisfaction Insight:</span> Jamie scores particularly low on Career Growth and Compensation, which are key indicators of potential turnover.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback">
                <Card>
                  <CardHeader>
                    <CardTitle>Feedback Analysis</CardTitle>
                    <CardDescription>AI-processed feedback from surveys and 1:1s</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {employee.feedbacks.map((feedback, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Feedback</span>
                            <span className="text-xs text-gray-500">{formatDate(feedback.date)}</span>
                          </div>
                          <p className="text-sm">{feedback.content}</p>
                        </div>
                      ))}

                      <div className="p-4 bg-thrive-50 rounded-lg border border-thrive-100">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center mt-1">
                            <Brain className="h-4 w-4 text-thrive-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">AI Sentiment Analysis</h4>
                            <p className="text-sm text-gray-600 mt-2">
                              Feedback shows consistent concerns about compensation and career growth. Key sentiment indicators suggest frustration (67%) and uncertainty (82%) about future at the company.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-thrive-50 rounded-lg border border-thrive-100">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center mt-1">
                            <Brain className="h-4 w-4 text-thrive-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Recommended Actions</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                              <li>Schedule a career development conversation within the next week</li>
                              <li>Review compensation compared to market rates for similar roles</li>
                              <li>Consider workload redistribution to improve work-life balance</li>
                              <li>Explore potential for a role expansion or special project aligned with interests</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;
