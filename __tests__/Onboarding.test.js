import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return ({children}) => require('react').createElement(View, null, children);
});
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));
jest.mock('../src/services/onboarding', () => ({finishOnboarding: jest.fn()}));

const {finishOnboarding} = require('../src/services/onboarding');
const OnboardingScreen = require('../src/screens/Onboarding/OnboardingScreen').default;
const {ONBOARDING_SLIDES} = require('../src/screens/Onboarding/OnboardingScreen');

const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');
const press = (tree, label) =>
  tree.root
    .findAll(n => typeof n.props.onPress === 'function' && n.findAllByType(Text).some(t => [t.props.children].flat().join('') === label))[0]
    .props.onPress();

let tree;
const navigation = {reset: jest.fn(), navigate: jest.fn()};
beforeEach(() => {
  jest.clearAllMocks();
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<OnboardingScreen navigation={navigation} />);
  });
});

it('renders every slide from data, with step badges', () => {
  const out = texts(tree);
  ONBOARDING_SLIDES.forEach((slide, i) => {
    expect(out).toContain(slide.title);
    expect(out).toContain(`Step ${i + 1} of ${ONBOARDING_SLIDES.length}`);
  });
  expect(ONBOARDING_SLIDES).toHaveLength(3);
});

it('Skip finishes onboarding from any slide', () => {
  ReactTestRenderer.act(() => press(tree, 'Skip'));
  expect(finishOnboarding).toHaveBeenCalledWith(navigation);
});

it('the last slide button reads "Start exploring" and finishes', () => {
  const list = tree.root.findByProps({pagingEnabled: true});
  const width = list.props.getItemLayout(null, 1).length;
  ReactTestRenderer.act(() => {
    list.props.onMomentumScrollEnd({nativeEvent: {contentOffset: {x: width * 2}}});
  });
  expect(texts(tree)).toContain('Start exploring');
  ReactTestRenderer.act(() => press(tree, 'Start exploring'));
  expect(finishOnboarding).toHaveBeenCalledWith(navigation);
});

it('accepts a custom slides array', () => {
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <OnboardingScreen navigation={navigation} slides={[{id: 'a', image: 1, title: 'Only one', subtitle: 'x'}]} />,
    );
  });
  expect(texts(tree)).toContain('Only one');
  expect(texts(tree)).toContain('Start exploring');
});
