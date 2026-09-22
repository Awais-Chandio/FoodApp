import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return ({name}) => require('react').createElement(RNText, null, `icon:${name}`);
});
jest.mock('react-native-toast-message', () => ({__esModule: true, default: {show: jest.fn()}}));
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/Context/CartContext', () => ({useCart: jest.fn()}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/database/repositories/menuRepo', () => ({listByRestaurant: jest.fn(), remove: jest.fn()}));
jest.mock('../src/database/repositories/optionsRepo', () => ({
  listCustomizableIds: jest.fn(),
  listGroupsForItem: jest.fn(),
}));

const {useNavigation, useRoute} = require('@react-navigation/native');
const {useCart} = require('../src/Context/CartContext');
const {useAuth} = require('../src/screens/Auth/AuthContext');
const menuRepo = require('../src/database/repositories/menuRepo');
const optionsRepo = require('../src/database/repositories/optionsRepo');
const MenuScreen = require('../src/screens/Menu/MenuScreen').default;
const {HEADER_HEIGHT, ROW_HEIGHT} = require('../src/utils/menuLayout');

const dish = (id, name, category, price, isVeg, spice, description = `About ${name}`) => ({
  id, name, category, price, is_veg: isVeg, spice_level: spice, description, image_key: 'food1', restaurant_id: 5,
});
const MENU = [
  dish(1, 'Wings', 'Starters', 240, 0, 3),
  dish(2, 'Burger', 'Mains', 170, 0, 1),
  dish(3, 'Veggie Pizza', 'Mains', 150, 1, 0),
  dish(4, 'Brownie', 'Desserts', 110, 1, 0),
];

const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');
let tree;
const mount = async () => {
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<MenuScreen />);
  });
};
const press = label =>
  ReactTestRenderer.act(() =>
    tree.root
      .findAll(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => [t.props.children].flat().join('') === label))[0]
      .props.onPress(),
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  useNavigation.mockReturnValue({navigate: jest.fn(), goBack: jest.fn()});
  useRoute.mockReturnValue({params: {restaurant: {id: 5, name: 'Fortune'}}});
  useAuth.mockReturnValue({role: 'user'});
  useCart.mockReturnValue({count: 0, subtotal: 0, getQty: () => 0, add: jest.fn(), updateQty: jest.fn()});
  menuRepo.listByRestaurant.mockResolvedValue(MENU);
  optionsRepo.listCustomizableIds.mockResolvedValue([]);
  optionsRepo.listGroupsForItem.mockResolvedValue([]);
});
afterEach(() => console.log.mockRestore());

it('shows sticky category tabs, section headers, descriptions and tags', async () => {
  await mount();
  const out = texts(tree);
  ['Starters', 'Mains', 'Desserts'].forEach(c => expect(out).toContain(c));
  expect(out).toContain('2 dishes'); // Mains
  expect(out).toContain('About Wings');
  expect(out).not.toContain('Freshly prepared and balanced');
  expect(tree.root.findAllByProps({accessibilityLabel: 'Vegetarian'}).length).toBeGreaterThan(0);
  expect(tree.root.findAllByProps({accessibilityLabel: 'Spice level 3 of 3'}).length).toBeGreaterThan(0);
  expect(tree.root.findAllByProps({accessibilityLabel: 'Non-vegetarian'}).length).toBeGreaterThan(0);
});

it('tapping a tab scrolls to that section and highlights it', async () => {
  await mount();
  const list = tree.root.findByProps({scrollEventThrottle: 32});
  const scrollToOffset = jest.fn();
  list.instance.scrollToOffset = scrollToOffset;

  await press('Desserts');

  // Starters (1 dish) + Mains (2 dishes) come before Desserts
  const expected = HEADER_HEIGHT + ROW_HEIGHT + (HEADER_HEIGHT + 2 * ROW_HEIGHT);
  expect(scrollToOffset).toHaveBeenCalledWith({offset: expected, animated: true});
  const tab = tree.root.findAll(n => n.props.accessibilityRole === 'button' && n.props.accessibilityState && n.findAllByType(Text).some(t => t.props.children === 'Desserts'))[0];
  expect(tab.props.accessibilityState).toEqual({selected: true});
});

it('scrolling updates the active tab', async () => {
  await mount();
  const list = tree.root.findByProps({scrollEventThrottle: 32});
  await ReactTestRenderer.act(async () => {
    list.props.onScroll({nativeEvent: {contentOffset: {y: HEADER_HEIGHT + ROW_HEIGHT + 20}}});
  });
  const selected = tree.root.findAll(n => n.props.accessibilityState && n.props.accessibilityState.selected && n.props.accessibilityRole === 'button');
  expect(selected.some(n => n.findAllByType(Text).some(t => t.props.children === 'Mains'))).toBe(true);
});

