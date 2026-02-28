export interface AIAnalysis {
    refinedGoal: string;
    probability: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    advice: string;
}

// In a real production app, this should be handled via a secure backend.
// For the hackathon, we'll use an environment variable.
// This should be handled via a secure backend API endpoint
// Never expose API keys in frontend code, even via environment variables
const API_URL = "https://api.x.ai/v1/chat/completions";

export const analyzeGoal = async (goal: string): Promise<AIAnalysis> => {
    if (!API_KEY) {
        // Fallback for demo if no API key is provided
        return {
            refinedGoal: goal,
            probability: 75,
            riskLevel: 'MEDIUM',
            advice: "xAI API Key missing. Grok is in demo mode. Your goal looks solid! Break it down into daily tasks."
        };
    }

    const prompt = `
    You are "Grok-ShipMate", the rebellious and high-IQ AI for ShipOrShame, a high-stakes productivity dApp on Monad.
    Users stake crypto on their goals. If they fail, they lose money.
    
    Analyze this goal: "${goal}"
    
    1. Refine the goal to be more SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Keep it sharp and concise.
    2. Estimate the probability of success (0-100).
    3. Categorize risk level: LOW, MEDIUM, or HIGH.
    4. Provide one piece of witty, "Grok-style" advice to ensure they ship.
    
    Return ONLY a JSON object in this format:
    {
      "refinedGoal": "string",
      "probability": number,
      "riskLevel": "LOW" | "MEDIUM" | "HIGH",
      "advice": "string"
    }
  `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-beta", // or "grok-2" if available
                messages: [
                    { role: "system", content: "You are Grok-ShipMate, a helpful but witty AI that analyzes goals." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`xAI API responded with status ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Clean potential markdown code blocks
        const jsonStr = content.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr) as AIAnalysis;
    } catch (error) {
        console.error("Grok Analysis failed:", error);
        return {
            refinedGoal: goal,
            probability: 50,
            riskLevel: 'MEDIUM',
            advice: "API connection fried. Neural link unstable. Just ship it, human."
        };
    }
};
