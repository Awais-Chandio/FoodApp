import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));
jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return () => require('react').createElement(RNText, null, 'icon');
});
jest.mock('react-native-toast-message', () => ({__esModule: true, default: {show: jest.fn()}}));
jest.mock('../src/database/repositories/reviewRepo', () => ({
  listTargets: jest.fn(() => Promise.resolve([])),
  listForRestaurant: jest.fn(() => Promise.resolve({rating: null, reviewCount: 0, reviews: []})),
}));
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/database/repositories/orderRepo', () => ({
  getOrderForUser: jest.fn(),
  advanceIfDue: jest.fn(),
}));

const {useNavigation, useRoute} = require('@react-navigation/native');
const {useAuth} = require('../src/screens/Auth/AuthContext');
const orderRepo = require('../src/database/repositories/orderRepo');
const TrackOrderScreen = require('../src/screens/Cart/TrackOrderScreen').default;
const OrderStatusStepper = require('../src/components/OrderStatusStepper').default;

const makeOrder = (overrides = {}) => ({
  id: 12,
  user_id: 7,
  status: 'placed',
  total: 588,
  delivery_fee: 120,
  discount: 52,
  promo_code: 'SAVE10',
  address: 'House 12, Street 4, Clifton, Karachi',
  payment_method: 'cod',
  created_at: Date.now(),
  updated_at: Date.now(),
  items: [
    {id: 1, order_id: 12, name: 'Burger Deluxe', price: 170, quantity: 2},
    {id: 2, order_id: 12, name: 'Margherita Pizza', price: 180, quantity: 1},
  ],
  ...overrides,
});

// One entry per <Text>, with JSX fragments such as "Order #" + 12 joined together.
const texts = tree =>
  tree.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

const labelled = (tree, label) =>
  tree.root.findAll(node => node.props.accessibilityLabel === label).length > 0;

let tree;
const mount = async () => {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<TrackOrderScreen />);
  });
};

let navigation;

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  navigation = {goBack: jest.fn(), canGoBack: jest.fn(() => true), reset: jest.fn()};
  useNavigation.mockReturnValue(navigation);
  useRoute.mockReturnValue({params: {orderId: 12}});
  useAuth.mockReturnValue({user: {id: 7}});
  orderRepo.getOrderForUser.mockReset();
  orderRepo.advanceIfDue.mockReset();
  orderRepo.advanceIfDue.mockImplementation(async order => order);
});

afterEach(() => {
  ReactTestRenderer.act(() => tree && tree.unmount());
  tree = null;
  jest.useRealTimers();
  console.log.mockRestore();
});

describe('TrackOrderScreen', () => {
  it('shows the real order: items, totals, address and payment', async () => {
    orderRepo.getOrderForUser.mockResolvedValue(makeOrder());

    await mount();

    expect(orderRepo.getOrderForUser).toHaveBeenCalledWith(12, 7);
    const shown = texts(tree);
    expect(shown).toContain('Order #12');
    expect(shown).toContain('2 × Burger Deluxe');
    expect(shown).toContain('Rs. 340'); // 170 x 2
    expect(shown).toContain('Rs. 520'); // subtotal = 588 - 120 + 52
    expect(shown).toContain('Discount (SAVE10)');
    expect(shown).toContain('Rs. 588');
    expect(shown).toContain('House 12, Street 4, Clifton, Karachi');
    expect(shown).toContain('Cash on delivery');
    expect(shown).toContain('2 min'); // fresh order: 120s left
  });

  it('no longer shows the fake driver or the fixed 20 min ETA', async () => {
    orderRepo.getOrderForUser.mockResolvedValue(makeOrder());

    await mount();

    const shown = texts(tree);
    expect(shown).not.toContain('George William');
    expect(shown).not.toContain('Delivery partner');
    expect(shown).not.toContain('20 min');
  });

  it('reads the order id from a push notification payload too', async () => {
    useRoute.mockReturnValue({params: {notification: {orderId: '12'}}});
    orderRepo.getOrderForUser.mockResolvedValue(makeOrder());

    await mount();

    expect(orderRepo.getOrderForUser).toHaveBeenCalledWith(12, 7);
  });

  it.each([
    ['no order id', {}, {id: 7}],
    ['a non-numeric id', {orderId: 'abc'}, {id: 7}],
    ['a guest (no user)', {orderId: 12}, null],
  ])('shows "Order not found" for %s without querying', async (_name, params, user) => {
    useRoute.mockReturnValue({params});
    useAuth.mockReturnValue({user});

    await mount();

    expect(texts(tree)).toContain('Order not found');
    expect(orderRepo.getOrderForUser).not.toHaveBeenCalled();
  });

  it('shows "Order not found" for an order that is not the user\'s', async () => {
    orderRepo.getOrderForUser.mockResolvedValue(null);

    await mount();

    expect(texts(tree)).toContain('Order not found');
  });

  it('shows an error state with Try again when loading fails', async () => {
    orderRepo.getOrderForUser.mockRejectedValue(new Error('db down'));

    await mount();

    expect(texts(tree)).toContain('Could not load your order');
    expect(texts(tree)).toContain('Try again');
  });

  it('advances to the next status by itself when it becomes due', async () => {
    const order = makeOrder();
    orderRepo.getOrderForUser.mockResolvedValue(order);
    await mount();
    expect(labelled(tree, 'Order placed, in progress')).toBe(true);

    orderRepo.advanceIfDue.mockImplementation(async o => ({...o, status: 'preparing'}));
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(20100); // 20s + margin
    });

    expect(labelled(tree, 'Order placed, completed')).toBe(true);
    expect(labelled(tree, 'Preparing, in progress')).toBe(true);
  });

  it('shows a delivered order as finished, with no ETA countdown', async () => {
    orderRepo.getOrderForUser.mockResolvedValue(makeOrder({status: 'delivered', created_at: Date.now() - 200000}));

    await mount();

    const shown = texts(tree);
    expect(shown).toContain('Delivered');
    expect(labelled(tree, 'Delivered, completed')).toBe(true);
    expect(shown).not.toContain('Estimated arrival');
  });

  it('back goes back, or resets to Tab when there is nothing behind it', async () => {
    orderRepo.getOrderForUser.mockResolvedValue(makeOrder());
    await mount();
    const back = () =>
      tree.root.findAll(node => node.props.accessibilityLabel === 'Go back' && node.props.onPress)[0];

    ReactTestRenderer.act(() => back().props.onPress());
    expect(navigation.goBack).toHaveBeenCalled();

    navigation.canGoBack.mockReturnValue(false);
    ReactTestRenderer.act(() => back().props.onPress());
    expect(navigation.reset).toHaveBeenCalledWith({index: 0, routes: [{name: 'Tab'}]});
  });
});

describe('OrderStatusStepper', () => {
  const render = status => {
    let renderer;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<OrderStatusStepper status={status} />);
    });
    return renderer;
  };

  it.each([
    ['placed', ['in progress', 'upcoming', 'upcoming', 'upcoming']],
    ['preparing', ['completed', 'in progress', 'upcoming', 'upcoming']],
    ['on_the_way', ['completed', 'completed', 'in progress', 'upcoming']],
    ['delivered', ['completed', 'completed', 'completed', 'completed']],
  ])('%s -> step states %j', (status, states) => {
    const stepper = render(status);
    const names = ['Order placed', 'Preparing', 'On the way', 'Delivered'];
    names.forEach((name, i) => {
      expect(labelled(stepper, `${name}, ${states[i]}`)).toBe(true);
    });
    ReactTestRenderer.act(() => stepper.unmount());
  });
});
