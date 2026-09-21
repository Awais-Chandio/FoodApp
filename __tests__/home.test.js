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

const {buildOffers} = require('../src/utils/offers');
const OfferCarousel = require('../src/components/OfferCarousel').default;
const {AUTO_ADVANCE_MS} = require('../src/components/OfferCarousel');
const OrderAgainRow = require('../src/components/OrderAgainRow').default;

const EXPIRES = Date.UTC(2026, 11, 31, 23, 59, 59, 999);
const promos = [
  {code: 'WELCOME20', percent: 20, min_order: 400, expires_at: EXPIRES},
  {code: 'SAVE10', percent: 10, min_order: 0, expires_at: null},
];
const restaurants = [
  {id: 1, name: 'Westway', offer: '50% OFF', time: '15 min'},
  {id: 2, name: 'Fortune', offer: null, time: '25 min'},
];
const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');

describe('buildOffers', () => {
  it('lists promos first, then restaurants that have an offer', () => {
    const offers = buildOffers({promos, restaurants});
    expect(offers.map(o => o.id)).toEqual(['promo-WELCOME20', 'promo-SAVE10', 'restaurant-1']);
    expect(offers[0]).toMatchObject({kind: 'promo', code: 'WELCOME20', title: '20% off with WELCOME20'});
    expect(offers[0].subtitle).toBe('Orders over Rs. 400 · Until 31 Dec 2026');
    expect(offers[1].subtitle).toBe('Tap to apply to your cart');
    expect(offers[2]).toMatchObject({kind: 'restaurant', title: '50% OFF at Westway'});
  });

  it('is empty when there is nothing to show', () => {
    expect(buildOffers({})).toEqual([]);
    expect(buildOffers({restaurants: [{id: 2, name: 'x', offer: null}]})).toEqual([]);
  });
});

describe('OfferCarousel', () => {
  const offers = buildOffers({promos, restaurants});
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const mount = props => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<OfferCarousel offers={offers} onOfferPress={jest.fn()} {...props} />);
    });
    return tree;
  };

  it('renders nothing without offers, and a skeleton while loading', () => {
    expect(mount({offers: []}).toJSON()).toBeNull();
    expect(mount({offers: [], loading: true}).toJSON()).not.toBeNull();
  });

  it('shows the banners and calls onOfferPress with the tapped one', () => {
    const onOfferPress = jest.fn();
    const tree = mount({onOfferPress});
    expect(texts(tree)).toContain('20% off with WELCOME20');
    const banner = tree.root.findByProps({accessibilityLabel: '50% OFF at Westway. 15 min delivery · tap to see the menu'});
    ReactTestRenderer.act(() => banner.props.onPress());
    expect(onOfferPress).toHaveBeenCalledWith(offers[2]);
  });

  it('advances every 4 s, wraps around, and pauses while touched', () => {
    const tree = mount();
    const list = tree.root.findByProps({pagingEnabled: true});
    const scrolled = [];
    // the FlatList instance is the ref target
    const instance = list.instance || null;
    if (instance) instance.scrollToIndex = ({index}) => scrolled.push(index);
    ReactTestRenderer.act(() => jest.advanceTimersByTime(AUTO_ADVANCE_MS));
    ReactTestRenderer.act(() => jest.advanceTimersByTime(AUTO_ADVANCE_MS));
    ReactTestRenderer.act(() => jest.advanceTimersByTime(AUTO_ADVANCE_MS));
    expect(scrolled).toEqual([1, 2, 0]);

    ReactTestRenderer.act(() => list.props.onTouchStart());
    ReactTestRenderer.act(() => jest.advanceTimersByTime(AUTO_ADVANCE_MS * 2));
    expect(scrolled).toEqual([1, 2, 0]); // paused

    ReactTestRenderer.act(() => list.props.onTouchEnd());
    ReactTestRenderer.act(() => jest.advanceTimersByTime(6000 + AUTO_ADVANCE_MS));
    expect(scrolled.length).toBe(4); // resumed
  });
});

describe('OrderAgainRow', () => {
  const orders = [
    {id: 5, total: 588, items: [{quantity: 2, name: 'Burger Deluxe'}, {quantity: 1, name: 'Margherita Pizza'}]},
  ];

  it('is hidden without orders', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<OrderAgainRow orders={[]} onReorder={jest.fn()} />);
    });
    expect(tree.toJSON()).toBeNull();
  });

  it('shows the dish summary, total and a Reorder button', () => {
    const onReorder = jest.fn();
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<OrderAgainRow orders={orders} onReorder={onReorder} />);
    });
    const out = texts(tree);
    expect(out).toContain('2× Burger Deluxe, 1× Margherita Pizza');
    expect(out).toContain('Rs. 588');
    ReactTestRenderer.act(() => tree.root.findByProps({accessibilityRole: 'button'}).props.onPress());
    expect(onReorder).toHaveBeenCalledWith(orders[0]);
  });
});
