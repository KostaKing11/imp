// Central place for colors / spacing so all gamemodes look consistent.

export const colors = {
  bg: "#0A0B0D",
  card: "#15171C",
  cardPressed: "#1D2026",
  chip: "#101216",
  border: "#2A2F39",
  text: "#F4F6FA",
  textDim: "#98A0B3",
  accent: "#FF5A1F", // IMP orange
  accentText: "#FFFFFF",
  good: "#2ED573",
  danger: "#FF4757",
  word: "#FFD166",
  disabled: "#3A4152",
  // Gamemode branding (logo + selected mode card).
  impRed: "#E32636",
  oddYellow: "#F5C518",
  blefTeal: "#2DD4BF",
};

// The only colors a player can be. Twenty of them, far enough apart that
// nobody has to squint at two similar chips and wonder whose is whose —
// and no two players in a game may share one.
export const PLAYER_COLORS = [
  "#E03131", // red
  "#FF7A1F", // orange
  "#FFD500", // yellow
  "#A6E22E", // lime
  "#2DA44E", // green
  "#00897B", // teal
  "#17C7D4", // cyan
  "#38A3FF", // sky
  "#1E4FFF", // blue
  "#8E44AD", // purple
  "#C2185B", // magenta
  "#E85D9E", // pink
  "#FFAFC9", // rose
  "#FF8A6B", // coral
  "#7A4A2B", // brown
  "#D9A05B", // tan
  "#FFE49C", // banana
  "#8A93A6", // gray
  "#F5F5F5", // white
  "#1B1B1F", // black
];

export const MAX_PLAYERS = PLAYER_COLORS.length;

// First color nobody else has taken (falls back to the first one).
export function freeColor(taken: string[]): string {
  const used = taken.map((c) => c.toUpperCase());
  return PLAYER_COLORS.find((c) => !used.includes(c.toUpperCase())) ?? PLAYER_COLORS[0];
}

export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
};
