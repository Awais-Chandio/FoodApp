import React from 'react';
import {Alert, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  // Run the focus callback on mount, like opening the screen.
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
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
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/Context/CartContext', () => ({useCart: jest.fn()}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/database/repositories/orderRepo', () => ({
  listOrders: jest.fn(),
  advanceAllDue: jest.fn(),
  getReorderLines: jest.fn(),
}));

const Toast = require('react-native-toast-message').default;
const {useNavigation} = require('@react-navigation/native');
const {useCart} = require('../src/Context/CartContext');
const {useAuth} = require('../src/screens/Auth/AuthContext');
const orderRepo = require('../src/database/repositories/orderRepo');
const OrderHistoryScreen = require('../src/screens/Orders/OrderHistoryScreen').default;

const item = (id, orderId, name, quantity, price = 100) => ({
  id, order_id: orderId, name, quantity, price, menu_item_id: id,
});

const inProgress = {
  id: 21, status: 'preparing', total: 588, created_at: 1700000000000,
  items: [item(1, 21, 'Burger Deluxe', 2, 170), item(2, 21, 'Margherita Pizza', 1, 180)],
};
const delivered = {
  id: 20, status: 'delivered', total: 300, created_at: 1690000000000,
  items: [item(3, 20, 'Chicken Tikka', 1, 300)],
};

const texts = tree =>
  tree.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

// Presses the INNERMOST pressable whose text is `label` (the outer card also
// contains the text, and pressing it would open tracking instead).
const pressButton = (tree, label) => {
  const matches = tree.root.findAll(
    n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t =>
      [t.props.children].flat(Infinity).join('') === label),
  );
  const node = matches[matches.length - 1];
  return ReactTestRenderer.act(async () => node.props.onPress());
};

let tree;
let navigation;
let cart;

const mount = async () => {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<OrderHistoryScreen />);
  });
};

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  Toast.show.mockClear();
  navigation = {navigate: jest.fn(), goBack: jest.fn()};
  useNavigation.mockReturnValue(navigation);
  useAuth.mockReturnValue({user: {id: 7}, isLoggedIn: true});
  cart = {count: 0, replaceAll: jest.fn(() => Promise.resolve())};
  useCart.mockImplementation(() => cart);
  orderRepo.listOrders.mockReset().mockResolvedValue([inProgress, delivered]);
  orderRepo.advanceAllDue.mockReset().mockImplementation(async orders => orders);
  orderRepo.getReorderLines.mockReset();
});

afterEach(() => {
  ReactTestRenderer.act(() => tree && tree.unmount());
  tree = null;
  console.log.mockRestore();
  Alert.alert.mockRestore();
});

it('lists the user\'s orders with status, items and total', async () => {
  await mount();

  expect(orderRepo.listOrders).toHaveBeenCalledWith(7);
  expect(orderRepo.advanceAllDue).toHaveBeenCalledWith([inProgress, delivered]);
  const shown = texts(tree);
  expect(shown).toContain('Order #21');
  expect(shown).toContain('Preparing');
  expect(shown).toContain('2× Burger Deluxe, 1× Margherita Pizza');
  expect(shown).toContain('Rs. 588');
  expect(shown).toContain('Order #20');
  expect(shown).toContain('Delivered');
});

it('offers Track only for orders that are not delivered', async () => {
  await mount();

  const trackButtons = tree.root.findAll(
    n => typeof n.props.onPress === 'function' && n.props.label === 'Track order',
  );
  expect(trackButtons).toHaveLength(1);
});

it('opens tracking when the card or Track is pressed', async () => {
  await mount();

  await pressButton(tree, 'Track order');

  expect(navigation.navigate).toHaveBeenCalledWith('TrackOrder', {orderId: 21});
});

it('shows an empty state with a way to browse when there are no orders', async () => {
  orderRepo.listOrders.mockResolvedValue([]);

  await mount();

  expect(texts(tree)).toContain('No orders yet');
  await pressButton(tree, 'Browse restaurants');
  expect(navigation.navigate).toHaveBeenCalledWith('Tab', {screen: 'HomeStack'});
});

