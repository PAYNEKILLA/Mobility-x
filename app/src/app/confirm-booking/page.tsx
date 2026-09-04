"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ConfirmBookingContent() {
  const searchParams = useSearchParams();

  const deliveryId = searchParams.get("deliveryId");
if (!deliveryId) {
  return <div>Booking information is incomplete.</div>;
}

  const tripId = searchParams.get("tripId");
if (!tripId) {
  return <div>Trip information is incomplete.</div>;
}

  const partnerId = searchParams.get("partnerId");
if (!partnerId) {
  return <div>Partner information is incomplete.</div>;
}

  const vehicleId = searchParams.get("vehicleId");
if (!vehicleId) {
  return <div>Vehicle information is incomplete.</div>;
}

  const origin = searchParams.get("origin");
if (!origin) {
  return <div>Pickup location is incomplete.</div>;
}

  const destination = searchParams.get("destination");
if (!destination) {
  return <div>Destination information is incomplete.</div>;
}

  const earnings = Number(searchParams.get("earnings") || 0);

  const currency = searchParams.get("currency") || "NGN";

  const distanceKm = searchParams.get("distanceKm") || "0";

  const score = searchParams.get("score") || "0";

  const [isSelecting, setIsSelecting] =
    useState(false);

  async function handleConfirm() {
    if (
      !deliveryId ||
      deliveryId === "Unknown" ||
      !tripId ||
      tripId === "Unknown"
    ) {
      alert(
        "Missing delivery or carrier information.",
      );
      return;
    }

    setIsSelecting(true);

    try {
      const response = await fetch(
        "/api/matches",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryId,
            tripId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to select carrier.",
        );
        return;
      }

      window.location.href =
        `/checkout?deliveryId=${encodeURIComponent(
          deliveryId,
        )}` +
        `&tripId=${encodeURIComponent(
          tripId,
        )}` +
        `&partnerId=${encodeURIComponent(
          partnerId!,
        )}` +
        `&vehicleId=${encodeURIComponent(
          vehicleId!,
        )}` +
        `&origin=${encodeURIComponent(
          origin!,
        )}` +
        `&destination=${encodeURIComponent(
          destination!,
        )}` +
        `&earnings=${encodeURIComponent(
          earnings,
        )}` +
        `&currency=${encodeURIComponent(
          currency,
        )}` +
        `&distanceKm=${encodeURIComponent(
          distanceKm,
        )}` +
        `&score=${encodeURIComponent(
          score,
        )}`;
    } catch (error) {
      console.error(
        "Carrier selection error:",
        error,
      );

      alert(
        "Something went wrong while selecting the carrier.",
      );
    } finally {
      setIsSelecting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Mobility-X
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-slate-950">
          Confirm your booking
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Review the delivery match before continuing.
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                Selected delivery
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                {origin} → {destination}
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-100 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Match score
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {score}
              </p>

              <p className="text-sm text-slate-500">
                / 100
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Match details
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">
                  Delivery
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {deliveryId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Trip
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {tripId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Partner
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {partnerId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Vehicle
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {vehicleId}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Trip distance
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {Number(distanceKm).toFixed(1)} km
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Estimated carrier earnings
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {currency}{" "}
                {Number(earnings).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Match status
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                Recommended
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              Ready to continue?
            </h3>

            <p className="mt-2 text-slate-600">
              Confirm this delivery match to continue with the booking.
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSelecting}
              className="mt-6 block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSelecting
                ? "Selecting carrier..."
                : "Confirm and continue"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ConfirmBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-6 py-16">
          <section className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Mobility-X
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              Loading booking...
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Preparing your delivery details.
            </p>
          </section>
        </main>
      }
    >
      <ConfirmBookingContent />
    </Suspense>
  );
}

