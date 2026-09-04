# Mobility-X API Specification

## 1. Purpose

This document defines the API contract for the Mobility-X platform.

The API connects the web and mobile clients with authentication, users, mobility partners, trips, deliveries, matching, tracking, payments, earnings, ratings, and administration.

The API must enforce authorization, validation, verification requirements, rate limiting, audit logging, and secure handling of sensitive information.

---

## 2. API Conventions

**Base path:** `/api`

**Format:** JSON

**Authentication:** Bearer token

**Timestamps:** ISO 8601 UTC

**Currency:** Monetary values must include an explicit ISO 4217 currency code.

### Common HTTP Status Codes

- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `409` — Conflict
- `422` — Validation Error
- `429` — Too Many Requests
- `500` — Internal Server Error

---

## 3. Authentication

### POST `/api/auth/register`

Creates a new Mobility-X account.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "password": "secure-password",
  "role": "customer"
}---

## 2. API Conventions

**Base path:** `/api`

**Format:** JSON

**Authentication:** Bearer token

**Timestamps:** ISO 8601 UTC

**Currency:** Monetary values must include an explicit ISO 4217 currency code.

### Common HTTP Status Codes

- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `409` — Conflict
- `422` — Validation Error
- `429` — Too Many Requests
- `500` — Internal Server Error
---

## 3. Authentication

Mobility-X authentication manages account creation, login, OTP verification, and password recovery.

### POST `/api/auth/register`

Creates a new Mobility-X account.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000",
  "password": "secure-password",
  "role": "customer"
}---

## 4. Users

The Users API manages the authenticated user's profile and verification information.

### GET `/api/users/me`

Returns the profile of the currently authenticated user.

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348000000000",
    "role": "customer",
    "verificationStatus": "verified"
  }
}---

## 5. Vehicles

The Vehicles API manages vehicles registered by Mobility-X partners.

### POST `/api/vehicles`

Registers a vehicle for the authenticated partner.

**Request:**

```json
{
  "type": "car",
  "make": "Toyota",
  "model": "Camry",
  "registrationNumber": "ABC-123",
  "maxWeightKg": 100,
  "maxPackageCount": 3
}---

## 6. Trips / Route-to-Earn

Trips represent journeys that Mobility-X partners are already planning to make.

The Route-to-Earn system uses these trips to identify delivery opportunities that fit the partner's existing route.

### POST `/api/trips`

Creates an upcoming trip.

**Request:**

```json
{
  "vehicleId": "uuid",
  "origin": {
    "address": "Makurdi",
    "latitude": 7.7322,
    "longitude": 8.5391
  },
  "destination": {
    "address": "Abuja",
    "latitude": 9.0765,
    "longitude": 7.3986
  },
  "departureTime": "2026-08-05T07:00:00Z",
  "estimatedArrivalTime": "2026-08-05T12:00:00Z",
  "availablePackageCount": 2,
  "availableWeightKg": 20,
  "acceptedCategories": [
    "standard",
    "fragile"
  ],
  "detourToleranceKm": 5
}---

## 7. Deliveries

The Deliveries API manages package transportation requests from creation through completion.

### POST `/api/deliveries`

Creates a new delivery request.

**Request:**

```json
{
  "pickup": {
    "address": "Makurdi",
    "latitude": 7.7322,
    "longitude": 8.5391
  },
  "destination": {
    "address": "Abuja",
    "latitude": 9.0765,
    "longitude": 7.3986
  },
  "package": {
    "category": "standard",
    "weightKg": 2,
    "lengthCm": 30,
    "widthCm": 20,
    "heightCm": 15,
    "description": "Small electronics package"
  },
  "option": "route_to_earn",
  "deliveryDeadline": "2026-08-06T18:00:00Z"
}---

## 8. Matching Engine

The Matching Engine connects delivery requests with eligible mobility partners.

Mobility-X V1 will use deterministic, rule-based matching.

The engine must evaluate route compatibility, timing, package requirements, vehicle capacity, partner verification, reliability, and delivery urgency.

### POST `/api/matching/search`

Searches for eligible mobility partners for a delivery.

**Request:**

```json
{
  "deliveryId": "uuid"
}---

## 9. Assignments

An assignment represents an accepted delivery job between a customer and a Mobility-X delivery partner.

An assignment is created after a valid matching offer has been accepted.

### GET `/api/assignments/:id`

Returns details of an accepted delivery assignment.

**Response:**

```json
{
  "assignment": {
    "id": "uuid",
    "deliveryId": "uuid",
    "partnerId": "uuid",
    "matchId": "uuid",
    "status": "accepted",
    "createdAt": "2026-08-05T07:05:00Z"
  }
}---

## 10. Pickup

The Pickup API manages the process of the delivery partner arriving at the pickup location, verifying the package, and confirming that the package has been collected.

### POST `/api/deliveries/:id/pickup/arrive`

Records that the assigned partner has arrived at the pickup location.

**Request:**

```json
{
  "latitude": 7.7322,
  "longitude": 8.5391,
  "accuracyMeters": 12
}---

## 11. Tracking

The Tracking API provides authorized users with delivery progress and location information while a package is in transit.

Tracking must balance useful delivery visibility with privacy and security.

### POST `/api/deliveries/:id/tracking`

Records an authorized mobility partner's location during an active delivery.

**Request:**

