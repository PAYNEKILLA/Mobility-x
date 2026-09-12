"use client";

import { useEffect, useState } from "react";
import { calculateEarnings } from "../../lib/earnings";

type OfferedMatch = {
  id: string;
  deliveryId: string;
  tripId: string | null;
  partnerId: string;
  compatibilityScore: number;
  routeCompatibility: number;
  timeCompatibility: number;
  detourDistanceKm: number;
    estimatedExtraMinutes: number;
  tripDistanceKm: number | null;
  status: string;
  delivery: {
    pickupAddress: string;
    destinationAddress: string;
    paymentStatus: string;
    currency: string;
    package: {
      weightKg: number;
      category: string;
      description: string | null;
    };
  };
  trip: {
    originAddress: string;
    destinationAddress: string;
    departureTime: string;
    estimatedArrivalTime: string | null;
    availablePackageCount: number;
    availableWeightKg: number;
    vehicle: {
      type: string;
      make: string | null;
      model: string | null;
      maxWeightKg: number;
      maxPackageCount: number;
      verificationStatus: string;
    };
  } | null;
};

export default function EarnPage() {
  const [status, setStatus] =
    useState<"loading" | "ready" | "accepted" | "empty" | "error">("loading");

  const [offeredMatch, setOfferedMatch] =
    useState<OfferedMatch | null>(null);

  useEffect(() => {
    async function loadOfferedMatch() {
      try {
        const response = await fetch("/api/matches/offered");
        const data = await response.json();

        if (!response.ok || !data.success) {
          setStatus("error");
          return;
        }

        const firstMatch = data.matches?.[0] ?? null;

        if (!firstMatch) {
          setStatus("empty");
          return;
        }

        setOfferedMatch(firstMatch);
        setStatus("ready");
      } catch (error) {
        console.error(
          "Failed to load offered match:",
          error,
        );
        setStatus("error");
      }
    }

    loadOfferedMatch();
  }, []);

  const estimatedEarnings = offeredMatch
    ? calculateEarnings({
        baseFare: 1000,
        distanceKm:
          offeredMatch.detourDistanceKm === 0
            ? 10
            : offeredMatch.detourDistanceKm,
        detourDistanceKm: offeredMatch.detourDistanceKm,
        packageWeightKg: offeredMatch.delivery.package.weightKg,
      })
    : null;
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
                  {estimatedEarnings?.partnerEarnings?.toLocaleString() ?? "0"}
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
                    {offeredMatch ? `${offeredMatch.trip?.originAddress ?? "Unknown"} -> ${offeredMatch.trip?.destinationAddress ?? "Unknown"}` : "Loading trip..."}
                  </h3>

                  <p className="mt-2 text-slate-600">
                    {offeredMatch?.trip ? `${offeredMatch.trip.vehicle.type} - ${offeredMatch.trip.availablePackageCount} package spaces - Up to ${offeredMatch.trip.availableWeightKg} kg` : "Trip details unavailable"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4">
                  <p className="text-sm text-slate-500">Compatibility</p>
                  <p className="mt-1 text-3xl font-bold">
                    {offeredMatch?.compatibilityScore ?? 0}%
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Route</p>
                  <p className="mt-1 font-semibold capitalize">
                    {offeredMatch?.routeCompatibility ?? 0}%
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="mt-1 font-semibold capitalize">
                    {offeredMatch?.timeCompatibility ?? 0}%
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Detour</p>
                  <p className="mt-1 font-semibold">
                    {offeredMatch?.detourDistanceKm ?? 0} km
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-slate-500">Vehicle</p>
                  <p className="mt-1 font-semibold capitalize">
                    {offeredMatch?.trip?.vehicle.verificationStatus ?? "unknown"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Estimated earnings
                  </p>
                  <p className="text-3xl font-bold">
                    {estimatedEarnings?.partnerEarnings?.toLocaleString() ?? "0"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={false}
                  onClick={async () => { if (!offeredMatch) return; try { const response = await fetch("/api/matches/accept", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: offeredMatch.id }) }); const data = await response.json(); if (!response.ok || !data.success) { setStatus("error"); return; } setStatus("accepted"); } catch (error) { console.error("Failed to accept opportunity:", error); setStatus("error"); } }}
                  className="rounded-xl bg-slate-950 px-7 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  "Accept opportunity"
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

