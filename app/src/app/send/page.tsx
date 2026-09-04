"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendPackagePage() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [packageSize, setPackageSize] = useState("medium");
const [weightKg, setWeightKg] = useState("");
const [pickupTime, setPickupTime] = useState("");
  const router = useRouter();

  async function handleContinue() {
  const weight = Number(weightKg);

  if (!pickup.trim()) {
    alert("Please enter a pickup location.");
    return;
  }

  if (!destination.trim()) {
    alert("Please enter a destination.");
    return;
  }

  if (!description.trim()) {
    alert("Please describe the package.");
    return;
  }

  if (!weightKg || weight <= 0) {
    alert("Please enter a valid package weight.");
    return;
  }

  if (!pickupTime) {
    alert("Please select a preferred pickup time.");
    return;
  }

  const maxWeight =
    packageSize === "small"
      ? 5
      : packageSize === "medium"
        ? 15
        : 30;

  if (weight > maxWeight) {
    alert(
      `This ${packageSize} package can only weigh up to ${maxWeight} kg.`,
    );
    return;
  }

  try {
    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: "cmt7gyb8d00008sm0w5iyepcj",
        pickup,
        destination,
        description,
        packageSize,
        weightKg: weight,
        pickupTime,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to create delivery.");
      return;
    }

    const deliveryId = data.delivery.id;

    router.push(
      `/find-carrier?deliveryId=${encodeURIComponent(
        deliveryId,
      )}&pickup=${encodeURIComponent(
        pickup,
      )}&destination=${encodeURIComponent(
        destination,
      )}&packageSize=${encodeURIComponent(
        packageSize,
      )}&weightKg=${encodeURIComponent(
        weightKg,
      )}&pickupTime=${encodeURIComponent(
        pickupTime,
      )}`,
    );
  } catch (error) {
    console.error("Create delivery error:", error);
    alert("Something went wrong while creating your delivery.");
  }
}


  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">Mobility-X</h1>
            <p className="text-sm text-slate-500">
              Move. Deliver. Earn.
            </p>
          </div>

          <a
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Back home
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Send a package
        </p>

        <h2 className="mt-3 text-4xl font-bold tracking-tight">
          Tell us what you need moved.
        </h2>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Enter your pickup and destination details. Mobility-X
          will help find a compatible delivery partner.
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6">
            <div>
              <label className="text-sm font-semibold">
                Pickup location
              </label>

              <input
                type="text"
                placeholder="Where should we pick it up?"
                value={pickup}
                onChange={(event) =>
                  setPickup(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Destination
              </label>

              <input
                type="text"
                placeholder="Where should we deliver it?"
                value={destination}
                onChange={(event) =>
                  setDestination(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Package description
              </label>

              <input
                type="text"
                placeholder="What are you sending?"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Package size
              </label>

              <select
                value={packageSize}
                onChange={(event) =>
                  setPackageSize(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
              >
                <option value="small">
                  Small — up to 5 kg
                </option>

                <option value="medium">
                  Medium — up to 15 kg
                </option>

                <option value="large">
                  Large — up to 30 kg
                </option>
              </select>
            </div>
<div>
  <label className="text-sm font-semibold">
    Preferred pickup time
  </label>

  <input
    type="datetime-local"
    value={pickupTime}
    onChange={(event) => setPickupTime(event.target.value)}
    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
  />

  <p className="mt-2 text-sm text-slate-500">
    When would you like the package picked up?
  </p>
</div>
            <div>
              <label className="text-sm font-semibold">
                Package weight
              </label>

              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 10"
                  value={weightKg}
                  onChange={(event) =>
                    setWeightKg(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                />

                <span className="font-medium text-slate-500">
                  kg
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-2 rounded-xl bg-slate-950 px-6 py-4 font-semibold text-white hover:bg-slate-800"
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}