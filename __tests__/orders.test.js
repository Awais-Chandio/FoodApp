const {
  computeTotals,
  DELIVERY_FEE,
  formatMoney,
  isValidPromo,
  normalizePromo,
} = require('../src/utils/pricing');
const {
  DELIVERY_DURATION_MS,
  getStatusLabel,
  minutesUntilDelivery,
  msUntilNextStatus,
  statusForElapsed,
  statusIndex,
} = require('../src/utils/orderStatus');
const {validateAddress} = require('../src/utils/validation');

describe('pricing', () => {
  it('adds the flat delivery fee to a non-empty cart', () => {
    expect(computeTotals({subtotal: 500, itemCount: 2})).toEqual({
      subtotal: 500,
      deliveryFee: DELIVERY_FEE,
      discount: 0,
      total: 500 + DELIVERY_FEE,
      promoCode: null,
    });
  });

  it('charges no delivery fee for an empty cart', () => {
    const totals = computeTotals({subtotal: 0, itemCount: 0});
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(0);
  });

  it('applies SAVE10 and FOOD5 to the subtotal, rounded', () => {
    expect(computeTotals({subtotal: 525, itemCount: 1, promoCode: 'SAVE10'}).discount).toBe(53); // 52.5
    expect(computeTotals({subtotal: 520, itemCount: 1, promoCode: 'FOOD5'}).discount).toBe(26);
  });

  it('accepts codes in any case and with spaces', () => {
    expect(normalizePromo('  save10 ')).toBe('SAVE10');
    expect(computeTotals({subtotal: 100, itemCount: 1, promoCode: ' save10 '}).promoCode).toBe('SAVE10');
  });

  it('ignores unknown codes, including names from Object.prototype', () => {
    expect(isValidPromo('NOPE')).toBe(false);
    expect(isValidPromo('constructor')).toBe(false);
    expect(isValidPromo(null)).toBe(false);
    const totals = computeTotals({subtotal: 100, itemCount: 1, promoCode: 'NOPE'});
    expect(totals.promoCode).toBeNull();
    expect(totals.discount).toBe(0);
  });

  it('never returns a negative total', () => {
    const totals = computeTotals({subtotal: 0.4, itemCount: 1, promoCode: 'SAVE10'});
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });

  it('formats money without stray decimals', () => {
    expect(formatMoney(120)).toBe('Rs. 120');
    expect(formatMoney(120.5)).toBe('Rs. 120.50');
    expect(formatMoney(undefined)).toBe('Rs. 0');
  });
});

describe('order status schedule (20s / 60s / 120s cumulative)', () => {
  it.each([
    [-5000, 'placed'], // device clock moved back: never before placed
    [0, 'placed'],
    [19999, 'placed'],
    [20000, 'preparing'],
    [59999, 'preparing'],
    [60000, 'on_the_way'],
    [119999, 'on_the_way'],
    [120000, 'delivered'],
    [86400000, 'delivered'],
  ])('%i ms after placing -> %s', (elapsed, expected) => {
    expect(statusForElapsed(elapsed)).toBe(expected);
  });

  it('orders the statuses and treats unknown values as the first', () => {
    expect(['placed', 'preparing', 'on_the_way', 'delivered'].map(statusIndex)).toEqual([0, 1, 2, 3]);
    expect(statusIndex('nonsense')).toBe(0);
    expect(getStatusLabel('on_the_way')).toBe('On the way');
  });

  it('says how long until the next status, and null once delivered', () => {
    const order = {status: 'placed', created_at: 1000};
    expect(msUntilNextStatus(order, 1000)).toBe(20000);
    expect(msUntilNextStatus(order, 11000)).toBe(10000);
    expect(msUntilNextStatus(order, 999999)).toBe(0); // already due
    expect(msUntilNextStatus({status: 'delivered', created_at: 1000}, 5000)).toBeNull();
  });

  it('gives a whole-minute ETA that ends at 0 when delivered', () => {
    const order = {status: 'placed', created_at: 0};
    expect(minutesUntilDelivery(order, 0)).toBe(2);
    expect(minutesUntilDelivery(order, 61000)).toBe(1);
    expect(minutesUntilDelivery(order, DELIVERY_DURATION_MS - 1)).toBe(1);
    expect(minutesUntilDelivery(order, DELIVERY_DURATION_MS)).toBe(0);
  });
});

describe('validateAddress', () => {
  it.each([
    ['', 'required'],
    ['short', 'too short'],
    ['1234567890', 'digits only'],
    ['a'.repeat(201), 'too long'],
  ])('rejects %j (%s)', value => {
    expect(validateAddress(value)).toEqual(expect.any(String));
  });

  it('accepts a real address and trims it first', () => {
    expect(validateAddress('  House 12, Street 4, Clifton  ')).toBeNull();
    expect(validateAddress(null)).toEqual(expect.any(String));
  });
});
