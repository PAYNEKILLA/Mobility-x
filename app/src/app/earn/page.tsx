"use client";

import { useState } from "react";
import { calculateMatch } from "../../lib/matching";
import { calculateEarnings } from "../../lib/earnings";
export default function EarnPage() {
  const [status, setStatus] = useState<"ready" | "accepted">("ready");

  const match = calculateMatch({
    trip: {
      id: "trip-001",
      partnerId: "partner-001",
      vehicleId: "vehicle-001",
      origin: {
        address: "Makurdi",
        coordinates: {
          latitude: 7.7322,
          longitude: 8.5391,
        },
      },
      destination: {
        address: "Abuja",
        coordinates: {
          latitude: 9.0765,
          longitude: 7.3986,
        },
      },
      departureTime: "2026-08-05T07:00:00Z",
      estimatedArrivalTime: "2026-08-05T12:00:00Z",
      availablePackageCount: 2,
      availableWeightKg: 20,
      acceptedCategories: ["standard", "fragile"],
      status: "published",
    },

    delivery: {paymentStatus: "pending",
      id: "delivery-001",
      customerId: "customer-001",
      packageId: "package-001",
      pickup: {
        address: "Makurdi",
        coordinates: {
          latitude: 7.7322,
          longitude: 8.5391,
        },
      },
      destination: {
        address: "Abuja",
        coordinates: {
          latitude: 9.0765,
          longitude: 7.3986,
        },
      },
      option: "route_to_earn",
      status: "matching",
      deliveryDeadline: "2026-08-06T18:00:00Z",
      currency: "NGN",
      createdAt: "2026-08-05T06:00:00Z",
    },

    package: {
      id: "package-001",
      category: "standard",
      weightKg: 2,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 15,
      description: "Standard package",
    },

    vehicle: {
      id: "vehicle-001",
      ownerId: "partner-001",
      type: "car",
      make: "Toyota",
      model: "Camry",
      registrationNumber: "ABC-123",
      maxWeightKg: 100,
      maxPackageCount: 3,
      verificationStatus: "verified",
    },
  });

  const earnings = calculateEarnings({
  baseFare: 1500,
  distanceKm: 8,
  detourDistanceKm: match.detourDistanceKm,
  packageWeightKg: 2,
});

const estimatedEarnings = earnings.partnerEarnings;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mobility-X</h1>
          <p className="text-xs text-slate-500">Move. Deliver. Earn.</p>
        </div>

        <a
          href="/"
          className="rounded-full px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Home
        </a>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12">
        {status === "accepted" ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Opportunity accepted
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              You're matched.
            </h2>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              This delivery has been added to your trip. Mobility-X can now
              move the opportunity into the pickup workflow.
            </p>

            <div className="mt-10 rounded-2xl bg-white p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                <span className="text-slate-500">Expected earnings</span>
                <strong className="text-2xl">
                  ₦{estimatedEarnings.toLocaleString()}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-5">
                <span className="text-slate-500">Status</span>
                <strong>Accepted</strong>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Route-to-Earn
              </p>

              <h2 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
                Earn from where
                <span className="block">you're already going.</span>
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Mobility-X looks for delivery opportunities that fit your
                existing route, available capacity, vehicle, and timing.
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Your trip
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    Makurdi → Abuja
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Car · 2 package spaces · Up to 20 kg
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4">
                  <p className="text-sm text-slate-500">Compatibility</p>
                  <p className="mt-1 text-3xl font-bold">
                    {match.compatibilityScore}%
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Route</p>
                  <p className="mt-1 font-semibold capitalize">
                    {match.explanation.route}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="mt-1 font-semibold capitalize">
                    {match.explanation.time}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Detour</p>
                  <p className="mt-1 font-semibold">
                    {match.detourDistanceKm} km
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Vehicle</p>
                  <p className="mt-1 font-semibold capitalize">
                    {match.explanation.vehicle}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Estimated earnings
                  </p>
                  <p className="text-3xl font-bold">
                    ₦{estimatedEarnings.toLocaleString()}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!match.eligible}
                  onClick={() => setStatus("accepted")}
                  className="rounded-xl bg-slate-950 px-7 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {match.eligible
                    ? "Accept opportunity"
                    : "Not eligible"}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}