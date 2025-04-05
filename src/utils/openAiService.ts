
import { toast } from "sonner";

const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

interface PredictionRequest {
  department?: string;
  timeFrame: string;
  includeFactors: {
    compensation: boolean;
    workload: boolean;
    engagement: boolean;
    growth: boolean;
  };
}

interface PredictionResult {
  employee: string;
  score: number;
  risk: "low" | "medium" | "high";
  reason: string;
  recommendation: string;
}

export const generateRetentionPredictions = async (
  apiKey: string,
  config: PredictionRequest
): Promise<PredictionResult[]> => {
  if (!apiKey) {
    toast.error("OpenAI API key is required");
    return [];
  }

  try {
    // Construct the prompt based on the configuration
    const factorsList = Object.entries(config.includeFactors)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join(", ");
    
    const timeFrameMap: Record<string, string> = {
      "1m": "next month",
      "3m": "next 3 months",
      "6m": "next 6 months",
      "1y": "next year"
    };

    const prompt = `
      Generate retention risk predictions for 5 employees, considering these factors: ${factorsList}.
      Focus on predictions for the ${timeFrameMap[config.timeFrame]}.
      ${config.department ? `Only include employees from the ${config.department} department.` : ''}
      
      For each employee, provide:
      1. A realistic employee name
      2. A retention score (0-100, where lower means higher risk)
      3. A risk level (low, medium, or high) based on the score
      4. A specific reason for the risk based on the factors
      5. A personalized recommendation for improving retention
      
      Format the response as a JSON array of objects with properties: employee, score, risk, reason, and recommendation.
    `;

    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI specialized in HR analytics and employee retention. Provide realistic and actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to generate predictions");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract the JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback parsing - look for anything that might be JSON
      try {
        return JSON.parse(content);
      } catch (e) {
        throw new Error("Failed to parse AI response");
      }
    }
  } catch (error) {
    toast.error(`Error generating predictions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error("OpenAI API Error:", error);
    return [];
  }
};

export const analyzeEmployeeFeedback = async (
  apiKey: string, 
  feedback: string
): Promise<{
  sentiment: string;
  keyIssues: string[];
  recommendations: string[];
}> => {
  if (!apiKey || !feedback) {
    return {
      sentiment: "Unknown",
      keyIssues: [],
      recommendations: []
    };
  }

  try {
    const prompt = `
      Analyze the following employee feedback and provide:
      1. Overall sentiment (positive, neutral, or negative)
      2. Key issues or concerns identified (as a list)
      3. Recommended actions for management (as a list)
      
      Format the response as JSON with properties: sentiment, keyIssues (array), and recommendations (array).
      
      Feedback: "${feedback}"
    `;

    const response = await fetch(OPENAI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "You are an HR analytics specialist focused on understanding employee sentiment and providing actionable insights."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to analyze feedback");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // Fallback parsing
      try {
        return JSON.parse(content);
      } catch (e) {
        throw new Error("Failed to parse AI response");
      }
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return {
      sentiment: "Error analyzing feedback",
      keyIssues: [],
      recommendations: []
    };
  }
};
