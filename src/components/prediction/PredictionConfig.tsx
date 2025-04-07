
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface IncludeFactorsType {
  compensation: boolean;
  workload: boolean;
  engagement: boolean;
  growth: boolean;
}

interface PredictionConfigProps {
  department?: string;
  timeFrame: string;
  includeFactors: IncludeFactorsType;
  onUpdateDepartment: (value: string) => void;
  onUpdateTimeFrame: (value: string) => void;
  onUpdateFactors: (factor: keyof IncludeFactorsType, checked: boolean) => void;
}

export const PredictionConfigForm = ({
  department,
  timeFrame,
  includeFactors,
  onUpdateDepartment,
  onUpdateTimeFrame,
  onUpdateFactors
}: PredictionConfigProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department Filter</Label>
          <Select 
            value={department} 
            onValueChange={onUpdateDepartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="hr">Human Resources</SelectItem>
              <SelectItem value="support">Customer Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timeFrame">Prediction Time Frame</Label>
          <Select 
            value={timeFrame} 
            onValueChange={onUpdateTimeFrame}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Next Month</SelectItem>
              <SelectItem value="3m">Next 3 Months</SelectItem>
              <SelectItem value="6m">Next 6 Months</SelectItem>
              <SelectItem value="1y">Next Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Prediction Factors</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="compensation" 
              checked={includeFactors.compensation}
              onCheckedChange={(checked) => onUpdateFactors("compensation", !!checked)}
            />
            <Label htmlFor="compensation" className="cursor-pointer">Compensation Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="workload" 
              checked={includeFactors.workload}
              onCheckedChange={(checked) => onUpdateFactors("workload", !!checked)}
            />
            <Label htmlFor="workload" className="cursor-pointer">Work Hours & Capacity</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="engagement" 
              checked={includeFactors.engagement}
              onCheckedChange={(checked) => onUpdateFactors("engagement", !!checked)}
            />
            <Label htmlFor="engagement" className="cursor-pointer">Engagement Metrics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="growth" 
              checked={includeFactors.growth}
              onCheckedChange={(checked) => onUpdateFactors("growth", !!checked)}
            />
            <Label htmlFor="growth" className="cursor-pointer">Career Growth</Label>
          </div>
        </div>
      </div>
    </>
  );
};
