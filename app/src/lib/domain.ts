export type UserRole =
  | "customer"
  | "mobility_partner"
  | "dispatch_rider"
  | "business"
  | "admin";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired";

export type VehicleType =
  | "motorcycle"
  | "car"
  | "van"
  | "truck";

export type DeliveryOption =
  | "express"
  | "standard"
  | "route_to_earn"
  | "scheduled"
  | "dedicated";

export type DeliveryStatus =
  | "draft"
  | "payment_pending"
  | "matching"
  | "offered"
  | "accepted"
  | "pickup_pending"
  | "picked_up"
  | "in_transit"
  | "arriving"
  | "delivered"
  | "confirmed"
  | "cancelled"
  | "failed"
  | "disputed"
  | "return_required"
  | "returned";

export type PackageCategory =
  | "standard"
  | "fragile"
  | "high_value"
  | "temperature_sensitive"
  | "restricted";

export type TripStatus =
  | "draft"
  | "published"
  | "matching"
  | "active"
  | "completed"
  | "cancelled";

export type MatchStatus =
  | "offered"
  | "accepted"
  | "declined"
  | "expired";

export type TransactionType =
  | "customer_payment"
  | "platform_fee"
  | "partner_earning"
  | "refund"
  | "payout";

export type TransactionStatus =
  | "pending"
  | "held"
  | "completed"
  | "failed"
  | "reversed"
  | "refunded"
  | "disputed";

  export type PaymentStatus =
  | "pending"
  | "authorized"
  | "held"
  | "release_pending"
  | "released"
  | "refunded"
  | "disputed"
  | "failed";

  export interface Payment {
  id: string;
  deliveryId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider?: string;
  providerReference?: string;
  heldAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  createdAt: string;
}
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address: string;
  coordinates: Coordinates;
}

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  type: VehicleType;
  make?: string;
  model?: string;
  registrationNumber?: string;
  maxWeightKg: number;
  maxPackageCount: number;
  verificationStatus: VerificationStatus;
}

export interface Package {
  id: string;
  category: PackageCategory;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  description?: string;
}

export interface Trip {
  id: string;
  partnerId: string;
  vehicleId: string;
  origin: Location;
  destination: Location;
  departureTime: string;
  estimatedArrivalTime?: string;
  availablePackageCount: number;
  availableWeightKg: number;
  acceptedCategories: PackageCategory[];
  status: TripStatus;
}

export interface Delivery {
  id: string;
  customerId: string;
  packageId: string;
  pickup: Location;
  destination: Location;
  option: DeliveryOption;
  status: DeliveryStatus;

  paymentStatus: PaymentStatus;

  requestedPickupTime?: string;
  deliveryDeadline?: string;
  estimatedPrice?: number;
  currency: string;
  createdAt: string;
}

export interface Match {
  id: string;
  deliveryId: string;
  tripId?: string;
  partnerId: string;
  compatibilityScore: number;
  routeCompatibility: number;
  timeCompatibility: number;
  detourDistanceKm: number;
  estimatedExtraMinutes: number;
  status: MatchStatus;
  createdAt: string;
}

export interface Transaction {
  id: string;
  deliveryId?: string;
  paymentId?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
}

