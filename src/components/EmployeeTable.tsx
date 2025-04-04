
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RiskBadge from "@/components/RiskBadge";

interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
  retentionScore: number;
  riskLevel: "low" | "medium" | "high";
  performance: number;
  tenure: number;
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
  },
];

const EmployeeTable = () => {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Employee | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Sorting functionality
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply search and sorting
  const filteredEmployees = employees
    .filter((employee) =>
      Object.values(employee).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      
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

  // Function to handle viewing employee details
  const viewEmployee = (id: number) => {
    // In a real application, this would navigate to the employee profile
    toast({
      title: "Employee Selected",
      description: `Viewing employee with ID: ${id}`,
    });
  };

  const getSortIcon = (field: keyof Employee) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="default" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th 
                className="py-3 px-4 text-left font-medium cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Employee {getSortIcon("name")}
              </th>
              <th 
                className="py-3 px-4 text-left font-medium cursor-pointer"
                onClick={() => handleSort("department")}
              >
                Department {getSortIcon("department")}
              </th>
              <th 
                className="py-3 px-4 text-left font-medium cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role {getSortIcon("role")}
              </th>
              <th 
                className="py-3 px-4 text-left font-medium cursor-pointer"
                onClick={() => handleSort("retentionScore")}
              >
                Retention Score {getSortIcon("retentionScore")}
              </th>
              <th 
                className="py-3 px-4 text-left font-medium cursor-pointer"
                onClick={() => handleSort("riskLevel")}
              >
                Risk Level {getSortIcon("riskLevel")}
              </th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <UserCircle className="h-6 w-6 mr-2 text-gray-400" />
                      <span>{employee.name}</span>
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
                    <Link to={`/employee/${employee.id}`}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No employees found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
