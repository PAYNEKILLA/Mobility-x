"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import type {
  Delivery,
  Payment,
} from "../../lib/domain";

type DeliveryApiResponse = {
  success: boolean;
  delivery?: Delivery;
  message?: string;
};

type PaymentApiResponse = {
  success: boolean;
  payment?: Payment;
  delivery?: Delivery;
  message?: string;
};

type PaymentAction =
  | "authorize"
  | "hold"
  | "complete"
  | "release";

function PaymentPendingContent() {
  const searchParams = useSearchParams();

  const deliveryId =
    searchParams.get("deliveryId");

  const requestedAmount = Number(
    searchParams.get("amount") ?? "0",
  );

  const requestedCurrency =
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
    useState<string | null>(null);

  /*
   * Load the real delivery and payment from PostgreSQL.
   */
  const loadPaymentData =
    useCallback(async () => {
      if (!deliveryId) {
        setError(
          "Delivery ID is missing from the booking.",
        );

        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        /*
         * 1. Load the real delivery.
         */
        const deliveryResponse =
          await fetch(
            `/api/deliveries?deliveryId=${encodeURIComponent(
              deliveryId,
            )}`,
            {
              cache: "no-store",
            },
          );

        const deliveryData =
          (await deliveryResponse.json()) as DeliveryApiResponse;

        if (
          !deliveryResponse.ok ||
          !deliveryData.success ||
          !deliveryData.delivery
        ) {
          throw new Error(
            deliveryData.message ??
              "Delivery could not be loaded.",
          );
        }

        const realDelivery =
          deliveryData.delivery;

        setDelivery(realDelivery);

        /*
         * 2. Load the real payment.
         */
        const paymentResponse =
          await fetch(
            `/api/payments?deliveryId=${encodeURIComponent(
              deliveryId,
            )}`,
            {
              cache: "no-store",
            },
          );

        /*
         * 3. If payment does not exist,
         *    create it for the real delivery.
         */
        if (paymentResponse.status === 404) {
          const amount =
            requestedAmount > 0
              ? requestedAmount
              : realDelivery.estimatedPrice ?? 0;

          if (amount <= 0) {
            throw new Error(
              "A valid payment amount could not be determined.",
            );
          }

          const createResponse =
            await fetch("/api/payments", {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                action: "create",
                deliveryId,
                amount,
                currency:
                  requestedCurrency ||
                  realDelivery.currency ||
                  "NGN",
              }),
            });

          const createData =
            (await createResponse.json()) as PaymentApiResponse;

          if (
            !createResponse.ok ||
            !createData.success ||
            !createData.payment
          ) {
            throw new Error(
              createData.message ??
                "Payment could not be created.",
            );
          }

          setPayment(createData.payment);

          return;
        }

        const paymentData =
          (await paymentResponse.json()) as PaymentApiResponse;

        if (
          !paymentResponse.ok ||
          !paymentData.success ||
          !paymentData.payment
        ) {
          throw new Error(
            paymentData.message ??
              "Payment could not be loaded.",
          );
        }

        setPayment(paymentData.payment);
      } catch (err) {
        console.error(
          "Load payment data failed:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load payment details.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      deliveryId,
      requestedAmount,
      requestedCurrency,
    ]);

  useEffect(() => {
    void loadPaymentData();
  }, [loadPaymentData]);

  /*
   * Move the payment through the real backend lifecycle.
   */
  async function advancePayment() {
    if (!payment || processing) {
      return;
    }

    let action: PaymentAction;

    switch (payment.status) {
      case "pending":
        action = "authorize";
        break;

      case "authorized":
        action = "hold";
        break;

      case "held":
        action = "complete";
        break;

      case "release_pending":
        action = "release";
        break;

      default:
        return;
    }

    try {
      setProcessing(true);
      setError(null);

      const response =
        await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            paymentId: payment.id,
          }),
        });

      const data =
        (await response.json()) as PaymentApiResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.payment
      ) {
        throw new Error(
          data.message ??
            "Payment operation failed.",
        );
      }

      /*
       * Update immediately from the API response.
       */
      setPayment(data.payment);

      /*
       * Reload both records from PostgreSQL.
       * This guarantees the UI reflects the database.
       */
      if (deliveryId) {
        const refreshedDeliveryResponse =
          await fetch(
            `/api/deliveries?deliveryId=${encodeURIComponent(
              deliveryId,
            )}`,
            {
              cache: "no-store",
            },
          );

        if (refreshedDeliveryResponse.ok) {
          const refreshedDelivery =
            (await refreshedDeliveryResponse.json()) as DeliveryApiResponse;

          if (
            refreshedDelivery.success &&
            refreshedDelivery.delivery
          ) {
            setDelivery(
              refreshedDelivery.delivery,
            );
          }
        }

        const refreshedPaymentResponse =
          await fetch(
            `/api/payments?deliveryId=${encodeURIComponent(
              deliveryId,
            )}`,
            {
              cache: "no-store",
            },
          );

        if (refreshedPaymentResponse.ok) {
          const refreshedPayment =
            (await refreshedPaymentResponse.json()) as PaymentApiResponse;

          if (
            refreshedPayment.success &&
            refreshedPayment.payment
          ) {
            setPayment(
              refreshedPayment.payment,
            );
          }
        }
      }
    } catch (err) {
      console.error(
        "Payment transition failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Payment operation failed.",
      );
    } finally {
      setProcessing(false);
    }
  }

  /*
   * Loading state.
   */
  if (loading) {
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

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-bold tracking-tight">
              Loading payment details...
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Connecting this booking to its secure payment record.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Missing delivery ID.
   */
  if (!deliveryId) {
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
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
              Payment
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight">
              Booking information is incomplete.
            </h1>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              This payment page requires a valid delivery ID.
              Please return to checkout and try again.
            </p>

            <a
              href="/"
              className="mt-8 block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800"
            >
              Return home
            </a>
          </div>
        </section>
      </main>
    );
  }

  /*
   * If the delivery failed but payment page loaded,
   * show the actual error.
   */
  if (!delivery) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
            <h1 className="text-3xl font-bold text-red-800">
              Unable to load booking
            </h1>

            <p className="mt-3 text-red-700">
              {error ??
                "The delivery could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => {
                void loadPaymentData();
              }}
              className="mt-6 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        </section>
      </main>
    );
  }

  const stage =
    payment?.status ?? "pending";

  const stageLabel: Record<
    string,
    string
  > = {
    pending: "PAYMENT PENDING",
    authorized: "PAYMENT AUTHORIZED",
    held: "PAYMENT SECURED",
    release_pending: "DELIVERY COMPLETED",
    released: "PAYMENT RELEASED",
    refunded: "PAYMENT REFUNDED",
    disputed: "PAYMENT DISPUTED",
    failed: "PAYMENT FAILED",
  };

  const stageDescription: Record<
    string,
    string
  > = {
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
  };

  const isComplete =
    payment?.status === "released";

  const displayAmount =
    payment?.amount ??
    requestedAmount;

  const displayCurrency =
    payment?.currency ??
    delivery.currency ??
    requestedCurrency;

  function isStageComplete(
    target:
      | "authorize"
      | "hold"
      | "complete"
      | "release",
  ) {
    if (
      target === "authorize"
    ) {
      return [
        "authorized",
        "held",
        "release_pending",
        "released",
      ].includes(stage);
    }

    if (
      target === "hold"
    ) {
      return [
        "held",
        "release_pending",
        "released",
      ].includes(stage);
    }

    if (
      target === "complete"
    ) {
      return [
        "release_pending",
        "released",
      ].includes(stage);
    }

    if (
      target === "release"
    ) {
      return stage === "released";
    }

    return false;
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

            <button
              type="button"
              onClick={() => {
                void loadPaymentData();
              }}
              className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
            {stageLabel[stage] ??
              "PAYMENT"}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight">
            {isComplete
              ? "Payment lifecycle completed."
              : stage === "held"
                ? "Your payment is being held securely."
                : stage === "release_pending"
                  ? "Delivery completed."
                  : "Your payment is being processed."}
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            {stageDescription[stage] ??
              "Your payment is being processed."}
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Delivery
            </p>

            <p className="mt-2 text-2xl font-bold">
              {delivery.pickup.address}{" "}
              {"\u2192"}{" "}
              {delivery.destination.address}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-slate-600">
                Amount
              </span>

              <span className="text-xl font-bold">
                {displayCurrency}{" "}
                {displayAmount.toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-slate-600">
                Delivery status
              </span>

              <span className="font-semibold">
                {delivery.status}
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
                isStageComplete("authorize")
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                1. Authorize
              </p>

              <p
                className={`mt-2 text-sm ${
                  isStageComplete("authorize")
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Payment authorization.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isStageComplete("hold")
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                2. Hold
              </p>

              <p
                className={`mt-2 text-sm ${
                  isStageComplete("hold")
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Funds secured in escrow.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isStageComplete("complete")
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                3. Complete
              </p>

              <p
                className={`mt-2 text-sm ${
                  isStageComplete("complete")
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Delivery is completed and release becomes eligible.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isStageComplete("release")
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">
                4. Release
              </p>

              <p
                className={`mt-2 text-sm ${
                  isStageComplete("release")
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                Eligible payment is released.
              </p>
            </div>
          </div>

          {!isComplete &&
            payment &&
            (
              <button
                type="button"
                onClick={() => {
                  void advancePayment();
                }}
                disabled={processing}
                className="mt-8 block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing
                  ? "Processing..."
                  : stage === "pending"
                    ? "Authorize payment"
                    : stage === "authorized"
                      ? "Secure funds in escrow"
                      : stage === "held"
                        ? "Complete delivery"
                        : stage ===
                            "release_pending"
                          ? "Release payment"
                          : "Continue"}
              </button>
            )}

          {isComplete && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="font-semibold">
                Mobility-X payment flow complete.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                The payment has moved through the complete escrow lifecycle.
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
