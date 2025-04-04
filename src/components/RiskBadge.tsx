
import { cn } from "@/lib/utils";

type RiskLevel = 'low' | 'medium' | 'high';

interface RiskBadgeProps {
  risk: RiskLevel;
  showText?: boolean;
  className?: string;
}

const RiskBadge = ({ risk, showText = true, className }: RiskBadgeProps) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'bg-risk-low text-white';
      case 'medium':
        return 'bg-risk-medium text-white';
      case 'high':
        return 'bg-risk-high text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  const getRiskText = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getRiskColor(risk),
        className
      )}
    >
      {showText ? getRiskText(risk) : null}
    </div>
  );
};

export default RiskBadge;
