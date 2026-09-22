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
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/Context/FavoritesContext', () => ({useFavorites: jest.fn()}));
jest.mock('../src/database/repositories/menuRepo', () => ({listByRestaurant: jest.fn()}));

const {useNavigation, useRoute} = require('@react-navigation/native');
const {useFavorites} = require('../src/Context/FavoritesContext');
const menuRepo = require('../src/database/repositories/menuRepo');
const DetailScreen = require('../src/screens/Details/DetailScreen').default;

const dish = (id, name, price) => ({id, name, price, image_key: 'food1'});
const restaurant = {id: 5, name: 'Fortune', rating: 4.8, time: '25 min', offer: null};

const texts = tree =>
  tree.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

let tree;
let toggle;
const mount = async (params = {restaurant}) => {
  useRoute.mockReturnValue({params});
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<DetailScreen />);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  toggle = jest.fn();
  useNavigation.mockReturnValue({navigate: jest.fn(), goBack: jest.fn()});
  useFavorites.mockReturnValue({isFavorite: () => false, toggle});
});
afterEach(() => console.log.mockRestore());

it('shows the real dishes and the real dish count, with no invented fallback dishes', async () => {
  menuRepo.listByRestaurant.mockResolvedValue([dish(1, 'Kung Pao Chicken', 320), dish(2, 'Chow Mein', 210)]);
  await mount();

  const out = texts(tree);
  expect(menuRepo.listByRestaurant).toHaveBeenCalledWith(5);
  expect(out).toContain('Kung Pao Chicken');
  expect(out).toContain('Chow Mein');
  expect(out).not.toContain('Margherita Pizza');
  expect(out).not.toContain('Veggie Supreme');
  expect(out).toMatch(/2 \| Dishes/);
});

it('shows a "No dishes yet" empty state for a restaurant without a menu', async () => {
  menuRepo.listByRestaurant.mockResolvedValue([]);
  await mount();

  const out = texts(tree);
  expect(out).toContain('No dishes yet');
  expect(out).toMatch(/0 \| Dishes/);
  expect(out).not.toContain('Margherita Pizza');
});

it('shows a loading placeholder (and "–" dishes) until the menu arrives', async () => {
  let resolveMenu;
  menuRepo.listByRestaurant.mockReturnValue(new Promise(resolve => (resolveMenu = resolve)));
  await mount();

  expect(texts(tree)).not.toContain('No dishes yet');
  expect(texts(tree)).toMatch(/– \| Dishes/);

  await ReactTestRenderer.act(async () => resolveMenu([dish(1, 'Chow Mein', 210)]));
  expect(texts(tree)).toContain('Chow Mein');
});

it('shows a retry state when the menu fails to load, and retries', async () => {
  menuRepo.listByRestaurant.mockRejectedValueOnce(new Error('db down'));
  await mount();
  expect(texts(tree)).toContain('Could not load the menu');

  menuRepo.listByRestaurant.mockResolvedValueOnce([dish(1, 'Chow Mein', 210)]);
  const retry = tree.root.find(
    n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => [t.props.children].flat().join('') === 'Try again'),
  );
  await ReactTestRenderer.act(async () => retry.props.onPress());

  expect(texts(tree)).toContain('Chow Mein');
});

it('uses the nested menu passed by Home while the fresh one loads', async () => {
  menuRepo.listByRestaurant.mockReturnValue(new Promise(() => {}));
  await mount({restaurant: {...restaurant, menu_items: [dish(1, 'Chow Mein', 210)]}});

  expect(texts(tree)).toContain('Chow Mein');
});

it('the heart shows an outline when not saved and a filled heart when saved, and toggles by restaurant id', async () => {
  menuRepo.listByRestaurant.mockResolvedValue([]);
  await mount();
  expect(texts(tree)).toContain('icon:hearto');

  const heart = tree.root.find(n => n.props.accessibilityLabel === 'Save to favorites');
  await ReactTestRenderer.act(async () => heart.props.onPress());
  expect(toggle).toHaveBeenCalledWith(5);

  useFavorites.mockReturnValue({isFavorite: id => id === 5, toggle});
  await mount();
  expect(texts(tree)).toContain('icon:heart');
  expect(tree.root.findAll(n => n.props.accessibilityLabel === 'Remove from favorites').length).toBeGreaterThan(0);
});
