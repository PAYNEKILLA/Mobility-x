
import { prisma } from "../../lib/prisma";
import { calculateMatch } from "../../lib/matching";

type SearchParams = {
  deliveryId?: string;
  pickup?: string;
  destination?: string;
  packageSize?: string;
  weightKg?: string;
  pickupTime?: string;
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

  kaduna: {
    latitude: 10.5105,
    longitude: 7.4165,
  },
};

function getCoordinates(location: string) {
  return (
    locations[location.trim().toLowerCase()] ??
    locations.makurdi
  );
}

function getPackageCategory() {
  return "standard" as const;
}

function estimateEarnings(
  tripDistanceKm: number,
  weightKg: number,
) {
  const base = 1000;
  const distanceComponent = tripDistanceKm * 35;
  const weightComponent = weightKg * 25;

  return Math.round(
    base +
      distanceComponent +
      weightComponent,
  );
}

function distanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(
      (latitude1 * Math.PI) / 180,
    ) *
      Math.cos(
        (latitude2 * Math.PI) / 180,
      ) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusKm * c;
}

function formatDateTime(
  dateString: string,
) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function formatTime(
  dateString: string,
) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      timeStyle: "short",
    },
  ).format(date);
}

function getMatchLabel(
  score: number,
  index: number,
) {
  if (index === 0) {
    return "BEST MATCH";
  }

  if (score >= 80) {
    return "STRONG MATCH";
  }

  return "ALTERNATIVE";
}

