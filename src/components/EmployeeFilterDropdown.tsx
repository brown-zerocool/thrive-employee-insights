
import { useState, useRef, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface EmployeeFilterDropdownProps {
  onFilterChange: (filters: {
    departments: string[];
    riskLevels: ("low" | "medium" | "high")[];
  }) => void;
  departments: string[];
}

const EmployeeFilterDropdown = ({
  onFilterChange,
  departments,
}: EmployeeFilterDropdownProps) => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<("low" | "medium" | "high")[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Count of active filters
  const activeFilterCount = selectedDepartments.length + selectedRiskLevels.length;

  // Apply filters
  useEffect(() => {
    onFilterChange({
      departments: selectedDepartments,
      riskLevels: selectedRiskLevels,
    });
  }, [selectedDepartments, selectedRiskLevels, onFilterChange]);

  // Toggle department selection
  const toggleDepartment = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  // Toggle risk level selection
  const toggleRiskLevel = (risk: "low" | "medium" | "high") => {
    setSelectedRiskLevels((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedRiskLevels([]);
  };

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
        
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
          {departments.map((department) => (
            <DropdownMenuCheckboxItem
              key={department}
              checked={selectedDepartments.includes(department)}
              onCheckedChange={() => toggleDepartment(department)}
            >
              {department}
            </DropdownMenuCheckboxItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Filter by Risk Level</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={selectedRiskLevels.includes("low")}
            onCheckedChange={() => toggleRiskLevel("low")}
          >
            Low Risk
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedRiskLevels.includes("medium")}
            onCheckedChange={() => toggleRiskLevel("medium")}
          >
            Medium Risk
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={selectedRiskLevels.includes("high")}
            onCheckedChange={() => toggleRiskLevel("high")}
          >
            High Risk
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EmployeeFilterDropdown;
