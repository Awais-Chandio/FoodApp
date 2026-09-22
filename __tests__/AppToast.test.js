import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native-toast-message', () => ({__esModule: true, default: () => null}));
jest.mock('react-native-safe-area-context', () => ({initialWindowMetrics: {insets: {top: 44}}}));
jest.mock('@react-native-vector-icons/ant-design', () => {
  const {Text: RNText} = require('react-native');
  return ({name}) => require('react').createElement(RNText, null, `icon:${name}`);
});
let mockMode = 'light';
jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => {
    const ds = require('../src/constants/designSystem');
    return {colors: mockMode === 'dark' ? ds.darkColors : ds.lightColors};
  },
}));

const {darkColors, lightColors} = require('../src/constants/designSystem');
const AppToast = require('../src/components/ui/AppToast').default;
const {toastConfig} = require('../src/components/ui/AppToast');

const render = element => {
  let tree;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  return tree;
};
const texts = tree => tree.root.findAllByType(Text).map(n => [n.props.children].flat(Infinity).join('')).join(' | ');

describe.each([['light', lightColors], ['dark', darkColors]])('toast in %s mode', (mode, colors) => {
  beforeEach(() => {
    mockMode = mode;
  });

  it.each([
    ['success', 'icon:check-circle', colors.success],
    ['error', 'icon:close-circle', colors.danger],
    ['info', 'icon:info-circle', colors.primary],
  ])('%s toast shows its icon, text and themed surface', (type, icon, accent) => {
    const onPress = jest.fn();
    const tree = render(toastConfig[type]({text1: 'Title', text2: 'Detail', onPress}));
    const out = texts(tree);
    expect(out).toContain('Title');
    expect(out).toContain('Detail');
    expect(out).toContain(icon);
    const card = tree.root.findByProps({accessibilityRole: 'alert'});
    const style = Object.assign({}, ...card.props.style.flat(Infinity).filter(Boolean));
    expect(style.backgroundColor).toBe(colors.surface);
    expect(style.borderColor).toBe(colors.borderSoft);
    const bar = tree.root.findAll(n => n.props.style && [n.props.style].flat().some(s => s && s.backgroundColor === accent));
    expect(bar.length).toBeGreaterThan(0);
    ReactTestRenderer.act(() => card.props.onPress());
    expect(onPress).toHaveBeenCalled();
  });
});

it('AppToast mounts the library toast below the status bar with the themed config', () => {
  const tree = render(<AppToast />);
  const toast = tree.root.findByProps({topOffset: 52});
  expect(Object.keys(toast.props.config).sort()).toEqual(['error', 'info', 'success']);
});
