export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  xxl: 38,
  pill: 999,
};

export const typography = {
  hero: 34,
  title: 30,
  h1: 24,
  h2: 20,
  body: 15,
  caption: 13,
};

// ---------------------------------------------------------------------------
// Ember palette. Given: light primary/background/surface/text/accent and dark
// primary/background/surface. The success, warning and danger colors are kept
// from the previous theme. Everything else is DERIVED by these rules:
//
//  R1 primaryStrong (light): the brand primary darkened in HSL lightness, same
//     hue and saturation, until white (onPrimary) AND the page background both
//     reach 4.5:1. That makes it safe as a button fill and as text. The brand
//     primary itself (3.58:1 with white) is kept for icons and decoration only.
//     Dark mode goes the other way: primaryStrong/primaryDeep are lighter steps
//     of the dark primary, and onPrimary is the dark background ink.
//  R2 primaryDeep = primaryStrong 10 lightness points darker (text on tints).
//  R3 surfaceMuted / badge / glow = the surface mixed with the brand primary at
//     6% / 10% / 20% (light) and 7% / 16% / 26% (dark).
//  R4 borderSoft / border = the background mixed with the brand primary at 9% /
//     18% (light); the surface mixed with the text color at 9% / 16% (dark).
//     borderStrong is the first mix toward the text color that reaches 3:1
//     against the surface, for input outlines.
//  R5 secondary / secondarySoft / accentSoft = the surface mixed with the accent
//     (45% / 20% / 20% light, 26% / 14% / 14% dark). accentText is the accent
//     darkened until it reaches 4.5:1 on accentSoft (already fine in dark).
//  R6 textSecondary / subtext / muted = the text color mixed toward the
//     background as far as it goes while still reaching 5:1 / 4.5:1 / 3:1 on
//     every surface it sits on.
//  R7 Every gradient runs along ONE hue, so each stop keeps 4.5:1 with onPrimary:
//     button [S, S-6], pressed [S-6, S-12], hero [S, S-10], heroAlt [S-5, S-15]
//     (S = primaryStrong, in lightness points; dark uses the same steps around
//     the dark primary). accentGradient is [accent, accent-8] under onAccent.
//  R8 successText / dangerText / warningText = the kept semantic color darkened
//     until it reaches 4.5:1 on every light surface. Use the plain token for
//     icons and fills, the Text variant for text.
//  R9 Text over photos never depends on the theme: onImage* and scrim* are fixed.
//
// __tests__/designSystem.test.js recomputes the contrast of every text/background
// pair below, in both modes, and fails if one drops under its minimum.
// ---------------------------------------------------------------------------

