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

// Plus Jakarta Sans as static files: Android cannot pick a weight from one
// family, so every weight is its own fontFamily name and fontWeight is never
// combined with it. Weights collapse to three: regular, semibold, bold.
export const fontFamily = {
  regular: "PlusJakartaSans-Regular",
  semibold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
};

// Text sizes, weights and line heights. Use through <AppText variant="...">, or
// spread into a style: { ...typeScale.h2 }.
export const typeScale = {
  display: { fontFamily: fontFamily.bold, fontSize: 34, lineHeight: 42 },
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 30 },
  h3: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 18 },
};

// Largest the OS "font size" setting may scale text, so layouts cannot break.
export const MAX_FONT_SCALE = 1.3;

// ---------------------------------------------------------------------------
// Citrus palette. The supplied brand, neutral and semantic colors are the
// source values. Everything else is derived by these rules:
//
//  R1 The requested light primaryStrong (#E5341F) is 4.34:1 with white and
//     4.16:1 with the page background. It is adjusted three whole HSL lightness
//     points to #DB2E19, the first step that clears 4.5:1 against both. The
//     brighter primary stays available for icons and decoration. Dark mode uses
//     the supplied primaryStrong and dark background ink as onPrimary.
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
//  R8 successText / dangerText / warningText = the semantic color darkened
//     until it reaches 4.5:1 on every light surface. Use the plain token for
//     icons and fills, the Text variant for text.
//  R9 Text over photos never depends on the theme: onImage* and scrim* are fixed.
//
// __tests__/designSystem.test.js recomputes the contrast of every text/background
// pair below, in both modes, and fails if one drops under its minimum.
// ---------------------------------------------------------------------------

export const lightColors = {
  background: "#FCFAF7",
  surface: "#FFFFFF",
  surfaceMuted: "#FFF4F3",
  card: "#FFFFFF",
  input: "#FFFFFF",
  text: "#201A17",
  textSecondary: "#6F6660",
  subtext: "#766D67",
  muted: "#938A84",
  border: "#EFE6DE",
  borderSoft: "#FCEDE9",
  borderStrong: "#93877F",
  primary: "#FF4433",
  primaryStrong: "#DB2E19",
  primaryDeep: "#AD2414",
  onPrimary: "#FFFFFF",
  secondary: "#FFDF8C",
  secondarySoft: "#FFF1CC",
  accent: "#FFB800",
  onAccent: "#201A17",
  accentSoft: "#FFF1CC",
  accentText: "#765600",
  success: "#1FAA59",
  successText: "#14783E",
  warning: "#F5A623",
  warningText: "#805300",
  danger: "#E5484D",
  dangerText: "#CF3037",
  badge: "#FFECEB",
  glow: "#FFDAD6",
  overlay: "rgba(32,26,23,0.54)",
  shadow: "#201A17",
  // Over photos: fixed in both modes.
  onImage: "#FFFFFF",
  onImageMuted: "rgba(255,255,255,0.82)",
  glass: "rgba(255,255,255,0.16)",
  glassBorder: "rgba(255,255,255,0.14)",
  imageChip: "rgba(255,255,255,0.92)",
  imageChipText: "#201A17",
  scrim: "rgba(16,17,20,0.58)",
  scrimStrong: "rgba(16,17,20,0.76)",
  // On brand-colored fills (hero, buttons): darkens in light, lightens in dark.
  glassOnPrimary: "rgba(21,18,17,0.20)",
  glassOnPrimaryBorder: "rgba(255,255,255,0.22)",
  heroGradient: ["#DB2E19", "#AD2414"],
  heroGradientAlt: ["#C42916", "#962011"],
  buttonGradient: ["#DB2E19", "#C02816"],
  buttonGradientPressed: ["#C02816", "#A42213"],
  accentGradient: ["#FFB800", "#D69B00"],
  surfaceGradient: ["#FCFAF7", "#FCEDE9"],
  tabGradient: ["#FFFFFF", "#FFF4F3"],
  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  background: "#17181C",
  surface: "#1F2024",
  surfaceMuted: "#25262B",
  card: "#1F2024",
  input: "#26272B",
  text: "#F5F3F0",
  textSecondary: "#A8A6A3",
  subtext: "#989693",
  muted: "#7B7B7E",
  border: "#2A2B30",
  borderSoft: "#323336",
  borderStrong: "#6B6C72",
  primary: "#FF6B52",
  primaryStrong: "#FF836C",
  primaryDeep: "#FFAE9F",
  onPrimary: "#17181C",
  secondary: "#594C2F",
  secondarySoft: "#3E382A",
  accent: "#FFC94D",
  onAccent: "#17181C",
  accentSoft: "#3E382A",
  accentText: "#FFC94D",
  success: "#34C77B",
  successText: "#34C77B",
  warning: "#FFB648",
  warningText: "#FFB648",
  danger: "#FF6B6B",
  dangerText: "#FF6B6B",
  badge: "#432C2B",
  glow: "#593430",
  overlay: "rgba(0,0,0,0.62)",
  shadow: "#000000",
  onImage: "#FFFFFF",
  onImageMuted: "rgba(255,255,255,0.82)",
  glass: "rgba(255,255,255,0.16)",
  glassBorder: "rgba(255,255,255,0.14)",
  imageChip: "rgba(255,255,255,0.92)",
  imageChipText: "#201A17",
  scrim: "rgba(16,17,20,0.58)",
  scrimStrong: "rgba(16,17,20,0.76)",
  glassOnPrimary: "rgba(23,24,28,0.18)",
  glassOnPrimaryBorder: "rgba(23,24,28,0.16)",
  heroGradient: ["#FF836C", "#FF5839"],
  heroGradientAlt: ["#FF6D52", "#FF4220"],
  buttonGradient: ["#FF836C", "#FF694D"],
  buttonGradientPressed: ["#FF694D", "#FF4F2F"],
  accentGradient: ["#FFC94D", "#FFBD24"],
  surfaceGradient: ["#24252A", "#1F2024"],
  tabGradient: ["#1F2024", "#17181C"],
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
  cardPadding: spacing.lg,
  cardRadius: radius.lg,
  cardElevation: 10,
  sectionGap: spacing.xxl,
};
