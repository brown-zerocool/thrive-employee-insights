
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare } from "lucide-react";

interface FeedbackItem {
  id: string;
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  feedback: string;
  actionItems: string[];
  impactScore: number;
  date?: string;    // Add optional date for compatibility
  content?: string; // Add optional content for compatibility
}

interface AiFeedbackAnalysisProps {
  feedbacks: FeedbackItem[];
}

const AiFeedbackAnalysis: React.FC<AiFeedbackAnalysisProps> = ({ feedbacks }) => {
  // Make feedbacks compatible with the expected type in Dashboard
  const adaptedFeedbacks = feedbacks.map(feedback => ({
    ...feedback,
    date: feedback.date || new Date().toISOString(),
    content: feedback.content || feedback.feedback
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Employee Feedback Analysis</CardTitle>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            AI Analysis
          </div>
        </div>
        <CardDescription>Key insights from employee surveys and feedback</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {adaptedFeedbacks.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">{item.topic}</h4>
              </div>
              <Badge variant={
                item.sentiment === "positive" ? "default" : 
                item.sentiment === "neutral" ? "outline" : 
                "destructive"
              }>
                {item.sentiment}
              </Badge>
            </div>
            
            <p className="text-sm">{item.feedback}</p>
            
            {item.actionItems && item.actionItems.length > 0 && (
              <div className="pt-1 border-t">
                <p className="text-sm font-medium mb-1">Recommended Actions:</p>
                <ul className="space-y-1">
                  {item.actionItems.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1 text-xs text-muted-foreground">
              <span>Impact Score: {item.impactScore}/100</span>
              {item.date && <span>{new Date(item.date).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AiFeedbackAnalysis;
