# Mobility-X Database Schema

## 1. Purpose

This document defines the relational data model for Mobility-X.

The schema supports:

- Customers
- Dispatch riders
- Mobility partners
- Everyday drivers and travelers
- Businesses
- Vehicles
- Trips
- Packages
- Deliveries
- Route-to-Earn matching
- Delivery assignments
- Tracking
- Proof of delivery
- Transactions
- Partner earnings
- Ratings
- Audit history

The database must support the core Mobility-X principle:

> If someone is already going there, their movement can create value.

---

# 2. Core Entities

## 2.1 users

Stores the primary account identity for every platform user.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| role | ENUM | NOT NULL |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(255) | UNIQUE |
| phone | VARCHAR(30) | UNIQUE |
| verification_status | ENUM | NOT NULL |
| account_status | ENUM | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Roles:

- customer
- mobility_partner
- dispatch_rider
- business
- admin

Account statuses:

- active
- suspended
- disabled
- pending

---

## 2.2 user_verifications

Stores identity and role-specific verification records.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users.id |
| verification_type | ENUM | NOT NULL |
| status | ENUM | NOT NULL |
| document_reference | VARCHAR(255) | NULL |
| reviewed_by | UUID | FK users.id, NULL |
| reviewed_at | TIMESTAMP | NULL |
| expires_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |

Verification types:

- identity
- driver
- vehicle
- business

---

# 3. Vehicles

## 3.1 vehicles

Represents vehicles registered by delivery partners.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| owner_id | UUID | FK users.id |
| type | ENUM | NOT NULL |
| make | VARCHAR(80) | NULL |
| model | VARCHAR(80) | NULL |
| registration_number | VARCHAR(50) | UNIQUE |
| max_weight_kg | DECIMAL(10,2) | NOT NULL |
| max_package_count | INTEGER | NOT NULL |
| max_length_cm | DECIMAL(10,2) | NULL |
| max_width_cm | DECIMAL(10,2) | NULL |
| max_height_cm | DECIMAL(10,2) | NULL |
| verification_status | ENUM | NOT NULL |
| status | ENUM | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Vehicle types:

- motorcycle
- car
- van
- truck

---

# 4. Trips

## 4.1 trips

Represents a mobility partner's declared movement.

This is the core Route-to-Earn supply object.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| partner_id | UUID | FK users.id |
| vehicle_id | UUID | FK vehicles.id |
| origin_address | VARCHAR(500) | NOT NULL |
| origin_latitude | DECIMAL(10,7) | NOT NULL |
| origin_longitude | DECIMAL(10,7) | NOT NULL |
| destination_address | VARCHAR(500) | NOT NULL |
| destination_latitude | DECIMAL(10,7) | NOT NULL |
| destination_longitude | DECIMAL(10,7) | NOT NULL |
| departure_time | TIMESTAMP | NOT NULL |
| estimated_arrival_time | TIMESTAMP | NULL |
| detour_tolerance_km | DECIMAL(10,2) | NULL |
| accepted_categories | JSONB | NOT NULL |
| status | ENUM | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Trip statuses:

- draft
- published
- matching
- active
- completed
- cancelled

---

## 4.2 trip_capacity

Tracks capacity available on a trip.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| trip_id | UUID | FK trips.id |
| total_package_count | INTEGER | NOT NULL |
| available_package_count | INTEGER | NOT NULL |
| total_weight_kg | DECIMAL(10,2) | NOT NULL |
| available_weight_kg | DECIMAL(10,2) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Capacity must be updated transactionally when packages are assigned.

---

# 5. Packages

## 5.1 packages

Stores the physical package being transported.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| category | ENUM | NOT NULL |
| description | TEXT | NULL |
| weight_kg | DECIMAL(10,2) | NOT NULL |
| length_cm | DECIMAL(10,2) | NOT NULL |
| width_cm | DECIMAL(10,2) | NOT NULL |
| height_cm | DECIMAL(10,2) | NOT NULL |
| declared_value | DECIMAL(15,2) | NULL |
| currency | CHAR(3) | NOT NULL |
| restricted_flag | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

Categories:

- standard
- fragile
- high_value
- temperature_sensitive
- restricted

---

# 6. Deliveries

## 6.1 deliveries

Represents the customer request to move a package.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| customer_id | UUID | FK users.id |
| package_id | UUID | FK packages.id |
| pickup_address | VARCHAR(500) | NOT NULL |
| pickup_latitude | DECIMAL(10,7) | NOT NULL |
| pickup_longitude | DECIMAL(10,7) | NOT NULL |
| destination_address | VARCHAR(500) | NOT NULL |
| destination_latitude | DECIMAL(10,7) | NOT NULL |
| destination_longitude | DECIMAL(10,7) | NOT NULL |
| delivery_option | ENUM | NOT NULL |
| status | ENUM | NOT NULL |
| requested_pickup_time | TIMESTAMP | NULL |
| delivery_deadline | TIMESTAMP | NULL |
| estimated_price | DECIMAL(15,2) | NULL |
| final_price | DECIMAL(15,2) | NULL |
| currency | CHAR(3) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Delivery options:

- express
- standard
- route_to_earn
- scheduled
- dedicated

---

# 7. Matching

## 7.1 matches

Stores candidate relationships between deliveries and mobility partners/trips.

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| delivery_id | UUID | FK deliveries.id |
| trip_id | UUID | FK trips.id, NULL |
| partner_id | UUID | FK users.id |
| compatibility_score | DECIMAL(5,2) | NOT NULL |
| route_compatibility | DECIMAL(5,2) | NOT NULL |
| time_compatibility | DECIMAL(5,2) | NOT NULL |
| detour_distance_km | DECIMAL(10,2) | NOT NULL |
| detour_percentage | DECIMAL(7,4) | NULL |
| estimated_extra_minutes | INTEGER | NULL |
| capacity_status | VARCHAR(50) | NOT NULL |
| vehicle_compatibility | VARCHAR(50) | NOT NULL |
| estimated_earnings | DECIMAL(15,2) | NULL |
| explanation | JSONB | NULL |
| status | ENUM | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

Match statuses:

- offered
- accepted
- declined
- expired

The `explanation` field should allow the engine to return structured reasons such as:

```json
{
  "route": "high",
  "time": "high",
  "detour": "low",
  "capacity": "available",
  "vehicle": "compatible",
  "reliability": "high"
}
@'
# Mobility-X Database Schema
...
