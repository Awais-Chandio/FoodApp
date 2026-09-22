const {darkColors, lightColors, withAlpha} = require('../src/constants/designSystem');

const channel = value => {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const modes = {light: lightColors, dark: darkColors};

// [foreground token, background token, minimum ratio]. 4.5 = body text, 3 = large text / UI.
const TEXT_ON_SURFACES = [
  ['text', 'background', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'surfaceMuted', 4.5],
  ['textSecondary', 'background', 4.5],
  ['textSecondary', 'surface', 4.5],
  ['textSecondary', 'surfaceMuted', 4.5],
  ['textSecondary', 'badge', 4.5],
  ['subtext', 'background', 4.5],
  ['subtext', 'surface', 4.5],
  ['muted', 'surface', 3],
  ['onPrimary', 'primaryStrong', 4.5],
  ['onPrimary', 'primaryDeep', 4.5],
  ['primaryStrong', 'surface', 4.5],
  ['primaryStrong', 'background', 4.5],
  ['primaryDeep', 'badge', 4.5],
  ['primaryDeep', 'secondarySoft', 4.5],
  ['primary', 'surface', 3], // brand color as an icon/graphic
  ['onAccent', 'accent', 4.5],
  ['accentText', 'accentSoft', 4.5],
  ['accentText', 'surface', 4.5],
  ['successText', 'surface', 4.5],
  ['successText', 'background', 4.5],
  ['dangerText', 'surface', 4.5],
  ['dangerText', 'background', 4.5],
  ['warningText', 'surface', 4.5],
  ['warningText', 'background', 4.5],
  ['success', 'surface', 3],
  ['danger', 'surface', 3],
  ['borderStrong', 'surface', 3],
  ['borderStrong', 'background', 3],
];

const GRADIENTS_UNDER_ON_PRIMARY = ['buttonGradient', 'buttonGradientPressed', 'heroGradient', 'heroGradientAlt'];

describe.each(Object.keys(modes))('%s palette contrast', mode => {
  const colors = modes[mode];

  it.each(TEXT_ON_SURFACES)('%s on %s is at least %d:1', (fg, bg, min) => {
    expect(colors[fg]).toBeDefined();
    expect(colors[bg]).toBeDefined();
    expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(min);
  });

  it.each(GRADIENTS_UNDER_ON_PRIMARY)('onPrimary text reaches 4.5:1 on EVERY stop of %s', name => {
    colors[name].forEach(stop => {
      expect(contrast(colors.onPrimary, stop)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('onAccent text reaches 4.5:1 on every accentGradient stop', () => {
    colors.accentGradient.forEach(stop => {
      expect(contrast(colors.onAccent, stop)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('defines every token in both modes with the same shape', () => {
    Object.keys(lightColors).forEach(key => {
      expect(colors[key]).toBeDefined();
      expect(Array.isArray(colors[key])).toBe(Array.isArray(lightColors[key]));
    });
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });
});

it('keeps the given Ember inputs and the previous semantic colors', () => {
  expect(lightColors).toMatchObject({
    primary: '#E8590C', background: '#FFF9F3', surface: '#FFFFFF', text: '#1E1A17', accent: '#F5B93B',
    success: '#1F9D63', warning: '#FFB703', danger: '#E63946',
  });
  expect(darkColors).toMatchObject({
    primary: '#FF7A45', background: '#14110F', surface: '#1F1A17',
    success: '#37C17B', warning: '#FFB703', danger: '#FB7185',
  });
});

it('withAlpha turns a hex color into rgba', () => {
  expect(withAlpha('#E8590C', 0.28)).toBe('rgba(232,89,12,0.28)');
});
