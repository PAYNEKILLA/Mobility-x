"use client";

import { useEffect, useMemo, useState } from "react";

type DeliveryStatus =
  | "draft"
  | "booked"
  | "matching"
  | "offered"
  | "accepted"
  | "pickup_pending"
  | "picked_up"
  | "in_transit"
  | "near_destination"
  | "delivered"
  | "confirmed"
  | "cancelled"
  | "failed"
  | "disputed"
  | "returned";

type Delivery = {
  id: string;
  pickup: {
    address: string;
  };
  destination: {
    address: string;
  };
  option: string;
  status: DeliveryStatus;
  paymentStatus: string;
  requestedPickupTime?: string;
  deliveryDeadline?: string;
  estimatedPrice?: number;
  currency: string;
  createdAt: string;
};

type PackageDetails = {
  id: string;
  category: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  description?: string;
};

type DeliveryResponse = {
  success: boolean;
  message?: string;
  delivery?: Delivery;
  package?: PackageDetails;
};

const STATUS_STEPS: {
  status: DeliveryStatus;
  label: string;
}[] = [
  { status: "booked", label: "Booked" },
  { status: "matching", label: "Finding carrier" },
  { status: "accepted", label: "Carrier accepted" },
  { status: "pickup_pending", label: "Pickup pending" },
  { status: "picked_up", label: "Package picked up" },
  { status: "in_transit", label: "In transit" },
  { status: "near_destination", label: "Near destination" },
  { status: "delivered", label: "Delivered" },
  { status: "confirmed", label: "Confirmed" },
];

const STATUS_ORDER: DeliveryStatus[] = [
  "draft",
  "booked",
  "matching",
  "offered",
  "accepted",
  "pickup_pending",
  "picked_up",
  "in_transit",
  "near_destination",
  "delivered",
  "confirmed",
];

function getStatusIndex(status: DeliveryStatus) {
  return STATUS_ORDER.indexOf(status);
}

function formatMoney(amount: number | undefined, currency: string) {
  if (amount === undefined || amount === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function statusLabel(status: DeliveryStatus) {
  const match = STATUS_STEPS.find((step) => step.status === status);

  if (match) {
    return match.label;
  }

  return status.replaceAll("_", " ");
}

export default function TrackPage() {
  const [deliveryId, setDeliveryId] = useState("");
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [packageDetails, setPackageDetails] =
    useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentIndex = useMemo(() => {
    if (!delivery) {
      return -1;
    }

    return getStatusIndex(delivery.status);
  }, [delivery]);

  async function loadDelivery(id: string) {
    const trimmedId = id.trim();

    if (!trimmedId) {
      setErrorMessage("Enter a delivery ID to track your package.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/deliveries?deliveryId=${encodeURIComponent(trimmedId)}`,
      );

      const data: DeliveryResponse = await response.json();

      if (!response.ok || !data.success || !data.delivery) {
        throw new Error(
          data.message || "Unable to retrieve this delivery.",
        );
      }

      setDelivery(data.delivery);
      setPackageDetails(data.package ?? null);
    } catch (error) {
      setDelivery(null);
      setPackageDetails(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to retrieve this delivery.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryDeliveryId = params.get("deliveryId");

    if (queryDeliveryId) {
      setDeliveryId(queryDeliveryId);
      loadDelivery(queryDeliveryId);
    }
  }, []);

  async function refreshDelivery() {
    if (!deliveryId.trim()) {
      return;
    }

    await loadDelivery(deliveryId);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
            Mobility-X
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Track your delivery
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Follow your package from booking through pickup, transit,
            delivery, and customer confirmation.
          </p>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={deliveryId}
              onChange={(event) => setDeliveryId(event.target.value)}
              placeholder="Enter delivery ID"
              className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />

            <button
              type="button"
              onClick={() => loadDelivery(deliveryId)}
              disabled={loading}
              className="min-h-12 rounded-xl bg-purple-600 px-6 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Tracking..." : "Track delivery"}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errorMessage}
            </p>
          ) : null}
        </section>

        {delivery ? (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Delivery ID</p>
                  <p className="mt-1 break-all font-mono text-sm font-semibold">
                    {delivery.id}
                  </p>
                </div>

                <div className="rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold capitalize text-purple-700">
                  {statusLabel(delivery.status)}
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pickup
                  </p>
                  <p className="mt-2 font-semibold">{delivery.pickup.address}</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Destination
                  </p>
                  <p className="mt-2 font-semibold">
                    {delivery.destination.address}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">Delivery progress</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Current status: {statusLabel(delivery.status)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshDelivery}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {STATUS_STEPS.map((step, index) => {
                  const stepIndex = getStatusIndex(step.status);
                  const isComplete =
                    currentIndex >= 0 && currentIndex >= stepIndex;
                  const isCurrent = delivery.status === step.status;

                  return (
                    <div
                      key={step.status}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          isComplete
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-slate-300 bg-white text-slate-400"
                        }`}
                      >
                        {isComplete ? "OK" : index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold ${
                            isCurrent
                              ? "text-purple-700"
                              : isComplete
                                ? "text-slate-900"
                                : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>

                        {isCurrent ? (
                          <p className="text-sm text-purple-600">
                            Your delivery is currently here.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Package</h2>

                {packageDetails ? (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Category</span>
                      <span className="font-semibold capitalize">
                        {packageDetails.category}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Weight</span>
                      <span className="font-semibold">
                        {packageDetails.weightKg} kg
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Dimensions</span>
                      <span className="font-semibold">
                        {packageDetails.lengthCm} × {packageDetails.widthCm} ×{" "}
                        {packageDetails.heightCm} cm
                      </span>
                    </div>

                    {packageDetails.description ? (
                      <div className="border-t border-slate-100 pt-3">
                        <span className="text-slate-500">Description</span>
                        <p className="mt-1 font-medium">
                          {packageDetails.description}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Package details unavailable.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Delivery details</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Option</span>
                    <span className="font-semibold capitalize">
                      {delivery.option}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-semibold capitalize">
                      {delivery.paymentStatus.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Estimated price</span>
                    <span className="font-semibold">
                      {formatMoney(
                        delivery.estimatedPrice,
                        delivery.currency,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Pickup time</span>
                    <span className="text-right font-semibold">
                      {formatDate(delivery.requestedPickupTime)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Deadline</span>
                    <span className="text-right font-semibold">
                      {formatDate(delivery.deliveryDeadline)}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {delivery.status === "confirmed" ? (
              <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <h2 className="text-xl font-bold text-green-800">
                  Delivery confirmed
                </h2>
                <p className="mt-2 text-sm text-green-700">
                  The customer has confirmed that the delivery was completed.
                </p>
              </section>
            ) : null}

            {delivery.status === "delivered" ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-xl font-bold text-amber-800">
                  Package delivered
                </h2>
                <p className="mt-2 text-sm text-amber-700">
                  Your package has reached the destination. Customer
                  confirmation is the next step.
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
