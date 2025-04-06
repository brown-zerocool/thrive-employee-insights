
import { useState } from "react";
import { ChevronRight, FileSpreadsheet, Plus, UploadCloud, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import EmployeeTable from "@/components/EmployeeTable";
import DataImportModal from "@/components/DataImportModal";
import { toast } from "sonner";
import NewEmployeeModal from "@/components/NewEmployeeModal";

const Employees = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
  };
  
  const handleCreateEmployee = () => {
    setIsNewEmployeeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link to="/dashboard">Dashboard</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <span>Employees</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Directory</h1>
            <p className="text-gray-500 mt-1">
              View and manage your organization's employees
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline"
              onClick={handleOpenImportModal}
              className="flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              Import Data
            </Button>
            
            <Button 
              onClick={handleCreateEmployee}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <h3 className="text-3xl font-bold mt-1">158</h3>
                <p className="text-sm text-green-600 mt-1">
                  +12 this month
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">High Risk Employees</p>
                <h3 className="text-3xl font-bold mt-1">24</h3>
                <p className="text-sm text-red-600 mt-1">
                  15% of workforce
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-risk-high" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recently Updated</p>
                <h3 className="text-3xl font-bold mt-1">37</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Last 30 days
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <EmployeeTable />
        </div>

        {/* Import Modal */}
        <DataImportModal 
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
        />

        {/* New Employee Modal */}
        <NewEmployeeModal
          open={isNewEmployeeModalOpen}
          onOpenChange={setIsNewEmployeeModalOpen}
        />
      </div>
    </div>
  );
};

export default Employees;
