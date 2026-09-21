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
jest.mock('react-native-toast-message', () => ({__esModule: true, default: {show: jest.fn()}}));
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/screens/Auth/AuthContext', () => ({useAuth: jest.fn()}));
jest.mock('../src/database/repositories/reviewRepo', () => ({add: jest.fn(), listTargets: jest.fn()}));

const Toast = require('react-native-toast-message').default;
const {useAuth} = require('../src/screens/Auth/AuthContext');
const reviewRepo = require('../src/database/repositories/reviewRepo');
const RateOrderButton = require('../src/components/RateOrderButton').default;
const ratings = require('../src/utils/ratings');

describe('blendRating', () => {
  it('blends the base rating (weight 5) with real reviews', () => {
    expect(ratings.blendRating(4.8, 0, 0)).toBe(4.8);
    expect(ratings.blendRating(4.8, 3, 1)).toBe(4.5); // (24 + 3) / 6 = 4.5, not 3.0
    expect(ratings.blendRating(4.0, 10, 2)).toBe(4.3); // (20 + 10) / 7 = 4.2857
    expect(ratings.blendRating(4.6, 5 * 100, 100)).toBe(5); // (23 + 500) / 105 = 4.98 // many reviews dominate the base
  });

  it('uses the plain average without a base rating, and null with nothing', () => {
    expect(ratings.blendRating(null, 9, 2)).toBe(4.5);
    expect(ratings.blendRating(undefined, 0, 0)).toBeNull();
    expect(ratings.blendRating('', 0, 0)).toBeNull();
  });
});

describe('review helpers', () => {
  it('masks the reviewer', () => {
    expect(ratings.maskReviewer('awais@x.com')).toBe('aw***');
    expect(ratings.maskReviewer('a@x.com')).toBe('a***');
    expect(ratings.maskReviewer(null)).toBe('Guest');
  });

  it('validates rating and comment', () => {
    expect(ratings.validateReview({rating: 5, comment: 'ok'})).toBeNull();
    [0, 6, 3.5, null, '4'].forEach(rating => expect(ratings.validateReview({rating, comment: ''})).toBeTruthy());
    expect(ratings.validateReview({rating: 4, comment: 'x'.repeat(501)})).toBeTruthy();
    expect(ratings.validateReview({rating: 4, comment: 'x'.repeat(500)})).toBeNull();
  });

  it('formats the date in UTC', () => {
    expect(ratings.formatReviewDate(Date.UTC(2026, 8, 21))).toBe('21 Sep 2026');
  });
});

describe('reviewBlocker', () => {
  const NOW = 10_000_000;
  const order = {id: 1, user_id: 7, status: 'delivered', created_at: NOW - 500_000};
  const base = {order, userId: 7, restaurantId: 3, orderRestaurantIds: [3], alreadyReviewed: false, now: NOW};

  it('allows the owner of a delivered order to review a restaurant in it, once', () => {
    expect(ratings.reviewBlocker(base)).toBeNull();
  });

  it('blocks other users, missing orders, undelivered orders, other restaurants and duplicates', () => {
    expect(ratings.reviewBlocker({...base, userId: 8})).toBe('NOT_YOUR_ORDER');
    expect(ratings.reviewBlocker({...base, order: null})).toBe('NOT_YOUR_ORDER');
    expect(ratings.reviewBlocker({...base, order: {...order, status: 'preparing', created_at: NOW - 30_000}})).toBe('NOT_DELIVERED');
    expect(ratings.reviewBlocker({...base, restaurantId: 9})).toBe('RESTAURANT_NOT_IN_ORDER');
    expect(ratings.reviewBlocker({...base, orderRestaurantIds: []})).toBe('RESTAURANT_NOT_IN_ORDER'); // pre-reviews order
    expect(ratings.reviewBlocker({...base, alreadyReviewed: true})).toBe('ALREADY_REVIEWED');
  });

  it('counts an order as delivered by the clock even if its stored status is stale', () => {
    expect(ratings.reviewBlocker({...base, order: {...order, status: 'on_the_way'}})).toBeNull(); // 500 s old
  });
});

