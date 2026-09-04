import type { BookingServiceResult } from "./booking-service";

let currentBooking: BookingServiceResult | null = null;

export function setCurrentBooking(
  booking: BookingServiceResult,
): void {
  currentBooking = booking;
}

export function getCurrentBooking(): BookingServiceResult | null {
  return currentBooking;
}

export function clearCurrentBooking(): void {
  currentBooking = null;
}