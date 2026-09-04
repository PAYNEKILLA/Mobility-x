import { getNearbyFeed } from "../../lib/nearby-feed";

type SearchParams = {
  pickup?: string;
  destination?: string;
  packageSize?: string;
  weightKg?: string;
};

const locations: Record<
  string,
  { latitude: number; longitude: number }
> = {
  makurdi: {
    latitude: 7.7322,
    longitude: 8.5391,
  },

  gbajimba: {
    latitude: 7.8167,
    longitude: 8.6167,
  },

  abuja: {
    latitude: 9.0765,
    longitude: 7.3986,
  },
};

const listings = [
  {
    id: "delivery-001",
    origin: "Makurdi",
    destination: "Abuja",
    originCoordinates: {
      latitude: 7.7322,
      longitude: 8.5391,
    },
    estimatedEarnings: 1955,
    currency: "NGN",
    routeScore: 100,
  },

  {
    id: "delivery-002",
    origin: "Gbajimba",
    destination: "Abuja",
    originCoordinates: {
      latitude: 7.8167,
      longitude: 8.6167,
    },
    estimatedEarnings: 2400,
    currency: "NGN",
    routeScore: 100,
  },

  {
    id: "delivery-003",
    origin: "Abuja",
    destination: "Kaduna",
    originCoordinates: {
      latitude: 9.0765,
      longitude: 7.3986,
    },
    estimatedEarnings: 3500,
    currency: "NGN",
    routeScore: 100,
  },
];

export default async function FindCarrierPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const pickup = params.pickup || "Makurdi";
  const destination = params.destination || "Abuja";
  const packageSize = params.packageSize || "medium";
  const weightKg = Number(params.weightKg || 10);

  const pickupCoordinates =
    locations[pickup.toLowerCase()] || locations.makurdi;

  const nearbyFeed = getNearbyFeed(
    pickupCoordinates,
    listings,
    100,
  ).filter(
    (item) =>
      item.destination.toLowerCase() ===
      destination.toLowerCase(),
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-lg font-bold">Mobility-X</p>
            <p className="text-xs text-slate-500">
              Move. Deliver. Earn.
            </p>
          </div>

          <a
            href="/send"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Back to package
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Find a carrier
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
          Best carriers for your delivery
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Mobility-X matched your package with available
          delivery opportunities.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pickup
              </p>
              <p className="mt-1 font-semibold text-slate-950">
                {pickup}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Destination
              </p>
              <p className="mt-1 font-semibold text-slate-950">
                {destination}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Package
              </p>
              <p className="mt-1 font-semibold capitalize text-slate-950">
                {packageSize}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Weight
              </p>
              <p className="mt-1 font-semibold text-slate-950">
                {weightKg} kg
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-950">
              Recommended carriers
            </h2>

            <span className="text-sm text-slate-500">
              {nearbyFeed.length} matches
            </span>
          </div>

          {nearbyFeed.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">
                No matching carriers yet
              </h3>

              <p className="mt-2 text-slate-600">
                Try another pickup or destination and
                Mobility-X will search again.
              </p>

              <a
                href="/send"
                className="mt-6 inline-block rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Change delivery
              </a>
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {nearbyFeed.map((item, index) => (
                <article
                  key={item.id}
                  className={`rounded-3xl border bg-white p-6 shadow-sm sm:p-7 ${
                    index === 0
                      ? "border-slate-950"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {index === 0 && (
                        <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                          BEST MATCH
                        </span>
                      )}

                      <h3 className="mt-3 text-2xl font-bold text-slate-950">
                        {item.origin} → {item.destination}
                      </h3>

                      <p className="mt-2 text-slate-600">
                        Available delivery opportunity
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-100 px-5 py-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Match score
                      </p>

                      <p className="mt-1 text-3xl font-bold text-slate-950">
                        {item.recommendation.score}
                      </p>

                      <p className="text-xs text-slate-500">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pickup distance
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {item.distanceKm} km
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Estimated earnings
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {item.currency}{" "}
                        {item.estimatedEarnings.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recommendation
                      </p>
                      <p className="mt-1 text-lg font-bold">
                        {item.recommendation.recommended
                          ? "Recommended"
                          : "Not recommended"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-950">
                      Why this match?
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.recommendation.reasons.map(
                        (reason) => (
                          <span
                            key={reason}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                          >
                            {reason}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <a
  href={`/confirm-booking?deliveryId=${encodeURIComponent(item.id)}&origin=${encodeURIComponent(item.origin)}&destination=${encodeURIComponent(item.destination)}&earnings=${item.estimatedEarnings}&currency=${encodeURIComponent(item.currency)}&distanceKm=${item.distanceKm}&score=${item.recommendation.score}`}
  className="block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800"
>
  Choose this carrier
</a>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}