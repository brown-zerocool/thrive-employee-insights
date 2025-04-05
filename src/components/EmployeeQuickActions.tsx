
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Info, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface EmployeeQuickActionsProps {
  employeeId: number;
  employeeName: string;
  employeeEmail?: string;
}

const EmployeeQuickActions = ({ employeeId, employeeName, employeeEmail }: EmployeeQuickActionsProps) => {
  const handleSendEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Email dialog opened for ${employeeName}`);
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={`/employee/${employeeId}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
                <span className="sr-only">View employee details</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>View employee details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={`/employee/${employeeId}/edit`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit employee</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit employee</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {employeeEmail && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={handleSendEmail}
              >
                <Mail className="h-4 w-4" />
                <span className="sr-only">Email employee</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Email employee</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default EmployeeQuickActions;
