export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on delivery",
    hint: "Pay the rider when your order arrives.",
  },
  {
    id: "card",
    label: "Card (demo)",
    hint: "Demo only. No card details are collected or stored.",
  },
];

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((method) => method.id);

export const getPaymentMethodLabel = (id) =>
  PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
