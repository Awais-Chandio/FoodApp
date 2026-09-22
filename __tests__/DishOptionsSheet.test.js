import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return ({name}) => require('react').createElement(RNText, null, `icon:${name}`);
});
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/database/repositories/optionsRepo', () => ({listGroupsForItem: jest.fn()}));

const optionsRepo = require('../src/database/repositories/optionsRepo');
const DishOptionsSheet = require('../src/components/DishOptionsSheet').default;

const GROUPS = [
  {id: 1, menu_item_id: 3, name: 'Size', type: 'single', required: true, max_select: 1, options: [
    {id: 10, name: 'Small', price_delta: -30, is_default: false},
    {id: 11, name: 'Regular', price_delta: 0, is_default: true},
    {id: 12, name: 'Large', price_delta: 60, is_default: false},
  ]},
  {id: 2, menu_item_id: 3, name: 'Add-ons', type: 'multi', required: false, max_select: 2, options: [
    {id: 20, name: 'Extra cheese', price_delta: 30, is_default: false},
    {id: 21, name: 'Extra sauce', price_delta: 20, is_default: false},
    {id: 22, name: 'Side salad', price_delta: 40, is_default: false},
  ]},
];
const ITEM = {id: 3, name: 'Burger Deluxe', price: 170, image_key: 'food2', description: 'Double patty'};

const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');
const flush = () => ReactTestRenderer.act(async () => { await new Promise(r => setTimeout(r, 0)); });

let tree;
const trees = [];
const mount = async props => {
  const onSubmit = jest.fn();
  const onClose = jest.fn();
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<DishOptionsSheet visible item={ITEM} onSubmit={onSubmit} onClose={onClose} {...props} />);
  });
  trees.push(tree);
  await flush();
  return {onSubmit, onClose};
};
const option = name => tree.root.find(n => n.props.accessibilityState && n.props.accessibilityLabel && n.props.accessibilityLabel.startsWith(name) && typeof n.props.onPress === 'function');
const tap = target => ReactTestRenderer.act(() => target.props.onPress());
const button = () => tree.root.find(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => /^(Add to cart|Update) ·/.test([t.props.children].flat().join(''))));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  optionsRepo.listGroupsForItem.mockResolvedValue(GROUPS);
});
afterEach(() => {
  console.log.mockRestore();
  trees.splice(0).forEach(t => ReactTestRenderer.act(() => t.unmount()));
});

it('shows the dish, its groups, and preselects the default size so the sheet is valid at once', async () => {
  await mount();
  const out = texts(tree);
  ['Burger Deluxe', 'Double patty', 'Size', 'Required · choose 1', 'Add-ons', 'Optional · up to 2', 'Regular', 'Extra cheese'].forEach(p => expect(out).toContain(p));
  expect(option('Regular').props.accessibilityState.checked).toBe(true);
  expect(option('Large').props.accessibilityState.checked).toBe(false);
  expect(out).toContain('Add to cart · Rs. 170');
});

it('the total updates live as size, add-ons and quantity change', async () => {
  await mount();
  tap(option('Large'));
  expect(texts(tree)).toContain('Add to cart · Rs. 230');
  tap(option('Extra cheese'));
  expect(texts(tree)).toContain('Add to cart · Rs. 260');
  tap(option('Small')); // swaps the size: 170 - 30 + 30
  expect(texts(tree)).toContain('Add to cart · Rs. 170');
  ReactTestRenderer.act(() => tree.root.findAllByProps({accessibilityLabel: 'Increase quantity'}).find(n => n.props.onPress).props.onPress());
  expect(texts(tree)).toContain('Add to cart · Rs. 340');
});

it('single choices are radios that swap; multi choices are checkboxes capped at max_select', async () => {
  await mount();
  expect(option('Small').props.accessibilityRole).toBe('radio');
  expect(option('Extra cheese').props.accessibilityRole).toBe('checkbox');
  tap(option('Extra cheese'));
  tap(option('Extra sauce'));
  expect(option('Side salad').props.accessibilityState.disabled).toBe(true); // limit of 2 reached
  tap(option('Side salad'));
  expect(option('Side salad').props.accessibilityState.checked).toBe(false);
  tap(option('Extra cheese')); // frees a slot
  expect(option('Side salad').props.accessibilityState.disabled).toBe(false);
});

it('quantity never goes below 1', async () => {
  await mount();
  const minus = tree.root.findAllByProps({accessibilityLabel: 'Decrease quantity'}).find(n => n.props.onPress);
  ReactTestRenderer.act(() => minus.props.onPress());
  expect(texts(tree)).toContain('Add to cart · Rs. 170');
});

it('submits the chosen options and quantity', async () => {
  const {onSubmit} = await mount();
  tap(option('Large'));
  tap(option('Extra sauce'));
  ReactTestRenderer.act(() => tree.root.findAllByProps({accessibilityLabel: 'Increase quantity'}).find(n => n.props.onPress).props.onPress());
  ReactTestRenderer.act(() => button().props.onPress());

  const {selectedOptions, quantity} = onSubmit.mock.calls[0][0];
  expect(quantity).toBe(2);
  expect(selectedOptions.map(o => [o.name, o.group_name, o.price_delta])).toEqual([
    ['Large', 'Size', 60], ['Extra sauce', 'Add-ons', 20],
  ]);
});

it('edit mode is prefilled from the line, says Update, and drops options that no longer exist', async () => {
  const saved = [
    {id: 12, name: 'Large', price_delta: 60, group_id: 1, group_name: 'Size'},
    {id: 99, name: 'Gone', price_delta: 10, group_id: 2, group_name: 'Add-ons'},
  ];
  await mount({mode: 'edit', initialOptions: saved, initialQuantity: 3});
  expect(option('Large').props.accessibilityState.checked).toBe(true);
  expect(texts(tree)).toContain('Update · Rs. 690'); // (170 + 60) * 3
});

it('shows an error when the options fail to load, and the add button is disabled', async () => {
  optionsRepo.listGroupsForItem.mockRejectedValueOnce(new Error('db'));
  await mount();
  expect(texts(tree)).toContain('Could not load the options.');
  expect(button().props.disabled).toBe(true);
});

it('a dish without options still opens with just quantity and the base price', async () => {
  optionsRepo.listGroupsForItem.mockResolvedValue([]);
  const {onSubmit} = await mount();
  expect(texts(tree)).toContain('Add to cart · Rs. 170');
  ReactTestRenderer.act(() => button().props.onPress());
  expect(onSubmit).toHaveBeenCalledWith({selectedOptions: [], quantity: 1});
});

it('renders nothing while closed', async () => {
  await mount({visible: false});
  expect(texts(tree)).not.toContain('Burger Deluxe');
});