it('shows an error state and retries', async () => {
  orderRepo.listOrders.mockRejectedValueOnce(new Error('db down'));
  await mount();
  expect(texts(tree)).toContain('Could not load your orders');

  await pressButton(tree, 'Try again');

  expect(orderRepo.listOrders).toHaveBeenCalledTimes(2);
  expect(texts(tree)).toContain('Order #21');
});

it('asks guests to sign in and does not query orders', async () => {
  useAuth.mockReturnValue({user: null, isLoggedIn: false});

  await mount();

  expect(texts(tree)).toContain('Sign in to see your orders');
  expect(orderRepo.listOrders).not.toHaveBeenCalled();
  await pressButton(tree, 'Sign in');
  expect(navigation.navigate).toHaveBeenCalledWith('Login');
});

describe('Reorder', () => {
  const lines = [{item: {id: 1, name: 'Burger Deluxe', price: 200, restaurant_id: 1}, quantity: 2}];

  it('fills the cart and opens it when the cart is empty (no confirmation)', async () => {
    orderRepo.getReorderLines.mockResolvedValue({lines, unavailable: 0});
    await mount();

    await pressButton(tree, 'Reorder');

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(orderRepo.getReorderLines).toHaveBeenCalledWith(20, 7); // the last card: order #20
    expect(cart.replaceAll).toHaveBeenCalledWith(lines);
    expect(navigation.navigate).toHaveBeenCalledWith('Tab', {screen: 'AddToCartScreen'});
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({type: 'success'}));
  });

  it('asks before replacing a cart that has items, and does nothing on Cancel', async () => {
    cart.count = 3;
    orderRepo.getReorderLines.mockResolvedValue({lines, unavailable: 0});
    await mount();

    await pressButton(tree, 'Reorder');

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, message, buttons] = Alert.alert.mock.calls[0];
    expect(title).toBe('Replace your cart?');
    expect(message).toContain('3 items');
    expect(cart.replaceAll).not.toHaveBeenCalled();
    expect(buttons.map(b => b.text)).toEqual(['Cancel', 'Replace']);
    // Cancel has no handler: nothing happens.
    expect(buttons[0].onPress).toBeUndefined();
    expect(cart.replaceAll).not.toHaveBeenCalled();
  });

  it('replaces the cart after the user confirms', async () => {
    cart.count = 1;
    orderRepo.getReorderLines.mockResolvedValue({lines, unavailable: 0});
    await mount();
    await pressButton(tree, 'Reorder');

    const replace = Alert.alert.mock.calls[0][2].find(b => b.text === 'Replace');
    await ReactTestRenderer.act(async () => replace.onPress());

    expect(cart.replaceAll).toHaveBeenCalledWith(lines);
    expect(navigation.navigate).toHaveBeenCalledWith('Tab', {screen: 'AddToCartScreen'});
  });

  it('says how many dishes were dropped because they are no longer on the menu', async () => {
    orderRepo.getReorderLines.mockResolvedValue({lines, unavailable: 2});
    await mount();

    await pressButton(tree, 'Reorder');

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({text2: '2 dishes are no longer available.'}),
    );
  });

  it('does not touch the cart when nothing from the order is available', async () => {
    cart.count = 2;
    orderRepo.getReorderLines.mockResolvedValue({lines: [], unavailable: 2});
    await mount();
    await pressButton(tree, 'Reorder');
    const replace = Alert.alert.mock.calls[0][2].find(b => b.text === 'Replace');

    await ReactTestRenderer.act(async () => replace.onPress());

    expect(cart.replaceAll).not.toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({type: 'error'}));
  });

  it('reports a failure without leaving the screen', async () => {
    orderRepo.getReorderLines.mockRejectedValue(new Error('db down'));
    await mount();

    await pressButton(tree, 'Reorder');

    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({text1: 'Could not reorder'}));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
