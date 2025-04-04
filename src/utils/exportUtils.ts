
/**
 * Export utility functions for the dashboard
 */

import { toast } from "sonner";

// Type definitions
export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  retentionScore: number;
  riskLevel: "low" | "medium" | "high";
}

export interface Report {
  title: string;
  description: string;
  date: string;
  type: string;
  fileSize?: string;
  downloadUrl?: string;
}

export interface AnalyticsData {
  departmentDistribution: { name: string; value: number }[];
  riskDistribution: { level: string; percentage: number; count: number }[];
  retentionTrend: { month: string; rate: number }[];
}

// Sample data for reports
export const sampleReports: Report[] = [
  {
    title: "Monthly Retention Report",
    description: "Comprehensive analysis of employee retention metrics",
    date: "April 2025",
    type: "retention",
    fileSize: "2.4 MB",
    downloadUrl: "#"
  },
  {
    title: "Quarterly Risk Analysis",
    description: "Detailed breakdown of employee risk factors",
    date: "Q1 2025",
    type: "risk",
    fileSize: "3.1 MB",
    downloadUrl: "#"
  },
  {
    title: "Department Comparison",
    description: "Cross-department retention and satisfaction metrics",
    date: "March 2025",
    type: "department",
    fileSize: "1.8 MB",
    downloadUrl: "#"
  }
];

// Sample data for recent employees
export const recentEmployees: Employee[] = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Developer",
    department: "Engineering",
    retentionScore: 78,
    riskLevel: "low",
  },
  {
    id: 2,
    name: "Maria Garcia",
    role: "Product Manager",
    department: "Product",
    retentionScore: 45,
    riskLevel: "medium",
  },
  {
    id: 3,
    name: "David Kim",
    role: "UI/UX Designer",
    department: "Design",
    retentionScore: 38,
    riskLevel: "high",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    role: "Marketing Specialist",
    department: "Marketing",
    retentionScore: 56,
    riskLevel: "medium",
  },
  {
    id: 5,
    name: "James Taylor",
    role: "Customer Support",
    department: "Operations",
    retentionScore: 82,
    riskLevel: "low",
  },
];

// Sample analytics data
export const analyticsData: AnalyticsData = {
  departmentDistribution: [
    { name: "Engineering", value: 48 },
    { name: "Marketing", value: 21 },
    { name: "Sales", value: 35 },
    { name: "Operations", value: 19 },
    { name: "Design", value: 16 },
    { name: "HR", value: 12 },
  ],
  riskDistribution: [
    { level: "Low Risk", percentage: 68, count: 166 },
    { level: "Medium Risk", percentage: 19, count: 46 },
    { level: "High Risk", percentage: 13, count: 32 }
  ],
  retentionTrend: [
    { month: "Jan", rate: 84 },
    { month: "Feb", rate: 85 },
    { month: "Mar", rate: 83 },
    { month: "Apr", rate: 87 },
    { month: "May", rate: 89 },
    { month: "Jun", rate: 87 }
  ]
};

/**
 * Exports dashboard data to CSV format
 */
export const exportToCSV = () => {
  // Get employee data
  const employees = recentEmployees;

  // Create CSV content
  const headers = ["Name", "Role", "Department", "Retention Score", "Risk Level"];
  const csvContent = [
    headers.join(","),
    ...employees.map(employee => 
      [
        employee.name,
        employee.role,
        employee.department,
        employee.retentionScore + "%",
        employee.riskLevel
      ].join(",")
    )
  ].join("\n");

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  // Set up download
  link.setAttribute("href", url);
  link.setAttribute("download", `thrive_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  // Append to document, trigger download and cleanup
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success("CSV exported successfully");
};

/**
 * Export dashboard data to PDF format 
 */
export const exportToPDF = () => {
  // In a real implementation, we would use a library like jsPDF
  toast.info("PDF generation started", {
    description: "Your file will be ready to download shortly"
  });
  
  // Simulate PDF generation delay
  setTimeout(() => {
    toast.success("PDF generated successfully", {
      description: "Your file is ready to download"
    });
  }, 3000);
};

/**
 * Export data to Excel format
 */
export const exportToExcel = () => {
  toast.info("Excel generation started", {
    description: "Your file will be ready to download shortly"
  });
  
  // Simulate Excel generation delay
  setTimeout(() => {
    toast.success("Excel generated successfully", {
      description: "Your file is ready to download"
    });
  }, 2500);
};

/**
 * Generate analytics report
 */
export const generateAnalyticsReport = (type: string) => {
  toast.info(`Generating ${type} report`, {
    description: "This may take a moment to complete"
  });
  
  // Simulate report generation delay
  setTimeout(() => {
    toast.success("Report generated successfully", {
      description: "Your report is ready to view"
    });
  }, 3000);
};

/**
 * Handle all export options
 */
export const handleExport = (format: "csv" | "pdf" | "excel") => {
  switch (format) {
    case "csv":
      exportToCSV();
      break;
    case "pdf":
      exportToPDF();
      break;
    case "excel":
      exportToExcel();
      break;
    default:
      exportToCSV(); // Default to CSV
  }
};

/**
 * Download a report
 */
export const downloadReport = (report: Report) => {
  toast.info(`Preparing ${report.title}`, {
    description: "Your download will begin shortly"
  });
  
  // Simulate download delay
  setTimeout(() => {
    toast.success("Download complete", {
      description: `${report.title} has been downloaded`
    });
  }, 2000);
};

/**
 * Mark notification as read
 */
export const markNotificationRead = (notificationId: number) => {
  toast.success("Notification marked as read");
  return notificationId;
};

/**
 * Dismiss all notifications
 */
export const dismissAllNotifications = () => {
  toast.success("All notifications cleared");
  return true;
};

