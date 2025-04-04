
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
  Download,
  File,
  FilePlus,
  Filter,
} from "lucide-react";
import { sampleReports, downloadReport, Report } from "@/utils/exportUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportsTab = () => {
  const [reportFilter, setReportFilter] = useState("all");
  const [reports, setReports] = useState<Report[]>(sampleReports);

  const filteredReports = reportFilter === "all" 
    ? reports 
    : reports.filter(report => report.type === reportFilter);

  const handleCreateReport = () => {
    const newReport: Report = {
      title: "Custom Report",
      description: "User-generated analytical report",
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      type: "custom",
      fileSize: "1.2 MB",
    };
    
    setReports([newReport, ...reports]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select value={reportFilter} onValueChange={setReportFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter reports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="retention">Retention</SelectItem>
              <SelectItem value="risk">Risk Analysis</SelectItem>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleCreateReport}>
          <FilePlus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Download and manage retention reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      {report.fileSize && (
                        <p className="text-xs text-muted-foreground mt-1">{report.fileSize}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadReport(report)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <File className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No reports found matching your filter</p>
                <Button variant="outline" className="mt-4" onClick={() => setReportFilter("all")}>
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
