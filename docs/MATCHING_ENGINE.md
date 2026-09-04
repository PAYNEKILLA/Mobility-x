# Mobility-X Matching Engine

## 1. Purpose

The Mobility-X Matching Engine connects delivery demand with compatible transportation capacity.

The engine must support two primary matching directions:

1. Package-to-Mobility-Partner
2. Mobility-Partner-to-Package

The core principle is:

> If someone is already going there, their movement can create value.

Mobility-X should match packages with professional dispatch riders, drivers, travelers, and other verified mobility partners based on route, timing, capacity, vehicle compatibility, reliability, and delivery requirements.

---

## 2. Matching Modes

### 2.1 Package-to-Partner

A customer creates a delivery request.

The engine identifies eligible mobility partners who can transport the package.

Inputs include:

- Pickup location
- Destination
- Required pickup time
- Delivery deadline
- Package category
- Package weight
- Package dimensions
- Vehicle requirements
- Delivery urgency
- Partner availability
- Partner route

### 2.2 Partner-to-Package

A mobility partner declares an upcoming trip.

The partner provides:

- Origin
- Destination
- Departure time
- Estimated arrival time
- Vehicle
- Available package capacity
- Accepted package categories
- Maximum package weight
- Maximum package dimensions
- Optional detour tolerance

The engine searches for compatible delivery opportunities.

This powers the Mobility-X Move & Earn / Route-to-Earn experience.

---

## 3. Eligibility Requirements

A mobility partner must satisfy all mandatory requirements before being eligible for a delivery offer.

Required checks include:

- Account active
- Identity verified
- Required driver verification completed
- Vehicle registered where applicable
- Vehicle active
- Partner available
- Partner not suspended
- Partner capacity available
- Package category permitted
- Weight within capacity
- Dimensions within capacity
- Route compatible
- Time window compatible

Partners failing mandatory eligibility checks must not receive the delivery offer.

---

## 4. Route Compatibility

Route compatibility determines how well a delivery fits an existing trip.

The engine should evaluate:

- Origin proximity
- Pickup proximity
- Destination proximity
- Route overlap
- Direction of travel
- Additional distance
- Additional travel time
- Detour distance
- Detour percentage

A direct route match should receive the highest compatibility.

A delivery requiring significant deviation should receive a lower score.

A delivery requiring travel in an incompatible direction should be rejected.

---

## 5. Detour Calculation

The engine must calculate the additional travel required to complete a delivery.

Conceptually:

Base Trip Distance =
distance(origin, destination)

Delivery Trip Distance =
distance(origin, pickup)
+
routeDistance(pickup, packageDestination)
+
routeDistance(packageDestination, destination)

Detour Distance =
Delivery Trip Distance - Base Trip Distance

Detour Percentage =
Detour Distance / Base Trip Distance

The engine must use routing data rather than straight-line distance when accurate road routing is available.

---

## 6. Time Compatibility

The engine must evaluate whether the partner can complete the delivery within the required time window.

Inputs include:

- Partner departure time
- Estimated trip duration
- Pickup availability window
- Delivery deadline
- Estimated delivery duration
- Traffic or route delay information where available

A delivery must not be offered when the required timing is impossible.

---

## 7. Capacity Matching

The engine must verify that the partner can safely carry the package.

Capacity checks include:

- Weight
- Volume
- Dimensions
- Vehicle type
- Available capacity
- Number of packages already assigned

Multiple packages may be matched to the same trip when sufficient capacity exists.

---

## 8. Package Compatibility

Packages must be evaluated against partner and vehicle capabilities.

The system must support package classifications such as:

- Standard
- Fragile
- High Value
- Temperature Sensitive
- Restricted

Restricted categories must require explicit eligibility rules.

---

## 9. Compatibility Score

Eligible candidates receive a compatibility score.

The score should consider:

- Route compatibility
- Time compatibility
- Pickup proximity
- Destination proximity
- Detour efficiency
- Vehicle compatibility
- Capacity availability
- Partner reliability
- Delivery urgency

The scoring system must be deterministic and explainable in V1.

The engine must be able to return the reasons behind a score.

Example:

Route Compatibility: High
Time Compatibility: High
Detour: Low
Capacity: Available
Vehicle: Compatible
Reliability: High

---

## 10. Matching Priority

When multiple eligible partners are available, the engine should prioritize:

1. Strongest route compatibility
2. Lowest required detour
3. Best time compatibility
4. Appropriate vehicle and capacity
5. Higher partner reliability
6. Better estimated delivery performance
7. Fair distribution of opportunities

The engine should avoid repeatedly favoring the same partner when other qualified partners are available.

---

## 11. Move & Earn Opportunities

Mobility-X must allow a partner to declare an upcoming trip.

Example:

Origin:
Lagos

Destination:
Ibadan

Departure:
10:00 AM

Vehicle:
Car

Available Package Capacity:
2 packages

The engine searches for compatible packages.

The partner receives opportunities showing:

- Package route
- Pickup location
- Delivery location
- Required pickup time
- Estimated detour
- Estimated earnings
- Package requirements
- Compatibility score

The partner may accept or decline the opportunity.

---

## 12. Matching Results

The engine should return structured matching results containing:

- Match ID
- Package ID
- Partner ID
- Compatibility score
- Route compatibility
- Time compatibility
- Detour distance
- Estimated additional travel time
- Capacity status
- Vehicle compatibility
- Estimated earnings
- Match expiration
- Match explanation

---

## 13. Match Expiration

Delivery offers must expire after a defined period.

Expired offers must not remain available for acceptance.

The system may re-run matching when:

- Partner declines
- Offer expires
- Partner becomes unavailable
- Package requirements change
- Delivery timing changes
- Route changes
- Package is cancelled

---

## 14. Fairness and Opportunity Distribution

Mobility-X should not optimize only for speed.

The matching system should balance:

- Delivery efficiency
- Partner earnings
- Customer experience
- Partner opportunity distribution
- Reliability
- Platform economics

The objective is a healthy two-sided marketplace.

---

## 15. Delivery State Compatibility

Matching must respect the delivery lifecycle:

DRAFT
BOOKED
MATCHING
ACCEPTED
PICKUP_PENDING
PICKED_UP
IN_TRANSIT
NEAR_DESTINATION
DELIVERED
SETTLED

Exception states:

CANCELLED
FAILED
DISPUTED
RETURNED

Only eligible states may enter or re-enter matching.

---

## 16. Security Requirements

The matching engine must not expose unnecessary customer or package information before acceptance.

Sensitive information must be minimized.

Partner identity and package information must be revealed progressively according to delivery state and authorization.

---

## 17. V1 Implementation Principle

Mobility-X V1 will use deterministic rule-based matching.

The initial implementation should prioritize:

- Correctness
- Explainability
- Reliability
- Testability
- Geographic accuracy
- Marketplace fairness

Machine-learning optimization may be introduced later after sufficient marketplace data exists.

---

## 18. Core Product Principle

Mobility-X should not only ask:

"Who can deliver this package?"

It should also ask:

"Who is already going there?"

That distinction is central to the Mobility-X business model.

The goal is to make compatible movement more useful, efficient, and economically productive.

