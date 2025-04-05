
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Brain, AlertCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { analyzeEmployeeFeedback } from "@/utils/openAiService";
import { toast } from "sonner";

interface AiFeedbackAnalysisProps {
  feedbacks: Array<{ date: string; content: string }>;
}

const AiFeedbackAnalysis = ({ feedbacks }: AiFeedbackAnalysisProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    sentiment: string;
    keyIssues: string[];
    recommendations: string[];
  } | null>(null);

  const handleAnalyzeFeedback = async () => {
    if (!apiKey && !showApiKeyInput) {
      setShowApiKeyInput(true);
      toast.info("Please enter your OpenAI API key to continue");
      return;
    }

    if (!feedbacks.length) {
      toast.error("No feedback available to analyze");
      return;
    }

    setLoading(true);
    toast.info("Analyzing feedback with GPT-4o...");

    try {
      // Combine all feedback for analysis
      const combinedFeedback = feedbacks.map(f => f.content).join(" ");
      
      const result = await analyzeEmployeeFeedback(apiKey, combinedFeedback);
      
      if (result) {
        setAnalysis(result);
        toast.success("Feedback analysis complete");
      } else {
        toast.error("Failed to analyze feedback");
      }
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  if (!feedbacks.length) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Feedback Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
            <p className="text-muted-foreground">No feedback available to analyze</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Feedback Analysis
          </CardTitle>
          {analysis && <Badge variant="ai-generated">GPT-4o Analysis</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        {showApiKeyInput && (
          <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Label htmlFor="openai-api-key" className="text-sm font-medium">
              OpenAI API Key
            </Label>
            <Input
              id="openai-api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is used only for this session and is not stored.
            </p>
          </div>
        )}

        {analysis ? (
          <div className="space-y-6">
            <div className="p-4 bg-thrive-50 rounded-lg border border-thrive-100">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center mt-1">
                  <Brain className="h-4 w-4 text-thrive-700" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">AI Sentiment Analysis</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Overall sentiment: <span className="font-medium">{analysis.sentiment}</span>
                  </p>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium">Key Issues Identified:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                      {analysis.keyIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-thrive-50 rounded-lg border border-thrive-100">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-thrive-100 flex items-center justify-center mt-1">
                  <Brain className="h-4 w-4 text-thrive-700" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Recommended Actions</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                    {analysis.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use GPT-4o to analyze this employee's feedback and get personalized insights and recommendations.
            </p>
            
            <Button 
              onClick={handleAnalyzeFeedback} 
              variant="default" 
              className="w-full"
              disabled={loading}
            >
              <Brain className="mr-2 h-4 w-4" />
              {loading ? "Analyzing..." : showApiKeyInput && !apiKey ? "Continue with API Key" : "Analyze Feedback with AI"}
            </Button>

            {!showApiKeyInput && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setShowApiKeyInput(true)}
              >
                <Brain className="mr-2 h-4 w-4" />
                Configure OpenAI API Key
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiFeedbackAnalysis;
