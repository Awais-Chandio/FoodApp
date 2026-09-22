import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/Context/ThemeProvider', () => ({
  useTheme: () => ({colors: require('../src/constants/designSystem').lightColors}),
}));

const {fontFamily, lightColors, MAX_FONT_SCALE, typeScale} = require('../src/constants/designSystem');
const AppText = require('../src/components/ui/AppText').default;

const render = element => {
  let tree;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  const node = tree.root.findByType(Text);
  return {node, style: Object.assign({}, ...[node.props.style].flat(Infinity).filter(Boolean))};
};

it('defaults to the body variant in the text color and caps font scaling at 1.3x', () => {
  const {node, style} = render(<AppText>Hello</AppText>);
  expect(node.props.maxFontSizeMultiplier).toBe(1.3);
  expect(MAX_FONT_SCALE).toBe(1.3);
  expect(style).toMatchObject({...typeScale.body, color: lightColors.text});
});

it('applies every variant with its own family, size and line height', () => {
  Object.keys(typeScale).forEach(variant => {
    const {style} = render(<AppText variant={variant}>x</AppText>);
    expect(style).toMatchObject(typeScale[variant]);
    expect(style.lineHeight).toBeGreaterThan(style.fontSize);
  });
});

it('resolves color tokens, muted and explicit style colors', () => {
  expect(render(<AppText color="primaryStrong">x</AppText>).style.color).toBe(lightColors.primaryStrong);
  expect(render(<AppText muted>x</AppText>).style.color).toBe(lightColors.textSecondary);
  expect(render(<AppText style={{color: '#123456'}}>x</AppText>).style.color).toBe('#123456');
});

it('only uses the three bundled font files, never fontWeight', () => {
  expect(Object.values(fontFamily).sort()).toEqual([
    'PlusJakartaSans-Bold', 'PlusJakartaSans-Regular', 'PlusJakartaSans-SemiBold',
  ]);
  Object.values(typeScale).forEach(variant => {
    expect(Object.values(fontFamily)).toContain(variant.fontFamily);
    expect(variant.fontWeight).toBeUndefined();
  });
});
