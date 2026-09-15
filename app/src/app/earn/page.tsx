"use client";

import { useEffect, useState } from "react";
import { calculateEarnings } from "../../lib/earnings";

type DeliveryStatus =
  | "accepted"
  | "pickup_pending"
  | "picked_up"
  | "in_transit"
  | "near_destination"
  | "delivered";

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
    status: DeliveryStatus;
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

const statusLabels: Record<DeliveryStatus, string> = {
  accepted: "Accepted",
  pickup_pending: "Pickup pending",
  picked_up: "Picked up",
  in_transit: "In transit",
  near_destination: "Near destination",
  delivered: "Delivered",
};

export default function EarnPage() {
  const [status, setStatus] =
    useState<"loading" | "ready" | "accepted" | "empty" | "error">(
      "loading",
    );

  const [offeredMatch, setOfferedMatch] =
    useState<OfferedMatch | null>(null);

  const [deliveryStatus, setDeliveryStatus] =
    useState<DeliveryStatus | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

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
        setDeliveryStatus(firstMatch.delivery.status);
        setStatus(
          firstMatch.status === "accepted" ||
            firstMatch.delivery.status !== "offered"
            ? "accepted"
            : "ready",
        );
      } catch (error) {
        console.error("Failed to load offered match:", error);
        setStatus("error");
      }
    }

    loadOfferedMatch();
  }, []);

  const estimatedEarnings = offeredMatch
    ? calculateEarnings({
        baseFare: 1000,
        distanceKm: offeredMatch.tripDistanceKm ?? 0,
        detourDistanceKm: offeredMatch.detourDistanceKm,
        packageWeightKg: offeredMatch.delivery.package.weightKg,
      })
    : null;

  async function acceptOpportunity() {
    if (!offeredMatch) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/matches/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: offeredMatch.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message ?? "Failed to accept opportunity.",
        );
        return;
      }

      setDeliveryStatus("accepted");
      setStatus("accepted");
    } catch (error) {
      console.error(
        "Failed to accept opportunity:",
        error,
      );

      setErrorMessage(
        "Unable to accept the opportunity. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function updateDeliveryStatus(
    nextStatus: "pickup_pending",
  ) {
    if (!offeredMatch) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/deliveries/status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryId: offeredMatch.deliveryId,
            status: nextStatus,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message ?? "Failed to update delivery status.",
        );
        return;
      }

      setDeliveryStatus(data.delivery.status);
    } catch (error) {
      console.error(
        "Failed to update delivery status:",
        error,
      );

      setErrorMessage(
        "Unable to update the delivery. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function executeDeliveryAction(
    action: "pickup" | "start" | "near" | "complete",
  ) {
    if (!offeredMatch) return;

    setActionLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/deliveries/execute",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryId: offeredMatch.deliveryId,
            action,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.message ?? "Failed to execute delivery action.",
        );
        return;
      }

      setDeliveryStatus(data.status);
    } catch (error) {
      console.error(
        "Failed to execute delivery action:",
        error,
      );

      setErrorMessage(
        "Unable to update the delivery. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function getNextAction() {
    switch (deliveryStatus) {
      case "accepted":
        return {
          label: "Start pickup",
          action: () =>
            updateDeliveryStatus("pickup_pending"),
        };

      case "pickup_pending":
        return {
          label: "Mark package picked up",
          action: () =>
            executeDeliveryAction("pickup"),
        };

      case "picked_up":
        return {
          label: "Start delivery",
          action: () =>
            executeDeliveryAction("start"),
        };

      case "in_transit":
        return {
          label: "Mark near destination",
          action: () =>
            executeDeliveryAction("near"),
        };

      case "near_destination":
        return {
          label: "Complete delivery",
          action: () =>
            executeDeliveryAction("complete"),
        };

      default:
        return null;
    }
  }

  const nextAction = getNextAction();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mobility-X
          </h1>

          <p className="text-xs text-slate-500">
            Move. Deliver. Earn.
          </p>
        </div>

        <a
          href="/"
          className="rounded-full px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Home
        </a>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-12">
        {status === "loading" && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Route-to-Earn
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              Finding opportunities...
            </h2>

            <p className="mt-4 text-slate-600">
              Mobility-X is checking your available delivery opportunities.
            </p>
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Route-to-Earn
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              No delivery opportunities yet.
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Mobility-X will show compatible delivery opportunities when
              they become available for your route.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Something went wrong
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight">
              We couldn't load your opportunity.
            </h2>

            <p className="mt-4 text-slate-600">
              {errorMessage ??
                "Please try again in a moment."}
            </p>
          </div>
        )}

        {(status === "ready" || status === "accepted") &&
          offeredMatch && (
            <>
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Route-to-Earn
                </p>

                <h2 className="mt-4 text-5xl font-bold leading-tight tracking-tight">
                  Earn from where
                  <span className="block">
                    you're already going.
                  </span>
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
                      {offeredMatch.trip?.originAddress ??
                        "Unknown"}{" "}
                      -&gt;{" "}
                      {offeredMatch.trip?.destinationAddress ??
                        "Unknown"}
                    </h3>

                    <p className="mt-2 text-slate-600">
                      {offeredMatch.trip
                        ? `${offeredMatch.trip.vehicle.type} - ${offeredMatch.trip.availablePackageCount} package spaces - Up to ${offeredMatch.trip.availableWeightKg} kg`
                        : "Trip details unavailable"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-5 py-4">
                    <p className="text-sm text-slate-500">
                      Compatibility
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {offeredMatch.compatibilityScore}%
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Route
                    </p>

                    <p className="mt-1 font-semibold">
                      {offeredMatch.routeCompatibility}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Time
                    </p>

                    <p className="mt-1 font-semibold">
                      {offeredMatch.timeCompatibility}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Trip distance
                    </p>

                    <p className="mt-1 font-semibold">
                      {offeredMatch.tripDistanceKm != null
                        ? `${offeredMatch.tripDistanceKm.toFixed(1)} km`
                        : "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Detour
                    </p>

                    <p className="mt-1 font-semibold">
                      {offeredMatch.detourDistanceKm} km
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5">
                    <p className="text-sm text-slate-500">
                      Vehicle
                    </p>

                    <p className="mt-1 font-semibold capitalize">
                      {offeredMatch.trip?.vehicle
                        .verificationStatus ?? "unknown"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Delivery
                    </p>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Pickup
                        </p>

                        <p className="mt-1 font-semibold">
                          {offeredMatch.delivery.pickupAddress}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Destination
                        </p>

                        <p className="mt-1 font-semibold">
                          {offeredMatch.delivery.destinationAddress}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Package
                        </p>

                        <p className="mt-1 font-semibold">
                          {offeredMatch.delivery.package.description ??
                            "Package"}{" "}
                          -{" "}
                          {offeredMatch.delivery.package.weightKg} kg
                        </p>

                        <p className="mt-1 text-sm capitalize text-slate-500">
                          {offeredMatch.delivery.package.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Delivery status
                    </p>

                    <div className="mt-5">
                      <p className="text-3xl font-bold">
                        {deliveryStatus
                          ? statusLabels[deliveryStatus]
                          : "Unknown"}
                      </p>

                      <p className="mt-2 text-slate-500">
                        Payment:{" "}
                        {offeredMatch.delivery.paymentStatus}
                      </p>
                    </div>

                    {nextAction && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={nextAction.action}
                        className="mt-6 w-full rounded-xl bg-slate-950 px-7 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {actionLoading
                          ? "Updating..."
                          : nextAction.label}
                      </button>
                    )}

                    {deliveryStatus === "delivered" && (
                      <div className="mt-6 rounded-xl bg-slate-100 p-4">
                        <p className="font-semibold">
                          Delivery completed.
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          The delivery is now ready for the confirmation
                          and payment workflow.
                        </p>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Estimated partner earnings
                    </p>

                    <p className="text-3xl font-bold">
                      {estimatedEarnings?.partnerEarnings?.toLocaleString() ??
                        "0"}{" "}
                      {offeredMatch.delivery.currency}
                    </p>
                  </div>

                  {status === "ready" && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={acceptOpportunity}
                      className="rounded-xl bg-slate-950 px-7 py-4 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {actionLoading
                        ? "Accepting..."
                        : "Accept opportunity"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
      </section>
    </main>
  );
}