export const lightColors = {
  background: "#FFF9F3",
  surface: "#FFFFFF",
  surfaceMuted: "#FEF5F0",
  card: "#FFFFFF",
  input: "#FFFFFF",
  text: "#1E1A17",
  textSecondary: "#6B6662",
  subtext: "#76716D",
  muted: "#98928E",
  border: "#FBDCC9",
  borderSoft: "#FDEBDE",
  borderStrong: "#A08C80",
  primary: "#E8590C",
  primaryStrong: "#C8490C",
  primaryDeep: "#983709",
  onPrimary: "#FFFFFF",
  secondary: "#FBE0A7",
  secondarySoft: "#FDF1D8",
  accent: "#F5B93B",
  onAccent: "#1E1A17",
  accentSoft: "#FDF1D8",
  accentText: "#9B610A",
  success: "#1F9D63",
  successText: "#1E7D53",
  warning: "#FFB703",
  warningText: "#8A6800",
  danger: "#E63946",
  dangerText: "#D91926",
  badge: "#FDEEE7",
  glow: "#FADECE",
  overlay: "rgba(30,26,23,0.54)",
  shadow: "#5A2E16",
  // Over photos: fixed in both modes.
  onImage: "#FFFFFF",
  onImageMuted: "rgba(255,255,255,0.82)",
  glass: "rgba(255,255,255,0.16)",
  glassBorder: "rgba(255,255,255,0.14)",
  imageChip: "rgba(255,255,255,0.92)",
  imageChipText: "#1E1A17",
  scrim: "rgba(20,17,15,0.58)",
  scrimStrong: "rgba(20,17,15,0.76)",
  // On brand-colored fills (hero, buttons): darkens in light, lightens in dark.
  glassOnPrimary: "rgba(20,17,15,0.20)",
  glassOnPrimaryBorder: "rgba(255,255,255,0.18)",
  heroGradient: ["#C8490C", "#983709"],
  heroGradientAlt: ["#B0400B", "#802F08"],
  buttonGradient: ["#C8490C", "#AB3E0A"],
  buttonGradientPressed: ["#AB3E0A", "#8E3409"],
  accentGradient: ["#F5B93B", "#F3AB14"],
  surfaceGradient: ["#FFF9F3", "#FDECE1"],
  tabGradient: ["#FFFFFF", "#FEF5F0"],
  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  background: "#14110F",
  surface: "#1F1A17",
  surfaceMuted: "#2F211A",
  card: "#1F1A17",
  input: "#281E19",
  text: "#F9F1EB",
  textSecondary: "#A49E9A",
  subtext: "#89837F",
  muted: "#6B6663",
  border: "#423C39",
  borderSoft: "#332D2A",
  borderStrong: "#6C6662",
  primary: "#FF7A45",
  primaryStrong: "#FF9064",
  primaryDeep: "#FFB497",
  onPrimary: "#14110F",
  secondary: "#574320",
  secondarySoft: "#3D301C",
  accent: "#F5B93B",
  onAccent: "#14110F",
  accentSoft: "#3D301C",
  accentText: "#F5B93B",
  success: "#37C17B",
  successText: "#37C17B",
  warning: "#FFB703",
  warningText: "#FFB703",
  danger: "#FB7185",
  dangerText: "#FB7185",
  badge: "#43291E",
  glow: "#593323",
  overlay: "rgba(0,0,0,0.60)",
  shadow: "#000000",
  onImage: "#FFFFFF",
  onImageMuted: "rgba(255,255,255,0.82)",
  glass: "rgba(255,255,255,0.16)",
  glassBorder: "rgba(255,255,255,0.14)",
  imageChip: "rgba(255,255,255,0.92)",
  imageChipText: "#1E1A17",
  scrim: "rgba(20,17,15,0.58)",
  scrimStrong: "rgba(20,17,15,0.76)",
  glassOnPrimary: "rgba(255,255,255,0.18)",
  glassOnPrimaryBorder: "rgba(20,17,15,0.14)",
  heroGradient: ["#FF7A45", "#FF5D1C"],
  heroGradientAlt: ["#FF814F", "#FF5612"],
  buttonGradient: ["#FF8959", "#FF7A45"],
  buttonGradientPressed: ["#FF7A45", "#FF6426"],
  accentGradient: ["#F5B93B", "#F3AB14"],
  surfaceGradient: ["#221712", "#1F1A17"],
  tabGradient: ["#1F1A17", "#14110F"],
  white: "#FFFFFF",
  black: "#000000",
};

/** "#RRGGBB" + alpha (0..1) -> "rgba(r,g,b,a)". For brand-tinted overlays that must follow the theme. */
export const withAlpha = (hex, alpha) => {
  const value = String(hex).replace("#", "");
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

export const createShadow = (color = "#000000", elevation = 8) => ({
  shadowColor: color,
  shadowOpacity: 0.18,
  shadowRadius: Math.max(6, elevation),
  shadowOffset: { width: 0, height: Math.max(4, Math.round(elevation / 2)) },
  elevation,
});

export const layout = {
  pagePadding: spacing.xl,
  cardGap: spacing.md,
  sectionGap: spacing.xxl,
};
