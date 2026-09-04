export type EarningsInput = {
  baseFare: number;
  distanceKm: number;
  detourDistanceKm: number;
  packageWeightKg: number;
  urgencyMultiplier?: number;
};

export type EarningsResult = {
  grossEarnings: number;
  platformFee: number;
  partnerEarnings: number;
  currency: "NGN";
};

export function calculateEarnings(
  input: EarningsInput,
): EarningsResult {
  const urgencyMultiplier = input.urgencyMultiplier ?? 1;

  const distancePay = input.distanceKm * 100;

  const detourPay = input.detourDistanceKm * 150;

  const weightPay =
    Math.max(0, input.packageWeightKg - 2) * 50;

  const grossEarnings = Math.round(
    (input.baseFare + distancePay + detourPay + weightPay) *
      urgencyMultiplier,
  );

  const platformFee = Math.round(grossEarnings * 0.15);

  const partnerEarnings = grossEarnings - platformFee;

  return {
    grossEarnings,
    platformFee,
    partnerEarnings,
    currency: "NGN",
  };
}