import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

let mockMode = 'light';
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => {
    const ds = require('../src/constants/designSystem');
    return {colors: mockMode === 'dark' ? ds.darkColors : ds.lightColors};
  },
}));
jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return ({name}) => require('react').createElement(RNText, null, `icon:${name}`);
});

const {darkColors, lightColors} = require('../src/constants/designSystem');
const FilterChip = require('../src/components/ui/FilterChip').default;
const QtyStepper = require('../src/components/ui/QtyStepper').default;
const MenuItemCard = require('../src/components/ui/MenuItemCard').default;
const RestaurantCard = require('../src/components/ui/RestaurantCard').default;
const TextField = require('../src/components/ui/TextField').default;
const ScreenHeader = require('../src/components/ui/ScreenHeader').default;

const render = element => {
  let tree;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  return tree;
};
const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');
const flat = style => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));
const restaurant = {id: 1, name: 'Westway', rating: 4.6, time: '15 min', offer: '50% OFF', menu_items: [{}, {}]};

describe.each(['light', 'dark'])('shared components in %s mode', mode => {
  const colors = mode === 'dark' ? darkColors : lightColors;
  beforeEach(() => {
    mockMode = mode;
  });

  it('FilterChip: active uses primaryStrong + onPrimary, inactive uses surface + text', () => {
    const onPress = jest.fn();
    const active = render(<FilterChip label="Deals" active onPress={onPress} />);
    const chip = active.root.findByProps({accessibilityRole: 'button'});
    expect(flat(chip.props.style).backgroundColor).toBe(colors.primaryStrong);
    expect(flat(active.root.findAllByType(Text)[0].props.style).color).toBe(colors.onPrimary);
    expect(chip.props.accessibilityState).toEqual({selected: true});
    ReactTestRenderer.act(() => chip.props.onPress());
    expect(onPress).toHaveBeenCalled();

    const inactive = render(<FilterChip label="All" onPress={onPress} />);
    expect(flat(inactive.root.findByProps({accessibilityRole: 'button'}).props.style).backgroundColor).toBe(colors.surface);
    expect(flat(inactive.root.findAllByType(Text)[0].props.style).color).toBe(colors.text);
  });

  it('QtyStepper shows the value and calls the right handler', () => {
    const inc = jest.fn();
    const dec = jest.fn();
    const tree = render(<QtyStepper value={3} onIncrease={inc} onDecrease={dec} />);
    expect(texts(tree)).toContain('3');
    ReactTestRenderer.act(() => tree.root.findByProps({accessibilityLabel: 'Increase quantity'}).props.onPress());
    ReactTestRenderer.act(() => tree.root.findByProps({accessibilityLabel: 'Decrease quantity'}).props.onPress());
    expect(inc).toHaveBeenCalledTimes(1);
    expect(dec).toHaveBeenCalledTimes(1);
  });

  it('MenuItemCard renders title, subtitle, price and its slots', () => {
    const tree = render(
      <MenuItemCard image={1} title="Burger" subtitle="Juicy" price="Rs. 170" footer={<Text>FOOT</Text>} trailing={<Text>TRAIL</Text>} />,
    );
    const out = texts(tree);
    ['Burger', 'Juicy', 'Rs. 170', 'FOOT', 'TRAIL'].forEach(part => expect(out).toContain(part));
  });

  it('RestaurantCard: carousel, row and compact variants', () => {
    const toggle = jest.fn();
    const carousel = render(
      <RestaurantCard restaurant={restaurant} width={280} favorite onToggleFavorite={toggle} admin={{onEdit: jest.fn(), onDelete: jest.fn()}} />,
    );
    const out = texts(carousel);
    ['Westway', '50% OFF', '4.6', '15 min delivery', '2 menu items', 'View menu', 'Edit', 'Delete', 'icon:heart'].forEach(p => expect(out).toContain(p));
    ReactTestRenderer.act(() => carousel.root.findByProps({accessibilityLabel: 'Remove from favorites'}).props.onPress());
    expect(toggle).toHaveBeenCalled();

    const menu = jest.fn();
    const row = render(<RestaurantCard restaurant={restaurant} variant="row" onMenuPress={menu} />);
    expect(texts(row)).toContain('Menu');
    ReactTestRenderer.act(() => row.root.findByProps({accessibilityLabel: 'Open Westway menu'}).props.onPress());
    expect(menu).toHaveBeenCalled();

    const compact = render(<RestaurantCard restaurant={restaurant} variant="compact" />);
    expect(texts(compact)).toContain('4.6 • 15 min');
  });

  it('TextField: label, placeholder color, error outline and password toggle', () => {
    const tree = render(<TextField label="Email" value="" onChangeText={() => {}} placeholder="you@x.com" error="Required" />);
    expect(texts(tree)).toContain('Email');
    expect(texts(tree)).toContain('Required');
    const input = tree.root.findByType(TextInput);
    expect(input.props.placeholderTextColor).toBe(colors.textSecondary);
    expect(input.props.maxFontSizeMultiplier).toBe(1.3);
    expect(flat(input.props.style).lineHeight).toBeUndefined();

    const secure = render(<TextField label="Password" secure value="x" onChangeText={() => {}} />);
    expect(secure.root.findByType(TextInput).props.secureTextEntry).toBe(true);
    ReactTestRenderer.act(() => secure.root.findByProps({accessibilityLabel: 'Show password'}).props.onPress());
    expect(secure.root.findByType(TextInput).props.secureTextEntry).toBe(false);
  });

  it('ScreenHeader shows title, subtitle and a working back button', () => {
    const back = jest.fn();
    const tree = render(<ScreenHeader title="Your cart" subtitle="2 dishes" onBack={back} />);
    expect(texts(tree)).toContain('Your cart');
    expect(texts(tree)).toContain('2 dishes');
    ReactTestRenderer.act(() => tree.root.findByProps({accessibilityLabel: 'Go back'}).props.onPress());
    expect(back).toHaveBeenCalled();
  });
});