export default async function FindCarrierPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const deliveryId = params.deliveryId;

  if (!deliveryId) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
        <section className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Mobility-X
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Delivery not found
          </h1>

          <p className="mt-4 text-slate-600">
            We need a valid delivery before we can find a carrier.
          </p>

          <a
            href="/send"
            className="mt-7 inline-block rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white"
          >
            Create a delivery
          </a>
        </section>
      </main>
    );
  }

  const deliveryRecord =
    await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
      },
      include: {
        package: true,
      },
    });

  if (!deliveryRecord) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
        <section className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Mobility-X
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Delivery not found
          </h1>

          <p className="mt-4 text-slate-600">
            We couldn't find this delivery in the Mobility-X database.
          </p>

          <a
            href="/send"
            className="mt-7 inline-block rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white"
          >
            Back to package
          </a>
        </section>
      </main>
    );
  }

  const pickup = deliveryRecord.pickupAddress;
  const destination =
    deliveryRecord.destinationAddress;

  const packageSize =
    deliveryRecord.option;

  const weightKg =
    deliveryRecord.package.weightKg;

  const pickupTime =
    deliveryRecord.requestedPickupTime
      ? deliveryRecord.requestedPickupTime.toISOString()
      : "";

  const pickupCoordinates = {
    latitude:
      deliveryRecord.pickupLatitude,
    longitude:
      deliveryRecord.pickupLongitude,
  };

  const destinationCoordinates = {
    latitude:
      deliveryRecord.destinationLatitude,
    longitude:
      deliveryRecord.destinationLongitude,
  };

  /*
   * The database package category is currently represented
   * separately from package size. Our current carrier trips
   * accept "standard", so use the standard category for this
   * matching phase.
   */
  const packageCategory =
    "standard" as const;

  const tripRecords = await prisma.trip.findMany({
    where: {
      status: "published",
    },
    include: {
      vehicle: true,
    },
  });

  const matches = tripRecords
    .map((tripRecord) => {
      const trip = {
        id: tripRecord.id,

        partnerId: tripRecord.partnerId,

        vehicleId: tripRecord.vehicleId,

        origin: {
          address: tripRecord.originAddress,
          coordinates: {
            latitude: tripRecord.originLatitude,
            longitude: tripRecord.originLongitude,
          },
        },

        destination: {
          address: tripRecord.destinationAddress,
          coordinates: {
            latitude: tripRecord.destinationLatitude,
            longitude: tripRecord.destinationLongitude,
          },
        },

        departureTime:
          tripRecord.departureTime.toISOString(),

        estimatedArrivalTime:
          tripRecord.estimatedArrivalTime
            ? tripRecord.estimatedArrivalTime.toISOString()
            : undefined,

        availablePackageCount:
          tripRecord.availablePackageCount,

        availableWeightKg:
          tripRecord.availableWeightKg,

     acceptedCategories:
  tripRecord.acceptedCategories
    .split(",")
    .map(
      (category) =>
        category.trim() as
          | "standard"
          | "fragile"
          | "high_value"
          | "temperature_sensitive"
          | "restricted",
    )
    .filter(Boolean),

        status: "published" as const,
      };

      const vehicle = {
        id: tripRecord.vehicle.id,

        ownerId: tripRecord.vehicle.ownerId,

        type:
          tripRecord.vehicle.type as
            | "motorcycle"
            | "car"
            | "van"
            | "truck",

        make:
          tripRecord.vehicle.make ??
          undefined,

        model:
          tripRecord.vehicle.model ??
          undefined,

        registrationNumber:
          tripRecord.vehicle.registrationNumber ??
          undefined,

        maxWeightKg:
          tripRecord.vehicle.maxWeightKg,

        maxPackageCount:
          tripRecord.vehicle.maxPackageCount,

        verificationStatus:
          tripRecord.vehicle.verificationStatus as
            | "pending"
            | "verified"
            | "rejected"
            | "expired",
      };

      const delivery = {
        id: deliveryRecord.id,

        customerId:
          deliveryRecord.customerId,

        packageId:
          deliveryRecord.packageId,

        requestedPickupTime:
          pickupTime,

        pickup: {
          address: pickup,

          coordinates:
            pickupCoordinates,
        },

        destination: {
          address: destination,

          coordinates:
            destinationCoordinates,
        },

        option:
          "standard" as const,

        status:
          "matching" as const,

        paymentStatus:
          "pending" as const,

        currency:
          deliveryRecord.currency,

        createdAt:
          deliveryRecord.createdAt.toISOString(),
      };

      const packageData = {
        id: deliveryRecord.package.id,

        category:
          packageCategory,

        weightKg:
          deliveryRecord.package.weightKg,

        lengthCm:
          deliveryRecord.package.lengthCm,

        widthCm:
          deliveryRecord.package.widthCm,

        heightCm:
          deliveryRecord.package.heightCm,
      };

      const result = calculateMatch({
        trip,
        delivery,
        package: packageData,
        vehicle,
      });

      const tripDistanceKm =
        distanceKm(
          trip.origin.coordinates.latitude,
          trip.origin.coordinates.longitude,
          trip.destination.coordinates.latitude,
          trip.destination.coordinates.longitude,
        );

      const estimatedEarnings =
        estimateEarnings(
          tripDistanceKm,
          weightKg,
        );

      return {
        trip,
        vehicle,
        result,
        estimatedEarnings,
        tripDistanceKm,
      };
    })
    .filter(
      (
        match,
      ): match is NonNullable<
        typeof match
      > =>
        match !== null &&
        match.result.eligible,
    )
    .sort(
      (first, second) =>
        second.result.compatibilityScore -
        first.result.compatibilityScore,
    );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-lg font-bold">
              Mobility-X
            </p>

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

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Carrier Matching
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Best carriers for your delivery
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Mobility-X evaluated available trips,
            route compatibility, pickup timing,
            vehicle capacity, package requirements,
            and detour distance.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Delivery request
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xl font-bold">
              <span>{pickup}</span>

              <span
                aria-hidden="true"
                className="text-slate-400"
              >
                ?
              </span>

              <span>{destination}</span>
            </div>
          </div>

          <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Package
              </p>

              <p className="mt-1 font-semibold capitalize">
                {packageSize}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {weightKg} kg
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pickup time
              </p>

              <p className="mt-1 font-semibold">
                {pickupTime
                  ? formatDateTime(pickupTime)
                  : "Flexible"}
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Package category
              </p>

              <p className="mt-1 font-semibold capitalize">
                {packageCategory.replace(
                  "_",
                  " ",
                )}
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Matching status
              </p>

              <p className="mt-1 font-semibold">
                {matches.length > 0
                  ? "Matches available"
                  : "Searching alternatives"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Recommended carriers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ranked by route, timing, detour,
                and vehicle compatibility.
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {matches.length} eligible{" "}
              {matches.length === 1
                ? "match"
                : "matches"}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                  No eligible match
                </span>

                <h3 className="mt-4 text-2xl font-bold">
                  We couldn't find a carrier
                  that meets the current
                  requirements.
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  The available trips may not
                  currently match your route,
                  pickup time, package weight,
                  or vehicle capacity.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">
                      Try another pickup time
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      A more flexible time can
                      increase carrier availability.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold">
                      Review package details
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Check the package weight
                      and size requirements.
                    </p>
                  </div>
                </div>

                <a
                  href="/send"
                  className="mt-7 inline-block rounded-xl bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Change delivery
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              {matches.map(
                (
                  {
                    trip,
                    vehicle,
                    result,
                    estimatedEarnings,
        tripDistanceKm,
                  },
                  index,
                ) => (
                  <article
                    key={trip.id}
                    className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                      index === 0
                        ? "border-slate-950"
                        : "border-slate-200"
                    }`}
                  >
                    {index === 0 && (
                      <div className="bg-slate-950 px-6 py-2.5 text-center text-xs font-bold tracking-[0.15em] text-white">
                        RECOMMENDED FOR YOUR DELIVERY
                      </div>
                    )}

                    <div className="p-6 sm:p-7">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                              {getMatchLabel(
                                result.compatibilityScore,
                                index,
                              )}
                            </span>

                            {vehicle.verificationStatus ===
                              "verified" && (
                              <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                                Verified vehicle
                              </span>
                            )}
                          </div>

                          <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
                            {trip.origin.address}

                            <span
                              aria-hidden="true"
                              className="mx-2 text-slate-400"
                            >
                              ?
                            </span>

                            {trip.destination.address}
                          </h3>

                          <p className="mt-2 text-slate-600">
                            {vehicle.make}{" "}
                            {vehicle.model}{" "}
                            <span className="text-slate-400">
                              ·
                            </span>{" "}
                            <span className="capitalize">
                              {vehicle.type}
                            </span>
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-100 px-6 py-5 text-center lg:min-w-[150px]">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Match score
                          </p>

                          <p className="mt-1 text-4xl font-bold">
                            {
                              result.compatibilityScore
                            }
                            <span className="text-lg text-slate-400">
                              /100
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Compatibility
                          </p>
                        </div>
                      </div>

                      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Route
                          </p>

                          <p className="mt-2 text-lg font-bold capitalize">
                            {
                              result.explanation
                                .route
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {result.routeCompatibility}
                            /100 compatible
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Pickup timing
                          </p>

                          <p className="mt-2 text-lg font-bold capitalize">
                            {
                              result.explanation
                                .time
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {result.timeCompatibility}
                            /100 compatible
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Detour
                          </p>

                          <p className="mt-2 text-lg font-bold">
                            {
                              result.detourDistanceKm
                            }{" "}
                            km
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            ~
                            {
                              result.estimatedExtraMinutes
                            }{" "}
                            extra min
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Earnings
                          </p>

                          <p className="mt-2 text-lg font-bold">
                            NGN{" "}
                            {estimatedEarnings.toLocaleString()}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Estimated carrier earnings
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Trip schedule
                          </p>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-sm text-slate-500">
                                Departure
                              </p>

                              <p className="mt-1 font-semibold">
                                {formatDateTime(
                                  trip.departureTime,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">
                                Estimated arrival
                              </p>

                              <p className="mt-1 font-semibold">
                                {trip.estimatedArrivalTime
                                  ? formatDateTime(
                                      trip.estimatedArrivalTime,
                                    )
                                  : "Not specified"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Vehicle capacity
                          </p>

                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-sm text-slate-500">
                                Weight capacity
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  vehicle.maxWeightKg
                                }{" "}
                                kg
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-slate-500">
                                Package capacity
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  vehicle.maxPackageCount
                                }{" "}
                                packages
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-sm font-semibold">
                          Why this match?
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">
                            {
                              result.explanation
                                .route
                            }{" "}
                            route
                          </span>

                          <span className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">
                            {
                              result.explanation
                                .time
                            }{" "}
                            timing
                          </span>

                          {result.explanation
                            .capacity ===
                            "available" && (
                            <span className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">
                              Capacity available
                            </span>
                          )}

                          {result.explanation
                            .vehicle ===
                            "compatible" && (
                            <span className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600">
                              Vehicle compatible
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                  href={`/confirm-booking?deliveryId=${encodeURIComponent(
  deliveryId,
)}&tripId=${encodeURIComponent(
                          trip.id,
                        )}&partnerId=${encodeURIComponent(
                          trip.partnerId,
                        )}&vehicleId=${encodeURIComponent(
                          vehicle.id,
                        )}&origin=${encodeURIComponent(
                          trip.origin.address,
                        )}&destination=${encodeURIComponent(
                          trip.destination.address,
                        )}&earnings=${estimatedEarnings}&currency=NGN&distanceKm=${tripDistanceKm}&score=${result.compatibilityScore}`}
                        className="mt-7 block w-full rounded-xl bg-slate-950 px-6 py-4 text-center font-semibold text-white hover:bg-slate-800"
                      >
                        Choose this carrier
                      </a>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