it('Veg only hides non-vegetarian dishes', async () => {
  await mount();
  await press('Veg only');
  const out = texts(tree);
  expect(out).toContain('Veggie Pizza');
  expect(out).not.toContain('Burger');
  expect(out).not.toContain('Wings');
});

it('shows skeletons while loading, a retry state on error, and an empty state', async () => {
  let resolve;
  menuRepo.listByRestaurant.mockReturnValueOnce(new Promise(r => (resolve = r)));
  await mount();
  expect(texts(tree)).not.toContain('No menu items yet');
  await ReactTestRenderer.act(async () => resolve([]));
  expect(texts(tree)).toContain('No menu items yet');

  menuRepo.listByRestaurant.mockRejectedValueOnce(new Error('db'));
  await mount();
  expect(texts(tree)).toContain('Could not load the menu');
  menuRepo.listByRestaurant.mockResolvedValueOnce(MENU);
  await press('Try again');
  expect(texts(tree)).toContain('Wings');
});

describe('customizable dishes', () => {
  const GROUPS = [{id: 1, menu_item_id: 2, name: 'Size', type: 'single', required: true, max_select: 1, options: [
    {id: 11, name: 'Regular', price_delta: 0, is_default: true},
    {id: 12, name: 'Large', price_delta: 60, is_default: false},
  ]}];
  let cart;

  beforeEach(() => {
    cart = {count: 0, subtotal: 0, getQty: jest.fn(() => 0), add: jest.fn(() => Promise.resolve()), updateQty: jest.fn()};
    useCart.mockReturnValue(cart);
    optionsRepo.listCustomizableIds.mockResolvedValue([2]); // only the Burger
    optionsRepo.listGroupsForItem.mockResolvedValue(GROUPS);
  });

  it('"+" on a dish with options opens the sheet instead of adding; a plain dish adds at once', async () => {
    await mount();

    await ReactTestRenderer.act(async () =>
      tree.root.findAll(n => n.props.accessibilityLabel === 'Add Wings to cart' && typeof n.props.onPress === 'function')[0].props.onPress(),
    );
    expect(cart.add).toHaveBeenCalledTimes(1);
    expect(cart.add.mock.calls[0][0]).toMatchObject({name: 'Wings'});

    cart.add.mockClear();
    await ReactTestRenderer.act(async () =>
      tree.root.findAll(n => n.props.accessibilityLabel === 'Customize Burger' && typeof n.props.onPress === 'function')[0].props.onPress(),
    );
    await ReactTestRenderer.act(async () => { await new Promise(r => setTimeout(r, 0)); });
    expect(cart.add).not.toHaveBeenCalled();
    expect(texts(tree)).toContain('Add to cart · Rs. 170');
  });

  it('submitting the sheet adds the dish with its options and quantity', async () => {
    await mount();
    await ReactTestRenderer.act(async () =>
      tree.root.findAll(n => n.props.accessibilityLabel === 'Customize Burger' && typeof n.props.onPress === 'function')[0].props.onPress(),
    );
    await ReactTestRenderer.act(async () => { await new Promise(r => setTimeout(r, 0)); });
    ReactTestRenderer.act(() =>
      tree.root.find(n => n.props.accessibilityLabel === 'Large, +Rs. 60' && typeof n.props.onPress === 'function').props.onPress(),
    );
    await ReactTestRenderer.act(async () =>
      tree.root.find(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => [t.props.children].flat().join('') === 'Add to cart · Rs. 230')).props.onPress(),
    );

    expect(cart.add).toHaveBeenCalledTimes(1);
    const [item, {selectedOptions, quantity}] = cart.add.mock.calls[0];
    expect(item).toMatchObject({name: 'Burger', price: 170});
    expect(quantity).toBe(1);
    expect(selectedOptions.map(o => o.name)).toEqual(['Large']);
  });

  it('a customizable dish already in the cart still opens the sheet and shows a count instead of a stepper', async () => {
    cart.getQty.mockImplementation(id => (id === 2 ? 3 : 0));
    await mount();
    expect(tree.root.findAllByProps({accessibilityLabel: 'Customize Burger, 3 in cart'}).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({accessibilityLabel: 'Increase quantity'}).length).toBe(0);
  });
});
