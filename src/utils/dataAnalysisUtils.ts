
/**
 * Parses CSV content into structured data
 * @param csvContent The raw CSV content as a string
 */
export const parseCSV = (csvContent: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Basic CSV parsing logic - split by lines and then by commas
      const lines = csvContent.split(/\r\n|\n/);
      const headers = lines[0].split(',').map(header => header.trim());
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',').map(value => value.trim());
        const entry: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || '';
        });
        
        data.push(entry);
      }
      
      console.log("Parsed CSV data:", data);
      resolve(data);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      reject(error);
    }
  });
};

/**
 * Analyzes employee data to generate insights and predictions
 * @param apiKey OpenAI API key for analysis
 * @param employeeData The parsed employee data
 */
export const analyzeEmployeeData = async (apiKey: string, employeeData: any[]): Promise<any> => {
  try {
    // Prepare data summary for AI analysis
    const dataSummary = JSON.stringify(employeeData.slice(0, 10)); // First 10 records as sample
    
    // Build prompt for AI analysis
    const prompt = `
      Analyze the following employee data and provide:
      1. A brief summary of the overall retention risk
      2. Identification of employees at risk with reasons and recommendations
      3. Key risk factors affecting retention
      4. Department-specific insights and recommendations
      5. An estimated retention rate
      
      Format the response as JSON with the following structure:
      {
        "summary": "Brief overview of the data and key insights",
        "riskEmployees": [
          {
            "name": "Employee Name",
            "risk": "high|medium|low",
            "reason": "Brief explanation of risk factors",
            "recommendation": "Specific action to address retention risk"
          }
        ],
        "retentionRate": 85, // percentage
        "keyFactors": ["Compensation", "Work-life balance", etc.],
        "departmentInsights": [
          {
            "department": "Department name",
            "riskLevel": "high|medium|low",
            "recommendations": "Department-specific recommendations"
          }
        ]
      }
      
      Sample data: ${dataSummary}
    `;
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are an HR analytics expert specialized in employee retention analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to analyze data");
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract the JSON from the AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return analysisResult;
    } else {
      // Fallback parsing
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        
        // If parsing fails, return a mock structure for the frontend
        return {
          summary: "Analysis result could not be properly parsed. Please try again.",
          riskEmployees: [],
          retentionRate: 0,
          keyFactors: [],
          departmentInsights: []
        };
      }
    }
  } catch (error) {
    console.error("Error analyzing employee data:", error);
    throw error;
  }
};

/**
 * Makes live predictions based on CSV data and current organization state
 * @param apiKey OpenAI API key for predictions
 * @param csvData The parsed CSV data
 * @param config Optional configuration parameters
 */
export const makeLivePredictions = async (apiKey: string, csvData: any[], config?: any): Promise<any> => {
  // Similar to analyzeEmployeeData but optimized for real-time predictions
  try {
    // Extract relevant prediction factors from the data
    const predictionFactors = extractPredictionFactors(csvData);
    
    // Call the OpenAI prediction model similar to analyzeEmployeeData
    // but with more specific prompt for predictions
    
    // Mock return for now
    return {
      predictions: [
        {
          employee: "John Smith",
          risk: "high",
          score: 87,
          reason: "Recent decrease in performance reviews and high market demand for their role",
          recommendation: "Schedule a career development discussion and consider compensation adjustment"
        },
        // Additional predictions would be here
      ],
      overallRisk: "medium",
      recommendedActions: [
        "Review compensation structure for engineering team",
        "Improve work-life balance initiatives",
        "Enhance career development programs"
      ]
    };
  } catch (error) {
    console.error("Error making predictions:", error);
    throw error;
  }
};

/**
 * Helper function to extract prediction factors from CSV data
 * @param csvData The parsed CSV data
 */
const extractPredictionFactors = (csvData: any[]): any => {
  // Logic to extract and normalize factors that affect retention predictions
  // This would typically include things like:
  // - Tenure
  // - Performance trends
  // - Compensation relative to role
  // - Team/manager relationships
  // - etc.
  
  // Simplified implementation for now
  const factors = {
    departments: [...new Set(csvData.map(row => row.Department))],
    roles: [...new Set(csvData.map(row => row.Role))],
    avgTenure: calculateAverageTenure(csvData),
    performanceDistribution: calculatePerformanceDistribution(csvData)
  };
  
  return factors;
};

/**
 * Calculate average tenure from CSV data
 * @param csvData The parsed CSV data
 */
const calculateAverageTenure = (csvData: any[]): number => {
  const tenureValues = csvData
    .filter(row => row.Tenure && !isNaN(parseFloat(row.Tenure)))
    .map(row => parseFloat(row.Tenure));
    
  if (tenureValues.length === 0) return 0;
  
  const sum = tenureValues.reduce((acc, val) => acc + val, 0);
  return sum / tenureValues.length;
};

/**
 * Calculate performance distribution from CSV data
 * @param csvData The parsed CSV data
 */
const calculatePerformanceDistribution = (csvData: any[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  csvData.forEach(row => {
    if (row.Performance) {
      const performanceKey = row.Performance.toString().trim();
      distribution[performanceKey] = (distribution[performanceKey] || 0) + 1;
    }
  });
  
  return distribution;
};
