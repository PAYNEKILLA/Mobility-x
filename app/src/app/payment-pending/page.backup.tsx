"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import type {
  Delivery,
  Payment,
} from "../../lib/domain";

function PaymentPendingContent() {
  const searchParams = useSearchParams();

  const deliveryId =
    searchParams.get("deliveryId") ?? "";

  const origin =
    searchParams.get("origin") ?? "Unknown";

  const destination =
    searchParams.get("destination") ?? "Unknown";

  const amount = Number(
    searchParams.get("amount") ?? "0",
  );

  const currency =
    searchParams.get("currency") ?? "NGN";

  const [delivery, setDelivery] =
    useState<Delivery | null>(null);

  const [payment, setPayment] =
    useState<Payment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPayment() {
      if (!deliveryId) {
        setError(
          "A delivery ID is required to load payment details.",
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/payments?deliveryId=${encodeURIComponent(
            deliveryId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(
            data.message ||
              "Payment record not found.",
          );
          setLoading(false);
          return;
        }

        setPayment(data.payment);

        const deliveryResponse =
          await fetch(
            `/api/deliveries?deliveryId=${encodeURIComponent(
              deliveryId,
            )}`,
            {
              method: "GET",
              cache: "no-store",
            },
          );

        if (deliveryResponse.ok) {
          const deliveryData =
            await deliveryResponse.json();

          if (
            deliveryData.success &&
            deliveryData.delivery
          ) {
            setDelivery(
              deliveryData.delivery,
            );
          }
        }

        setLoading(false);
      } catch (loadError) {
        console.error(
          "Failed to load payment:",
          loadError,
        );

        setError(
          "Unable to load payment details.",
        );

        setLoading(false);
      }
    }

    loadPayment();
  }, [deliveryId]);

  async function createPayment() {
    if (!deliveryId) {
      setError(
        "A delivery ID is required.",
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const response = await fetch(
        "/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "create",
            deliveryId,
            amount,
            currency,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Failed to create payment.",
        );
        return;
      }

      setPayment(data.payment);
    } catch (createError) {
      console.error(
        "Create payment error:",
        createError,
      );

      setError(
        "Something went wrong while creating the payment.",
      );
    } finally {
      setProcessing(false);
    }
  }

  async function advancePayment() {
    if (!payment) {
      await createPayment();
      return;
    }

    let action:
      | "authorize"
      | "hold"
      | "complete"
      | "release";

    if (payment.status === "pending") {
      action = "authorize";
    } else if (
      payment.status === "authorized"
    ) {
      action = "hold";
    } else if (
      payment.status === "held"
    ) {
      action = "complete";
    } else if (
      payment.status === "release_pending"
    ) {
      action = "release";
    } else {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const response = await fetch(
        "/api/payments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            paymentId: payment.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Payment operation failed.",
        );
        return;
      }

      if (data.payment) {
        setPayment(data.payment);
      }

      if (data.delivery) {
        setDelivery(data.delivery);
      }

      if (action === "authorize") {
        setDelivery((current) =>
          current
            ? {
                ...current,
                paymentStatus:
                  "authorized",
              }
            : current,
        );
      }

      if (action === "hold") {
        setDelivery((current) =>
          current
            ? {
                ...current,
                paymentStatus: "held",
              }
            : current,
        );
      }

      if (action === "complete") {
        setDelivery((current) =>
          current
            ? {
                ...current,
                status: "delivered",
                paymentStatus:
                  "release_pending",
              }
            : current,
        );
      }

      if (action === "release") {
        setDelivery((current) =>
          current
            ? {
                ...current,
                status: "confirmed",
                paymentStatus:
                  "released",
              }
            : current,
        );
      }
    } catch (paymentError) {
      console.error(
        "Payment operation error:",
        paymentError,
      );

      setError(
        "Something went wrong while processing the payment.",
      );
    } finally {
      setProcessing(false);
    }
  }

  const stage =
    payment?.status ?? "pending";

  const stageLabel = {
    pending: "PAYMENT PENDING",
    authorized: "PAYMENT AUTHORIZED",
    held: "PAYMENT SECURED",
    release_pending: "RELEASE PENDING",
    released: "PAYMENT RELEASED",
    refunded: "PAYMENT REFUNDED",
    disputed: "PAYMENT DISPUTED",
    failed: "PAYMENT FAILED",
  }[stage];

  const stageDescription = {
    pending:
      "Your payment is awaiting authorization.",

    authorized:
      "Your payment has been authorized and is ready to enter escrow.",

    held:
      "Your funds are securely held while the delivery is completed.",

    release_pending:
      "The delivery is complete and the payment is awaiting release.",

    released:
      "The eligible carrier earnings have been released.",

    refunded:
      "The payment has been refunded.",

    disputed:
      "This payment is under dispute review.",

    failed:
      "This payment could not be completed.",
  }[stage];

  const isComplete =
    payment?.status === "released";

  const buttonLabel =
    !payment
      ? "Create payment"
      : payment.status ===
          "pending"
        ? "Authorize payment"
        : payment.status ===
            "authorized"
          ? "Secure funds in escrow"
          : payment.status ===
              "held"
            ? "Complete delivery"
            : payment.status ===
                "release_pending"
              ? "Release payment"
              : "";

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Mobility-X
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Loading payment details...
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Connecting to your booking.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="text-xl font-bold tracking-tight"
          >
            Mobility-X
          </a>

          <span className="text-sm font-medium text-slate-500">
            Move. Deliver. Earn.
          </span>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Payment
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Payment error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
            {stageLabel}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            {isComplete
              ? "Payment lifecycle completed."
              : stage === "held"
                ? "Your payment is being held securely."
                : "Your payment is being processed."}
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            {stageDescription}
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Delivery
            </p>

            <p className="mt-2 text-2xl font-bold">
              {origin} {"\u2192"} {destination}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-slate-600">
                Amount
              </span>

              <span className="text-xl font-bold">
                {currency}{" "}
                {amount.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-slate-600">
                Delivery status
              </span>

              <span className="font-semibold">
                {delivery?.status ??
                  "Loading"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-slate-600">
                Payment status
              </span>

              <span className="font-semibold">
                {payment?.status ??
                  "Not created"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div
              className={`rounded-2xl border p-5 ${
                stage !== "pending"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                1. Authorize
              </p>

              <p
                className={`mt-2 text-sm ${
                  stage !== "pending"
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Payment authorization.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                stage === "held" ||
                stage ===
                  "release_pending" ||
                stage === "released"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                2. Hold
              </p>

              <p
                className={`mt-2 text-sm ${
                  stage === "held" ||
                  stage ===
                    "release_pending" ||
                  stage === "released"
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Funds secured in escrow.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                stage ===
                  "release_pending" ||
                stage === "released"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                3. Release
              </p>

              <p
                className={`mt-2 text-sm ${
                  stage ===
                    "release_pending" ||
                  stage === "released"
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Delivery completion triggers
                release eligibility.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                stage === "released"
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                4. Complete
              </p>

              <p
                className={`mt-2 text-sm ${
                  stage === "released"
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Payment lifecycle completed.
              </p>
            </div>
          </div>

          {!isComplete &&
            buttonLabel && (
              <button
                type="button"
                disabled={processing}
                onClick={advancePayment}
                className="mt-8 block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : buttonLabel}
              </button>
            )}

          {isComplete && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="font-semibold">
                Mobility-X payment flow complete.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                The payment has moved through the
                complete escrow lifecycle.
              </p>
            </div>
          )}

          <a
            href="/"
            className="mt-4 block w-full rounded-xl border border-slate-200 px-6 py-4 text-center font-semibold hover:bg-slate-50"
          >
            Return home
          </a>
        </div>
      </section>
    </main>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <section className="mx-auto max-w-3xl px-6 py-16">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Mobility-X
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight">
                Loading payment details...
              </h1>
            </div>
          </section>
        </main>
      }
    >
      <PaymentPendingContent />
    </Suspense>
  );
}