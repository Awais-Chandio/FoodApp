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
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const typography = {
  hero: 34,
  title: 28,
  h1: 24,
  h2: 20,
  body: 15,
  caption: 13,
};

export const lightColors = {
  background: "#FFF8F3",
  surface: "#FFFFFF",
  surfaceMuted: "#FFF2E6",
  card: "#FFFFFF",
  input: "#FFFFFF",
  text: "#24160F",
  textSecondary: "#7D685C",
  subtext: "#8D7B71",
  muted: "#B7AAA1",
  border: "#F1DED0",
  borderSoft: "#F7EAE0",
  primary: "#FF7A30",
  primaryStrong: "#F0561E",
  secondary: "#1B9C73",
  success: "#23A26D",
  warning: "#FFB648",
  danger: "#D9574A",
  accent: "#FFE1CC",
  badge: "#FFF1E7",
  overlay: "rgba(36,22,15,0.58)",
  shadow: "#4F2D1B",
  white: "#FFFFFF",
  black: "#000000",
};

export const darkColors = {
  background: "#171311",
  surface: "#231C18",
  surfaceMuted: "#2D231E",
  card: "#241D19",
  input: "#2C231E",
  text: "#FFF7F2",
  textSecondary: "#CFBDB1",
  subtext: "#BBA99D",
  muted: "#8F7C71",
  border: "#3B2F29",
  borderSoft: "#44352D",
  primary: "#FF8D4F",
  primaryStrong: "#FF6E2D",
  secondary: "#36B48A",
  success: "#36B48A",
  warning: "#FFB648",
  danger: "#F17367",
  accent: "#36251B",
  badge: "#33241B",
  overlay: "rgba(0,0,0,0.55)",
  shadow: "#000000",
  white: "#FFFFFF",
  black: "#000000",
};

export const createShadow = (color = "#000000", elevation = 8) => ({
  shadowColor: color,
  shadowOpacity: 0.12,
  shadowRadius: elevation,
  shadowOffset: { width: 0, height: Math.max(3, Math.round(elevation / 2)) },
  elevation,
});

export const layout = {
  pagePadding: spacing.xl,
  cardGap: spacing.md,
  sectionGap: spacing.xxl,
};
