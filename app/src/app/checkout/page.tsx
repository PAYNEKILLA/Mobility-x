"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
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

const platformFee = Math.round(earnings * 0.15);

const currency = searchParams.get("currency") || "NGN";

const distanceKm = searchParams.get("distanceKm") || "0";

const score = searchParams.get("score") || "0";
const total = earnings + platformFee;


  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Mobility-X
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          Secure Checkout
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Review your delivery and payment details before
          securing the booking.
        </p>

        <div className="mt-10 grid gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Delivery
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {origin} → {destination}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Distance
                </p>

                <p className="mt-2 text-xl font-bold">
                  {distanceKm} km
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Match score
                </p>

                <p className="mt-2 text-xl font-bold">
                  {score} / 100
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Carrier earnings
                </p>

                <p className="mt-2 text-xl font-bold">
                  {currency} {earnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold">
              Payment summary
            </h2>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Carrier earnings
                </span>

                <span className="font-semibold">
                  {currency} {earnings.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Mobility-X service fee
                </span>

                <span className="font-semibold">
                  {currency} {platformFee.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    {currency} {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-6">
              <h3 className="font-semibold">
                Mobility-X escrow protection
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <div>
                  <p className="font-semibold">
                    1. Secure
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your payment is authorized and securely
                    held for the booking.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    2. Deliver
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    The carrier completes the agreed delivery.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    3. Release
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Eligible carrier earnings can be released
                    after completion.
                  </p>
                </div>
              </div>
            </div>

            <a
             href={`/payment-pending?deliveryId=${encodeURIComponent(
  deliveryId,
)}&tripId=${encodeURIComponent(
  tripId,
)}&partnerId=${encodeURIComponent(
  partnerId,
)}&vehicleId=${encodeURIComponent(
  vehicleId,
)}&origin=${encodeURIComponent(
  origin,
)}&destination=${encodeURIComponent(
  destination,
)}&amount=${encodeURIComponent(
  total,
)}&currency=${encodeURIComponent(
  currency,
)}&distanceKm=${encodeURIComponent(
  distanceKm,
)}&score=${encodeURIComponent(
  score,
)}`}            >
              Secure payment
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-6 py-16">
          <section className="mx-auto max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Mobility-X
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Loading checkout...
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Preparing your secure payment details.
            </p>
          </section>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
