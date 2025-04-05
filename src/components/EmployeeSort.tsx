
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EmployeeSortProps {
  sortField: string;
  sortDirection: "asc" | "desc";
  onSortChange: (field: string, direction: "asc" | "desc") => void;
}

const EmployeeSort = ({
  sortField,
  sortDirection,
  onSortChange,
}: EmployeeSortProps) => {
  // Get sort option label
  const getSortOptionLabel = () => {
    switch (sortField) {
      case "name":
        return `Name (${sortDirection === "asc" ? "A-Z" : "Z-A"})`;
      case "department":
        return `Department (${sortDirection === "asc" ? "A-Z" : "Z-A"})`;
      case "retentionScore":
        return `Retention Score (${sortDirection === "asc" ? "Low-High" : "High-Low"})`;
      case "riskLevel":
        return `Risk Level (${sortDirection === "asc" ? "Low-High" : "High-Low"})`;
      default:
        return "Sort by";
    }
  };

  // Handle sort selection
  const handleSortSelection = (value: string) => {
    const [field, direction] = value.split("-");
    onSortChange(field, direction as "asc" | "desc");
  };

  const currentValue = `${sortField}-${sortDirection}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          {getSortOptionLabel()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentValue} onValueChange={handleSortSelection}>
          <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="department-asc">Department (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="department-desc">Department (Z-A)</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="retentionScore-asc">Retention Score (Low-High)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="retentionScore-desc">Retention Score (High-Low)</DropdownMenuRadioItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="riskLevel-asc">Risk Level (Low-High)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="riskLevel-desc">Risk Level (High-Low)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeSort;
