
import { Users } from "lucide-react";

export const EmptyPredictionState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">No predictions yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Enter your OpenAI API key, configure your prediction settings, and click "Generate AI Predictions" to identify employees who might be at risk.
        </p>
      </div>
    </div>
  );
};
