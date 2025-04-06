
import { Button } from "@/components/ui/button";
import { BarChart } from "lucide-react";

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isAnalyzing: boolean;
}

const AnalyzeButton = ({ onClick, disabled, isAnalyzing }: AnalyzeButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="mt-4"
      onClick={onClick}
      disabled={disabled}
    >
      {isAnalyzing ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
          Analyzing Data...
        </>
      ) : (
        <>
          <BarChart className="mr-2 h-4 w-4" />
          Analyze Data for Predictions
        </>
      )}
    </Button>
  );
};

export default AnalyzeButton;
