export type SurfaceType = "CLAY" | "HARD" | "GRASS" | "SYNTHETIC";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";
export type Role = "USER" | "ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  image: string | null;
  role: Role;
}

export interface CourtData {
  id: string;
  name: string;
  description: string | null;
  surfaceType: SurfaceType;
  pricePerHour: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface ReservationData {
  id: string;
  userId: string;
  courtId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  totalPrice: number;
  court: CourtData;
  payment: PaymentData | null;
}

export interface PaymentData {
  id: string;
  status: PaymentStatus;
  amount: number;
  mpPaymentId: string | null;
}

export interface TimeSlot {
  hour: number;
  time: string;
  available: boolean;
}
