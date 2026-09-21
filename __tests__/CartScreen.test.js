import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({useNavigation: jest.fn()}));
jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return ({name}) => require('react').createElement(RNText, null, `icon:${name}`);
});
jest.mock('react-native-toast-message', () => ({__esModule: true, default: {show: jest.fn(), hide: jest.fn()}}));
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/Context/CartContext', () => ({useCart: jest.fn()}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/database/repositories/optionsRepo', () => ({filterCustomizable: jest.fn(() => Promise.resolve([])), listGroupsForItem: jest.fn(() => Promise.resolve([]))}));

const Toast = require('react-native-toast-message').default;
const {useNavigation} = require('@react-navigation/native');
const {useCart} = require('../src/Context/CartContext');
const {useAuth} = require('../src/screens/Auth/AuthContext');
const AddToCartScreen = require('../src/screens/Cart/AddToCartScreen').default;
const FreeDeliveryBar = require('../src/components/FreeDeliveryBar').default;

const line = (id, name, price, quantity) => ({line_key: String(id), menu_item_id: id, name, price, base_price: price, selected_options: '[]', quantity, image_key: 'food1', restaurant_id: 5});
const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');

let cart;
let tree;
const trees = [];
const mount = async () => {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<AddToCartScreen />);
  });
  trees.push(tree);
};
// Stop the skeleton's endless animation loop so Jest can exit.
afterEach(() => {
  trees.splice(0).forEach(t => ReactTestRenderer.act(() => t.unmount()));
});

beforeEach(() => {
  jest.clearAllMocks();
  useNavigation.mockReturnValue({navigate: jest.fn(), goBack: jest.fn()});
  useAuth.mockReturnValue({isLoggedIn: true});
  cart = {
    items: [line(1, 'Burger', 170, 2), line(2, 'Pizza', 180, 1)],
    subtotal: 520,
    promo: null,
    applyPromo: jest.fn(),
    removePromo: jest.fn(),
    reload: jest.fn(() => Promise.resolve()),
    loading: false,
    error: null,
    add: jest.fn(() => Promise.resolve()),
    updateQty: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    getLineQty: key => (key === '1' ? 2 : 1),
  };
  useCart.mockImplementation(() => cart);
});

it('shows the free-delivery progress and updates its wording at the threshold', async () => {
  await mount();
  expect(texts(tree)).toContain('Add Rs. 280 more for free delivery');

  cart = {...cart, subtotal: 800};
  await mount();
  expect(texts(tree)).toContain('Free delivery unlocked');
  expect(texts(tree)).toMatch(/Delivery \| Rs\. 0/);
});

it('each line has a Delete accessibility action and a swipe Delete button', async () => {
  await mount();
  const content = tree.root.findAll(n => n.props.accessibilityActions && n.props.accessibilityActions[0]?.name === 'delete');
  expect(content.length).toBeGreaterThan(0);
  expect(content[0].props.accessibilityLabel).toBe('Burger, 2 in cart, Rs. 170 each');

  await ReactTestRenderer.act(async () => {
    content[0].props.onAccessibilityAction({nativeEvent: {actionName: 'delete'}});
  });
  expect(cart.remove).toHaveBeenCalledWith('1');
});

it('deleting shows an Undo toast; tapping it restores the line with its quantity', async () => {
  await mount();
  const content = tree.root.findAll(n => n.props.accessibilityActions)[0];
  await ReactTestRenderer.act(async () => {
    content.props.onAccessibilityAction({nativeEvent: {actionName: 'delete'}});
  });
  const toast = Toast.show.mock.calls[0][0];
  expect(toast).toMatchObject({text1: 'Burger removed', text2: 'Tap to undo'});

  await ReactTestRenderer.act(async () => toast.onPress());
  expect(cart.add).toHaveBeenCalledWith(
    expect.objectContaining({id: 1, name: 'Burger', price: 170, restaurant_id: 5}),
    {selectedOptions: [], quantity: 2},
  );
});

it('minus at quantity 1 removes the line (with Undo) instead of doing nothing', async () => {
  await mount();
  const minus = [...new Map(tree.root.findAllByProps({accessibilityLabel: 'Decrease quantity'}).filter(n => typeof n.props.onPress === 'function').map(n => [n.props.onPress, n])).values()];
  await ReactTestRenderer.act(async () => minus[1].props.onPress()); // Pizza, quantity 1
  expect(cart.remove).toHaveBeenCalledWith('2');
  await ReactTestRenderer.act(async () => minus[0].props.onPress()); // Burger 2 -> 1
  expect(cart.updateQty).toHaveBeenCalledWith('1', 1);
});

it('shows skeletons while loading and a retry state on error', async () => {
  cart = {...cart, items: [], subtotal: 0, loading: true};
  await mount();
  expect(texts(tree)).not.toContain('Your cart is empty');

  cart = {...cart, loading: false, error: new Error('db')};
  await mount();
  expect(texts(tree)).toContain('Could not load your cart');
});

describe('FreeDeliveryBar', () => {
  it('exposes progress to screen readers', () => {
    let bar;
    ReactTestRenderer.act(() => {
      bar = ReactTestRenderer.create(<FreeDeliveryBar subtotal={400} />);
    });
    expect(bar.root.findByProps({accessibilityRole: 'progressbar'}).props.accessibilityValue).toEqual({min: 0, max: 100, now: 50});
  });
});
