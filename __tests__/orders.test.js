const {
  computeTotals,
  DELIVERY_FEE,
  formatMoney,
  formatPromoDate,
  normalizePromo,
  PROMO_MESSAGES,
  validatePromo,
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

  const save10 = {code: 'SAVE10', percent: 10, min_order: 0, expires_at: null};
  const food5 = {code: 'FOOD5', percent: 5, min_order: 0, expires_at: null};

  it('applies a promo to the subtotal, rounded', () => {
    expect(computeTotals({subtotal: 525, itemCount: 1, promo: save10}).discount).toBe(53); // 52.5
    expect(computeTotals({subtotal: 520, itemCount: 1, promo: food5}).discount).toBe(26);
    expect(computeTotals({subtotal: 100, itemCount: 1, promo: save10}).promoCode).toBe('SAVE10');
  });

  it('normalizes typed codes to upper case without spaces', () => {
    expect(normalizePromo('  save10 ')).toBe('SAVE10');
    expect(normalizePromo(null)).toBe('');
  });

  it('ignores a promo that does not validate (below minimum or expired)', () => {
    const welcome = {code: 'WELCOME20', percent: 20, min_order: 400, expires_at: null};
    const below = computeTotals({subtotal: 300, itemCount: 1, promo: welcome});
    expect(below.promoCode).toBeNull();
    expect(below.discount).toBe(0);

    const expired = {...save10, expires_at: 1000};
    expect(computeTotals({subtotal: 300, itemCount: 1, promo: expired, now: 2000}).promoCode).toBeNull();
    expect(computeTotals({subtotal: 300, itemCount: 1, promo: null}).promoCode).toBeNull();
  });

  it('never returns a negative total', () => {
    const totals = computeTotals({subtotal: 0.4, itemCount: 1, promo: save10});
    expect(totals.total).toBeGreaterThanOrEqual(0);
  });

  it('formats money without stray decimals', () => {
    expect(formatMoney(120)).toBe('Rs. 120');
    expect(formatMoney(120.5)).toBe('Rs. 120.50');
    expect(formatMoney(undefined)).toBe('Rs. 0');
  });
});

describe('validatePromo', () => {
  const EXPIRES = Date.UTC(2026, 11, 31, 23, 59, 59, 999); // 31 Dec 2026, end of day UTC
  const welcome = {code: 'WELCOME20', percent: 20, min_order: 400, expires_at: EXPIRES};
  const save10 = {code: 'SAVE10', percent: 10, min_order: 0, expires_at: null};
  const NOW = Date.UTC(2026, 8, 21);

  it('says the code was not found when there is no promo row', () => {
    expect(validatePromo(null, 500, NOW)).toEqual({ok: false, message: PROMO_MESSAGES.NOT_FOUND});
    expect(validatePromo(undefined, 500, NOW).message).toBe("We couldn't find that code.");
  });

  it('has a message for empty input', () => {
    expect(PROMO_MESSAGES.EMPTY).toBe('Enter a promo code first.');
  });

  it('accepts a code up to and including its expiry instant, rejects it one ms later', () => {
    expect(validatePromo(welcome, 500, EXPIRES).ok).toBe(true);
    const late = validatePromo(welcome, 500, EXPIRES + 1);
    expect(late).toEqual({ok: false, message: 'WELCOME20 expired on 31 Dec 2026.'});
  });

  it('never expires a code with expires_at NULL', () => {
    expect(validatePromo(save10, 100, Date.UTC(2099, 0, 1)).ok).toBe(true);
  });

  it('tells the user how much more to add for the minimum order', () => {
    expect(validatePromo(welcome, 280, NOW)).toEqual({
      ok: false,
      message: 'Add Rs. 120 more to use WELCOME20.',
    });
    expect(validatePromo(welcome, 399.5, NOW).message).toBe('Add Rs. 0.50 more to use WELCOME20.');
  });

  it('accepts exactly the minimum order', () => {
    expect(validatePromo(welcome, 400, NOW)).toEqual({ok: true, discount: 80});
  });

  it('checks expiry before the minimum order', () => {
    expect(validatePromo(welcome, 10, EXPIRES + 1).message).toMatch(/expired/);
  });

  it('rounds the discount like the old hardcoded codes (half up)', () => {
    expect(validatePromo(save10, 525, NOW)).toEqual({ok: true, discount: 53}); // 52.5
    expect(validatePromo(save10, 524, NOW).discount).toBe(52); // 52.4
    expect(validatePromo({...save10, percent: 5}, 520, NOW).discount).toBe(26);
  });

  it('formats the expiry day in UTC', () => {
    expect(formatPromoDate(EXPIRES)).toBe('31 Dec 2026');
    expect(formatPromoDate(Date.UTC(2027, 0, 1))).toBe('1 Jan 2027');
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
