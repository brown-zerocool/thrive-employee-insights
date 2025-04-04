
/**
 * Export utility functions for the dashboard
 */

/**
 * Exports dashboard data to CSV format
 */
export const exportToCSV = () => {
  // Get employee data
  const recentEmployees = [
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

  // Create CSV content
  const headers = ["Name", "Role", "Department", "Retention Score", "Risk Level"];
  const csvContent = [
    headers.join(","),
    ...recentEmployees.map(employee => 
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
};

/**
 * Export dashboard data to PDF format 
 * (For demonstration - this would typically use a library like jsPDF)
 */
export const exportToPDF = () => {
  // In a real implementation, we would use a library like jsPDF
  alert("PDF export functionality would be implemented here with a PDF generation library");
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
      alert("Excel export would be implemented here");
      break;
    default:
      exportToCSV(); // Default to CSV
  }
};
