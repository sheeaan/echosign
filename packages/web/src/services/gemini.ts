import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface ClassificationResult {
    type: string;
    code: string;
    priority: string;
    confidence: number;
}

export async function classifyIncident(transcription: string): Promise<ClassificationResult> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: `Classify this tactical voice report: "${transcription}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, description: "Type of incident (e.g., FIRE - STRUCTURAL)" },
                        code: { type: Type.STRING, description: "Tactical code (e.g., 10-70)" },
                        priority: { type: Type.STRING, description: "Priority level (e.g., 01, ALPHA, CRITICAL)" },
                        confidence: { type: Type.NUMBER, description: "Match confidence percentage 0-100" }
                    },
                    required: ["type", "code", "priority", "confidence"]
                }
            }
        });

        if (!response.text) {
            throw new Error("No response text from Gemini API");
        }
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Gemini Classification Error:", error);
        // Fallback classification
        return {
            type: "UNCATEGORIZED EVENT",
            code: "10-00",
            priority: "00",
            confidence: 100
        };
    }
}
