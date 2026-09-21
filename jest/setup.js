/* eslint-env jest */
// Runs before every test file. Reanimated, Worklets and the Swipeable need
// native code that does not exist in Node, so they get small stand-ins that
// keep the same API surface the app uses.
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const {View, Text, Image, ScrollView, FlatList} = require('react-native');
  const identity = value => value;
  const animated = Component => Component;
  const Animated = {View, Text, Image, ScrollView, FlatList, createAnimatedComponent: animated};
  const chain = () => {
    const builder = {};
    ['duration', 'delay', 'springify', 'damping', 'stiffness', 'withInitialValues', 'easing'].forEach(name => {
      builder[name] = () => builder;
    });
    return builder;
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: initial => React.useRef({value: initial}).current,
    useAnimatedStyle: factory => factory(),
    withTiming: identity,
    withSpring: identity,
    withRepeat: identity,
    withSequence: (...values) => values[values.length - 1],
    withDelay: (_delay, value) => value,
    cancelAnimation: () => {},
    interpolate: (value, input, output) => output[0] + ((value - input[0]) / (input[1] - input[0])) * (output[1] - output[0]),
    Easing: {cubic: identity, inOut: identity, ease: identity, linear: identity, quad: identity, out: identity, in: identity, bezier: () => identity},
    FadeIn: chain(),
    FadeInDown: chain(),
    FadeInUp: chain(),
    FadeOut: chain(),
    Layout: chain(),
    LinearTransition: chain(),
    runOnJS: fn => fn,
  };
});

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(({children, renderRightActions}, ref) => {
      React.useImperativeHandle(ref, () => ({close: jest.fn(), openRight: jest.fn()}));
      return React.createElement(View, null, children, renderRightActions ? renderRightActions() : null);
    }),
  };
});