```json
{
  "latitude": 7.7322,
  "longitude": 8.5391,
  "accuracyMeters": 12
}---

## 12. Delivery Completion

The Delivery Completion API manages the final handoff of a package to the recipient.

A delivery must only be marked as completed after the required recipient verification and proof-of-delivery requirements have been satisfied.

### POST `/api/deliveries/:id/arrive`

Records that the delivery partner has arrived at or near the destination.

**Request:**

```json
{
  "latitude": 9.0765,
  "longitude": 7.3986,
  "accuracyMeters": 15
}---

## 13. Proof of Delivery

The Proof of Delivery (POD) API manages evidence that a package was successfully handed to the recipient.

Proof of delivery helps protect customers, delivery partners, businesses, and Mobility-X during disputes.

### POST `/api/deliveries/:id/proof`

Uploads or records proof-of-delivery information.

Supported evidence types include:

- OTP verification
- Recipient signature
- Delivery photo
- Recipient confirmation

**Request:**

```json
{
  "type": "otp",
  "verificationReference": "123456",
  "recipientName": "Jane Doe"
}---

## 14. Earnings

The Earnings API manages money earned by mobility partners and dispatch riders from completed delivery work.

Mobility-X must maintain a clear separation between customer payments, platform fees, partner earnings, pending balances, available balances, refunds, and payouts.

### GET `/api/earnings`

Returns the authenticated partner's earnings summary.

**Response:**

```json
{
  "currency": "NGN",
  "available": 125000,
  "pending": 15000,
  "totalEarned": 340000
}---

## 15. Ratings & Reputation

The Ratings and Reputation system allows customers and mobility partners to provide feedback after completed deliveries.

Mobility-X uses ratings, delivery performance, and verification information to build a reliable marketplace.

### POST `/api/deliveries/:id/rating`

Creates a rating for a completed delivery.

A customer may rate the delivery partner after completion.

A delivery partner may also rate the customer where supported by platform policy.

**Request:**

```json
{
  "score": 5,
  "comment": "Excellent delivery."
}---

## 16. Notifications & Delivery Events

Mobility-X must provide timely notifications when important events occur during authentication, matching, delivery, payment, and payout workflows.

Notifications may be delivered through:

- In-app notifications
- Push notifications
- SMS
- Email

The notification channel used depends on user preferences, availability, urgency, and platform policy.

### GET `/api/notifications`

Returns notifications for the authenticated user.

**Response:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "delivery_created",
      "title": "Delivery Created",
      "message": "Your delivery request has been created.",
      "read": false,
      "createdAt": "2026-08-05T07:00:00Z"
    }
  ]
}---

## 17. Disputes & Support

Mobility-X must provide a secure dispute and support system for customers, mobility partners, dispatch riders, and businesses.

The dispute system allows users to report problems with deliveries, payments, packages, partners, recipients, or other platform activity.

### POST `/api/deliveries/:id/disputes`

Creates a dispute associated with a delivery.

**Request:**

```json
{
  "reason": "package_damaged",
  "description": "The package arrived damaged.",
  "evidence": [
    {
      "type": "photo",
      "reference": "file-reference"
    }
  ]
}---

## 18. Admin & Platform Operations

Mobility-X requires a secure administrative API for operating and monitoring the marketplace.

Administrative endpoints must only be accessible to authenticated users with the appropriate administrative permissions.

### GET `/api/admin/dashboard`

Returns high-level platform metrics.

**Response:**

```json
{
  "users": {
    "total": 0,
    "active": 0,
    "pendingVerification": 0
  },
  "deliveries": {
    "total": 0,
    "active": 0,
    "completed": 0,
    "disputed": 0
  },
  "partners": {
    "total": 0,
    "active": 0,
    "verified": 0
  },
  "financials": {
    "currency": "NGN",
    "grossTransactionValue": 0,
    "platformRevenue": 0
  }
}---

## 19. Security, Rate Limiting & API Protection

Security is a core requirement of the Mobility-X API.

The API must protect user accounts, delivery information, financial transactions, location data, identity information, partner information, and administrative operations.

### Authentication Security

All protected endpoints must require authentication using a valid Bearer token.

The API must:

- Validate access tokens server-side.
- Reject expired tokens.
- Reject revoked tokens.
- Prevent unauthorized access.
- Enforce session expiration where applicable.
- Support secure logout and token revocation.
- Protect authentication endpoints against abuse.

Passwords must never be stored in plaintext.

Passwords must be securely hashed using an approved password hashing algorithm.

### Authorization

Authentication determines who the user is.

Authorization determines what the user is allowed to do.

Every protected endpoint must perform server-side authorization checks.

Authorization must consider:

- User identity
- User role
- Resource ownership
- Delivery assignment
- Business membership
- Administrative permissions
- Verification status
- Account status

Client-side authorization checks must never be considered sufficient security.

### Role-Based Access Control

Mobility-X supports the following primary roles:

- Customer
- Mobility Partner
- Dispatch Rider
- Business
- Admin

Permissions must be enforced according to role and resource ownership.

A customer must not be able to access another customer's delivery.

A mobility partner must not be able to modify another partner's trip.

A partner must only access delivery information that the partner is authorized to receive.

Administrative endpoints must require explicit administrative permissions.

### Rate Limiting

The API must enforce rate limits to reduce abuse and automated attacks.

Rate limiting should be applied to:

- Login
- Registration
- OTP requests
- OTP verification
- Password recovery
- Delivery creation
- Matching requests
- Payment requests
- Payout requests
- Dispute creation
- File uploads
- Administrative endpoints

Rate limits may vary depending on:

- Endpoint
- User identity
- IP address
- Device
- Account risk level
- Authentication status

Repeated requests exceeding the allowed rate should return:

```text
429 Too Many Requests
