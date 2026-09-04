export type RecommendationInput = {
  distanceKm: number;
  routeScore: number;
  earnings: number;
  packageWeightKg: number;
  carrierCapacityKg: number;
  timingCompatible: boolean;
  available: boolean;
};

export type RecommendationResult = {
  score: number;
  recommended: boolean;
  reasons: string[];
};

export function calculateRecommendation(
  input: RecommendationInput,
): RecommendationResult {
  const reasons: string[] = [];

  if (!input.available) {
    return {
      score: 0,
      recommended: false,
      reasons: ["Opportunity is not available"],
    };
  }

  if (input.packageWeightKg > input.carrierCapacityKg) {
    return {
      score: 0,
      recommended: false,
      reasons: ["Package exceeds carrier capacity"],
    };
  }

  let score = 0;

  // Route relevance: up to 40 points
  const routePoints = Math.min(
    Math.max(input.routeScore, 0),
    100,
  ) * 0.4;

  score += routePoints;

  if (input.routeScore >= 80) {
    reasons.push("Strong route match");
  } else if (input.routeScore >= 50) {
    reasons.push("Good route match");
  }

  // Distance: up to 25 points
  const distancePoints = Math.max(
    0,
    25 - input.distanceKm,
  );

  score += distancePoints;

  if (input.distanceKm <= 5) {
    reasons.push("Very close pickup");
  } else if (input.distanceKm <= 20) {
    reasons.push("Nearby pickup");
  }

  // Earnings: up to 20 points
  const earningsPoints = Math.min(
    input.earnings / 250,
    20,
  );

  score += earningsPoints;

  if (input.earnings >= 3000) {
    reasons.push("Strong earning opportunity");
  } else if (input.earnings >= 1500) {
    reasons.push("Good earning opportunity");
  }

  // Timing: 15 points
  if (input.timingCompatible) {
    score += 15;
    reasons.push("Timing compatible");
  } else {
    reasons.push("Timing does not match");
  }

  score = Math.round(score * 100) / 100;

  return {
    score,
    recommended: score >= 60 && input.timingCompatible,
    reasons,
  };
}