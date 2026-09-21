import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

import {matchesRestaurantFilter, searchAll} from '../src/utils/search';

const dish = (id, name, price = 200) => ({id, name, price, image_key: 'food1'});

const westway = {
  id: 1, name: 'Westway', rating: 4.6, time: '15 min', offer: '50% OFF',
  menu_items: [dish(1, 'Burger Deluxe', 170), dish(2, 'Margherita Pizza', 180)],
};
const fortune = {
  id: 2, name: 'Fortune', rating: 4.8, time: '25 min', offer: null,
  menu_items: [dish(3, 'Chicken Manchurian', 290), dish(4, 'Egg Fried Rice', 180)],
};
const moonland = {
  id: 7, name: 'Moonland', rating: 4.6, time: '15 min', offer: null,
  menu_items: [dish(5, 'Chicken Tikka', 260), dish(6, 'Garlic Naan', 40)],
};
const empty = {id: 9, name: 'Brand New', rating: 4.9, time: '20 min', offer: null}; // no menu_items key
const all = [westway, fortune, moonland, empty];

const names = list => list.map(item => item.name);

describe('searchAll', () => {
  it('returns every restaurant and no dishes for an empty query', () => {
    const result = searchAll(all, '');
    expect(names(result.restaurants)).toEqual(['Westway', 'Fortune', 'Moonland', 'Brand New']);
    expect(result.dishes).toEqual([]);
  });

  it('treats a blank query like an empty one', () => {
    expect(searchAll(all, '   ').dishes).toEqual([]);
    expect(searchAll(all, null).restaurants).toHaveLength(4);
  });

  it('matches dishes by name, ignoring case and surrounding spaces', () => {
    const result = searchAll(all, '  CHICKEN ');
    expect(names(result.dishes)).toEqual(['Chicken Manchurian', 'Chicken Tikka']);
    expect(result.restaurants).toEqual([]);
  });

  it('attaches the dish\'s restaurant, in restaurant then menu order', () => {
    const result = searchAll(all, 'a');
    const chicken = result.dishes.find(d => d.name === 'Chicken Tikka');
    expect(chicken.restaurant).toBe(moonland);
    expect(chicken.price).toBe(260);
    expect(names(result.dishes)).toEqual([
      'Margherita Pizza', 'Chicken Manchurian', 'Chicken Tikka', 'Garlic Naan',
    ]);
  });

  it('matches restaurants by name, offer and delivery time', () => {
    expect(names(searchAll(all, 'fort').restaurants)).toEqual(['Fortune']);
    expect(names(searchAll(all, '50%').restaurants)).toEqual(['Westway']);
    expect(names(searchAll(all, '15 min').restaurants)).toEqual(['Westway', 'Moonland']);
  });

  it('a query can match a restaurant and dishes at once', () => {
    const result = searchAll(all, 'moon');
    expect(names(result.restaurants)).toEqual(['Moonland']);
    expect(result.dishes).toEqual([]);
  });

  it('applies the Deals filter to restaurants and to a dish\'s restaurant', () => {
    const result = searchAll(all, 'a', 'offers');
    expect(names(result.restaurants)).toEqual(['Westway']);
    expect(names(result.dishes)).toEqual(['Margherita Pizza']); // only Westway has an offer
  });

  it('applies the Top rated filter (>= 4.8) to dishes too', () => {
    const result = searchAll(all, 'chicken', 'top');
    expect(names(result.dishes)).toEqual(['Chicken Manchurian']); // Fortune 4.8, not Moonland 4.6
  });

  it('a restaurant without menu items simply has no dishes', () => {
    expect(searchAll([empty], 'burger')).toEqual({restaurants: [], dishes: []});
  });

  it('filters an empty query too', () => {
    expect(names(searchAll(all, '', 'top').restaurants)).toEqual(['Fortune', 'Brand New']);
  });
});

describe('matchesRestaurantFilter', () => {
  it('handles all, offers and top', () => {
    expect(matchesRestaurantFilter(fortune, 'all')).toBe(true);
    expect(matchesRestaurantFilter(fortune, 'offers')).toBe(false);
    expect(matchesRestaurantFilter(westway, 'offers')).toBe(true);
    expect(matchesRestaurantFilter({rating: '4.8'}, 'top')).toBe(true);
    expect(matchesRestaurantFilter({rating: null}, 'top')).toBe(false);
  });
});

// ---- The screen -------------------------------------------------------------

jest.mock('@react-navigation/native', () => ({
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
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/database/repositories/restaurantRepo', () => ({listWithMenus: jest.fn()}));

const restaurantRepo = require('../src/database/repositories/restaurantRepo');
const SearchScreen = require('../src/screens/Search/SearchScreen').default;

const texts = tree =>
  tree.root
    .findAllByType(Text)
    .map(node => [node.props.children].flat(Infinity).join(''))
    .join(' | ');

describe('SearchScreen', () => {
  let navigation;
  let tree;

  // Lets VirtualizedList finish its batched render inside act().
  const settle = () =>
    ReactTestRenderer.act(async () => {
      await new Promise(resolve => setTimeout(resolve, 60));
    });
  const mount = async () => {
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<SearchScreen navigation={navigation} />);
    });
    await settle();
  };
  const typeQuery = async value => {
    const input = tree.root.findAll(n => n.props.onChangeText && n.props.value !== undefined)[0];
    await ReactTestRenderer.act(async () => input.props.onChangeText(value));
    await settle();
  };

  beforeEach(() => {
    navigation = {navigate: jest.fn()};
    restaurantRepo.listWithMenus.mockResolvedValue({nearest: [westway, fortune], popular: [moonland]});
  });

  it('shows only restaurants for an empty query', async () => {
    await mount();
    const out = texts(tree);
    expect(out).toContain('Restaurants (3)');
    expect(out).not.toContain('Dishes (');
  });

  it('shows Restaurants and Dishes sections with counts once there is a query', async () => {
    await mount();
    await typeQuery('chicken');
    const out = texts(tree);
    expect(out).toContain('Dishes (2)');
    expect(out).not.toContain('Restaurants (');
    expect(out).toContain('Chicken Tikka');
    expect(out).toContain('Rs. 260');
    expect(out).toContain('Moonland'); // the dish row names its restaurant
  });

  it('tapping a dish opens that restaurant\'s menu', async () => {
    await mount();
    await typeQuery('tikka');
    const row = tree.root.find(
      n => typeof n.props.onPress === 'function' && /Chicken Tikka from Moonland/.test(n.props.accessibilityLabel || ''),
    );

    await ReactTestRenderer.act(async () => row.props.onPress());

    expect(navigation.navigate).toHaveBeenCalledWith('HomeStack', {
      screen: 'MenuScreen',
      params: {restaurant: expect.objectContaining({id: 7, name: 'Moonland'})},
    });
  });

  it('shows one shared empty state when nothing matches', async () => {
    await mount();
    await typeQuery('zzzz');
    expect(texts(tree)).toContain('No restaurants or dishes found');
  });
});
