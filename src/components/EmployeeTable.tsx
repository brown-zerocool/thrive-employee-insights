
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import RiskBadge from "@/components/RiskBadge";
import EmployeeFilterDropdown from "@/components/EmployeeFilterDropdown";
import EmployeeBulkActions from "@/components/EmployeeBulkActions";
import EmployeeSort from "@/components/EmployeeSort";
import EmployeeQuickActions from "@/components/EmployeeQuickActions";
import EmployeePagination from "@/components/EmployeePagination";

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  retentionScore: number;
  riskLevel: "low" | "medium" | "high";
  performance: number;
  tenure: number;
  email?: string;
}

// Sample employee data
const sampleEmployees: Employee[] = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Developer",
    department: "Engineering",
    retentionScore: 87,
    riskLevel: "low",
    performance: 4.2,
    tenure: 3.5,
    email: "alex.johnson@company.com"
  },
  {
    id: 2,
    name: "Jamie Smith",
    role: "Marketing Manager",
    department: "Marketing",
    retentionScore: 45,
    riskLevel: "high",
    performance: 3.8,
    tenure: 1.2,
    email: "jamie.smith@company.com"
  },
  {
    id: 3,
    name: "Taylor Reed",
    role: "Sales Representative",
    department: "Sales",
    retentionScore: 63,
    riskLevel: "medium",
    performance: 4.0,
    tenure: 2.0,
    email: "taylor.reed@company.com"
  },
  {
    id: 4,
    name: "Morgan Chen",
    role: "UX Designer",
    department: "Design",
    retentionScore: 92,
    riskLevel: "low",
    performance: 4.5,
    tenure: 4.2,
    email: "morgan.chen@company.com"
  },
  {
    id: 5,
    name: "Jordan Williams",
    role: "HR Specialist",
    department: "Human Resources",
    retentionScore: 58,
    riskLevel: "medium",
    performance: 3.6,
    tenure: 1.8,
    email: "jordan.williams@company.com"
  },
  {
    id: 6,
    name: "Casey Garcia",
    role: "Product Manager",
    department: "Product",
    retentionScore: 42,
    riskLevel: "high",
    performance: 3.9,
    tenure: 0.9,
    email: "casey.garcia@company.com"
  },
  {
    id: 7,
    name: "Riley Thompson",
    role: "Data Analyst",
    department: "Analytics",
    retentionScore: 76,
    riskLevel: "low",
    performance: 4.1,
    tenure: 2.7,
    email: "riley.thompson@company.com"
  },
  {
    id: 8,
    name: "Quinn Patel",
    role: "Finance Manager",
    department: "Finance",
    retentionScore: 51,
    riskLevel: "medium",
    performance: 3.7,
    tenure: 1.5,
    email: "quinn.patel@company.com"
  },
  {
    id: 9,
    name: "Avery Robinson",
    role: "Content Strategist",
    department: "Marketing",
    retentionScore: 79,
    riskLevel: "low",
    performance: 4.3,
    tenure: 3.1,
    email: "avery.robinson@company.com"
  },
  {
    id: 10,
    name: "Dakota Lee",
    role: "Customer Success",
    department: "Support",
    retentionScore: 61,
    riskLevel: "medium",
    performance: 3.9,
    tenure: 2.2,
    email: "dakota.lee@company.com"
  },
  {
    id: 11,
    name: "Skyler Martinez",
    role: "DevOps Engineer",
    department: "Engineering",
    retentionScore: 83,
    riskLevel: "low",
    performance: 4.4,
    tenure: 3.7,
    email: "skyler.martinez@company.com"
  },
  {
    id: 12,
    name: "Reese Wong",
    role: "Account Executive",
    department: "Sales",
    retentionScore: 47,
    riskLevel: "high",
    performance: 3.5,
    tenure: 0.8,
    email: "reese.wong@company.com"
  }
];

// Items per page options
const ITEMS_PER_PAGE = 5;

const EmployeeTable = () => {
  const [employees] = useState<Employee[]>(sampleEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Employee>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    departments: [] as string[],
    riskLevels: [] as ("low" | "medium" | "high")[],
  });
  const { toast } = useToast();

  // Reset to first page when search, sort or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortDirection, filters]);

  // Get unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(employees.map(employee => employee.department))
  ).sort();

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle sorting
  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field as keyof Employee);
    setSortDirection(direction);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: {
    departments: string[];
    riskLevels: ("low" | "medium" | "high")[];
  }) => {
    setFilters(newFilters);
  };

  // Handle checkbox selection
  const handleSelectEmployee = (id: number) => {
    setSelectedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedEmployees([]);
  };

  // Apply filters, search and sorting
  const filteredEmployees = employees
    .filter(employee => {
      // Apply department filter
      if (filters.departments.length > 0 && !filters.departments.includes(employee.department)) {
        return false;
      }
      
      // Apply risk level filter
      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(employee.riskLevel)) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          employee.name.toLowerCase().includes(searchLower) ||
          employee.role.toLowerCase().includes(searchLower) ||
          employee.department.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Bulk Actions */}
        {selectedEmployees.length > 0 && (
          <EmployeeBulkActions
            selectedCount={selectedEmployees.length}
            onClearSelection={handleClearSelection}
          />
        )}

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search employees..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex space-x-2 w-full md:w-auto">
            <EmployeeFilterDropdown
              onFilterChange={handleFilterChange}
              departments={uniqueDepartments}
            />
            <EmployeeSort
              sortField={sortField}
              sortDirection={sortDirection}
              onSortChange={handleSort}
            />
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="py-3 px-4 text-left font-medium">
                  <Checkbox
                    checked={
                      paginatedEmployees.length > 0 &&
                      selectedEmployees.length === paginatedEmployees.length
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all employees"
                  />
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Employee
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Department
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Role
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Retention Score
                </th>
                <th className="py-3 px-4 text-left font-medium">
                  Risk Level
                </th>
                <th className="py-3 px-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleSelectEmployee(employee.id)}
                        aria-label={`Select ${employee.name}`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <UserCircle className="h-6 w-6 mr-2 text-gray-400" />
                        <Link 
                          to={`/employee/${employee.id}`}
                          className="hover:underline text-primary"
                        >
                          {employee.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4">{employee.department}</td>
                    <td className="py-3 px-4">{employee.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2 mr-2">
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
                        <span>{employee.retentionScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge risk={employee.riskLevel} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <EmployeeQuickActions 
                        employeeId={employee.id}
                        employeeName={employee.name}
                        employeeEmail={employee.email}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <EmployeePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTable;
