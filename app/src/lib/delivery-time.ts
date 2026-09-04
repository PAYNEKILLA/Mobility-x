export type TimeWindow = {
  start: string;
  end: string;
};

export type DeliveryTimePreferences = {
  pickupWindow?: TimeWindow;
  deliveryDeadline?: string;
};

export function isWithinTimeWindow(
  time: string,
  window: TimeWindow,
): boolean {
  const targetTime = new Date(time).getTime();
  const startTime = new Date(window.start).getTime();
  const endTime = new Date(window.end).getTime();

  return (
    targetTime >= startTime &&
    targetTime <= endTime
  );
}

export function isBeforeDeadline(
  time: string,
  deadline: string,
): boolean {
  return (
    new Date(time).getTime() <=
    new Date(deadline).getTime()
  );
}

export function isDeliveryTimingCompatible(
  pickupTime: string,
  arrivalTime: string,
  preferences: DeliveryTimePreferences,
): boolean {
  if (
    preferences.pickupWindow &&
    !isWithinTimeWindow(
      pickupTime,
      preferences.pickupWindow,
    )
  ) {
    return false;
  }

  if (
    preferences.deliveryDeadline &&
    !isBeforeDeadline(
      arrivalTime,
      preferences.deliveryDeadline,
    )
  ) {
    return false;
  }

  return true;
}