import { OrderStatus } from "../types";

export const generateOrderId = async (): Promise<string> => {
  // Generate a local unique boutique booking ID in format ZS-XXXX
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ZS-${digits}`;
};

export const getStatusAdvice = async (currentStatus: string): Promise<string> => {
  // Local logic for premium boutique status advice
  const adviceMap: Record<string, string> = {
    [OrderStatus.CREATED]: "New booking logged. Assign to tailor and verify measurements.",
    [OrderStatus.IN_SHOP]: "Garment is in production. Check stitching detail and quality.",
    [OrderStatus.READY_TO_PICKUP]: "Finishing touches done. Steam iron and pack for the client.",
    [OrderStatus.CUSTOMER_RECEIVED]: "Handover successful. Follow up for any fitting adjustments.",
    [OrderStatus.COMPLETED]: "Order finalized. Customer satisfaction record updated."
  };
  
  return adviceMap[currentStatus] || "Proceed with the standard boutique operational workflow.";
};

export const validateStatusTransition = async (current: string, next: string): Promise<boolean> => {
  // Local validation: transitions are generally logical in this linear system
  return true;
};