describe('RateOrderButton', () => {
  const order = {id: 5, status: 'delivered'};
  let tree;
  const trees = [];
  const mount = async props => {
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<RateOrderButton order={order} delivered {...props} />);
    });
    trees.push(tree);
    await ReactTestRenderer.act(async () => { await new Promise(r => setTimeout(r, 0)); });
  };
  const texts = () => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');
  const press = label =>
    ReactTestRenderer.act(() =>
      tree.root.find(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => [t.props.children].flat().join('') === label)).props.onPress(),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    useAuth.mockReturnValue({user: {id: 7}});
    reviewRepo.listTargets.mockResolvedValue([{restaurant_id: 3, name: 'Westway', review: null}]);
    reviewRepo.add.mockResolvedValue({id: 1, rating: 4.5, reviewCount: 1});
  });
  afterEach(() => {
    console.log.mockRestore();
    trees.splice(0).forEach(t => ReactTestRenderer.act(() => t.unmount()));
  });

  it('renders nothing for undelivered orders, guests and pre-review orders', async () => {
    await mount({delivered: false});
    expect(tree.toJSON()).toBeNull();
    useAuth.mockReturnValue({user: {role: 'guest'}});
    await mount();
    expect(tree.toJSON()).toBeNull();
    useAuth.mockReturnValue({user: {id: 7}});
    reviewRepo.listTargets.mockResolvedValue([]);
    await mount();
    expect(tree.toJSON()).toBeNull();
  });

  it('shows a Rate button; the form disables Submit until a star is chosen, then saves', async () => {
    await mount();
    expect(texts()).toContain('Rate your order');
    await press('Rate your order');
    expect(texts()).toContain('How was Westway?');
    const submit = () => tree.root.find(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => /Submit review/.test([t.props.children].flat().join(''))));
    expect(submit().props.disabled).toBe(true);

    ReactTestRenderer.act(() => tree.root.find(n => n.props.accessibilityLabel === 'Rate 4 out of 5 stars' && typeof n.props.onPress === 'function').props.onPress());
    expect(texts()).toContain('Very good');
    const comment = tree.root.findAll(n => n.props.maxLength === 500 && n.props.onChangeText)[0];
    ReactTestRenderer.act(() => comment.props.onChangeText('  Great food  '));
    expect(submit().props.disabled).toBeFalsy();
    await ReactTestRenderer.act(async () => submit().props.onPress());

    expect(reviewRepo.add).toHaveBeenCalledWith({orderId: 5, restaurantId: 3, userId: 7, rating: 4, comment: 'Great food'});
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({type: 'success', text1: 'Thanks for your review'}));
  });

  it('shows the given stars instead of a button once the order is reviewed', async () => {
    reviewRepo.listTargets.mockResolvedValue([{restaurant_id: 3, name: 'Westway', review: {rating: 5, comment: 'x'}}]);
    await mount();
    expect(texts()).toContain('You rated this order');
    expect(texts()).not.toContain('Rate your order');
    expect(tree.root.findAllByProps({accessibilityLabel: 'Rated 5 out of 5'}).length).toBeGreaterThan(0);
  });

  it('explains a failed save and keeps the sheet open', async () => {
    reviewRepo.add.mockRejectedValueOnce(new Error('NOT_DELIVERED'));
    await mount();
    await press('Rate your order');
    ReactTestRenderer.act(() => tree.root.find(n => n.props.accessibilityLabel === 'Rate 5 out of 5 stars' && typeof n.props.onPress === 'function').props.onPress());
    await ReactTestRenderer.act(async () =>
      tree.root.find(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => /Submit review/.test([t.props.children].flat().join('')))).props.onPress(),
    );
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({type: 'error', text2: 'You can review an order once it is delivered.'}));
    expect(texts()).toContain('How was Westway?');
  });

  it('with several restaurants in the order, offers the first unreviewed one by name', async () => {
    reviewRepo.listTargets.mockResolvedValue([
      {restaurant_id: 3, name: 'Westway', review: {rating: 4, comment: null}},
      {restaurant_id: 7, name: 'Moonland', review: null},
    ]);
    await mount();
    expect(texts()).toContain('Rate your order · Moonland');
  });
});
