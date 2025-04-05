
import { useState } from "react";
import { ChevronDown, Download, Mail, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface EmployeeBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
}

const EmployeeBulkActions = ({ selectedCount, onClearSelection }: EmployeeBulkActionsProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Handle bulk actions
  const handleAction = (action: string) => {
    setIsLoading(action);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(null);
      onClearSelection();
      
      switch (action) {
        case "email":
          toast.success(`Email sent to ${selectedCount} employees`);
          break;
        case "export":
          toast.success(`${selectedCount} employee records exported`);
          break;
        case "delete":
          toast.success(`${selectedCount} employee records deleted`);
          break;
        default:
          break;
      }
    }, 1000);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border">
      <span className="text-sm font-medium ml-2">
        {selectedCount} {selectedCount === 1 ? "employee" : "employees"} selected
      </span>
      
      <div className="ml-auto flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("email")}
          disabled={isLoading !== null}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
          {isLoading === "email" && (
            <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAction("export")}
          disabled={isLoading !== null}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
          {isLoading === "export" && (
            <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="px-2"
              disabled={isLoading !== null}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => handleAction("delete")}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          size="sm" 
          variant="ghost"
          onClick={onClearSelection}
          disabled={isLoading !== null}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default EmployeeBulkActions;
