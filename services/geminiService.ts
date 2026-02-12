import { GoogleGenAI } from "@google/genai";
import { Order, OrderStatus } from "../types";

export const generateOrderId = async (): Promise<string> => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ZS-${digits}`;
};

export const getStatusAdvice = async (currentStatus: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert boutique consultant. Provide a short, 1-sentence professional advice for a boutique owner when a client's order is in the "${currentStatus}" phase. Keep it encouraging and high-end.`,
    });
    return response.text || "Continue providing excellent service.";
  } catch (e) {
    const adviceMap: Record<string, string> = {
      [OrderStatus.CREATED]: "New booking logged. Assign to tailor and verify measurements.",
      [OrderStatus.IN_SHOP]: "Garment is in production. Check stitching detail and quality.",
      [OrderStatus.READY_TO_PICKUP]: "Finishing touches done. Steam iron and pack for the client.",
      [OrderStatus.CUSTOMER_RECEIVED]: "Handover successful. Follow up for any fitting adjustments.",
      [OrderStatus.COMPLETED]: "Order finalized. Customer satisfaction record updated."
    };
    return adviceMap[currentStatus] || "Maintain boutique standards.";
  }
};

export const draftWhatsAppMessage = async (order: Order, lang: 'en' | 'ar'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });
    const prompt = `Draft a very professional and warm WhatsApp message from "Zahrat Al Sawsen Boutique" to customer "${order.customerName}" regarding order #${order.id}.
    Details: Status is ${order.orderStatus}, Total is ${order.totalAmount.toFixed(3)} OMR. 
    Include a note that they can view their invoice online.
    Language: ${lang === 'ar' ? 'Arabic' : 'English'}.
    Keep it concise but luxury-feeling. Use emojis sparingly.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

export const validateStatusTransition = async (current: string, next: string): Promise<boolean> => {
  return true;
};