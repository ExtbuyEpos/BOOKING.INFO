
import { GoogleGenAI, Type } from "@google/genai";

// Ensure Gemini client is initialized correctly according to guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOrderId = async (): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Generate a unique boutique booking ID in format ZS-XXXX (where X are 4 random numbers). Return ONLY the ID string without any extra text.',
    });
    const text = response.text?.trim() || "";
    // Validate format ZS-1234
    const match = text.match(/ZS-\d{4}/);
    return match ? match[0] : `ZS-${Math.floor(1000 + Math.random() * 9000)}`;
  } catch (error) {
    console.error("AI Order ID Generation Error:", error);
    return `ZS-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

export const getStatusAdvice = async (currentStatus: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `This is a premium clothing/dress shop. The current booking status is "${currentStatus}". What is the next specific step regarding the garment (e.g., dress ready for fitting, final stitching check, steam iron, or packaging)? Keep it to 10-15 words.`,
    });
    return response.text?.trim() || "Finalize the garment quality check and prepare for client fitting.";
  } catch (error) {
    return "Proceed with the next stage of garment preparation and quality assurance.";
  }
};

export const validateStatusTransition = async (current: string, next: string): Promise<boolean> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `In a dress boutique booking system, is transitioning from "${current}" to "${next}" logical? Respond with JSON: { "isValid": boolean }`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN }
          },
          required: ['isValid']
        }
      }
    });
    
    // Cleanup response in case of markdown markers
    const jsonStr = response.text?.replace(/```json|```/g, "").trim() || '{"isValid": true}';
    const result = JSON.parse(jsonStr);
    return !!result.isValid;
  } catch (error) {
    console.error("Validation error:", error);
    return true; // Default to allowing transition on failure
  }
};
