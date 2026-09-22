// Simulated order lifecycle. There is no real kitchen or rider, so the status
// is derived from how long ago the order was placed. Because it depends only on
// the stored created_at, it keeps progressing correctly across app restarts.

export const ORDER_STATUS = {
  PLACED: "placed",
  PREPARING: "preparing",
  ON_THE_WAY: "on_the_way",
  DELIVERED: "delivered",
};

// Cumulative time since the order was placed at which each status begins.
const SCHEDULE = [
  { status: ORDER_STATUS.PLACED, startsAtMs: 0 },
  { status: ORDER_STATUS.PREPARING, startsAtMs: 20000 },
  { status: ORDER_STATUS.ON_THE_WAY, startsAtMs: 60000 },
  { status: ORDER_STATUS.DELIVERED, startsAtMs: 120000 },
];

export const DELIVERY_DURATION_MS = SCHEDULE[SCHEDULE.length - 1].startsAtMs;

export const ORDER_STEPS = [
  {
    status: ORDER_STATUS.PLACED,
    label: "Order placed",
    description: "We received your order.",
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: "Preparing",
    description: "The kitchen is cooking your meal.",
  },
  {
    status: ORDER_STATUS.ON_THE_WAY,
    label: "On the way",
    description: "Your rider is heading to you.",
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: "Delivered",
    description: "Enjoy your meal!",
  },
];

/** Position of a status in the lifecycle (unknown values count as the first). */
export const statusIndex = (status) => {
  const index = SCHEDULE.findIndex((step) => step.status === status);
  return index === -1 ? 0 : index;
};

export const isDelivered = (status) => status === ORDER_STATUS.DELIVERED;

export const getStatusLabel = (status) => ORDER_STEPS[statusIndex(status)].label;

/** The status an order should have after `elapsedMs` (never earlier than placed). */
export const statusForElapsed = (elapsedMs) => {
  let current = SCHEDULE[0].status;
  SCHEDULE.forEach((step) => {
    if (elapsedMs >= step.startsAtMs) {
      current = step.status;
    }
  });
  return current;
};

/** Milliseconds until the next status begins, or null when already delivered. */
export const msUntilNextStatus = (order, now = Date.now()) => {
  const next = SCHEDULE[statusIndex(order.status) + 1];
  if (!next) {
    return null;
  }
  return Math.max(order.created_at + next.startsAtMs - now, 0);
};

/** Whole minutes left until delivery (at least 1 while in progress), 0 when delivered. */
export const minutesUntilDelivery = (order, now = Date.now()) => {
  const remaining = order.created_at + DELIVERY_DURATION_MS - now;
  return remaining <= 0 ? 0 : Math.max(1, Math.ceil(remaining / 60000));
};
