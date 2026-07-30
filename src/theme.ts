// Central place for colors / spacing / type so all gamemodes look consistent.

import { Platform, TextStyle, ViewStyle } from "react-native";

export const colors = {
  // Surfaces, darkest to lightest. Anything that sits on top of something
  // else steps up one level — that's the whole depth model. Everything
  // is pulled towards plum rather than neutral grey: a party game played
  // in a dim room should feel lit, not switched off.
  bg: "#0A0714",
  bgSoft: "#130E22",
  card: "#1C1633",
  cardPressed: "#282046",
  cardAlt: "#282046",
  chip: "#161029",

  // Hairlines. `border` is the default; the other two are for pulling an
  // edge back into the background or pushing it forward.
  border: "#382E5C",
  borderSoft: "#271F45",
  borderStrong: "#584878",

  text: "#F8F5FF",
  textDim: "#AFA4D0",
  textFaint: "#8076A3",

  accent: "#FF6B2C", // IMP orange
  accentText: "#FFFFFF",
  accentSoft: "rgba(255,107,44,0.16)",
  accentGlow: "rgba(255,107,44,0.34)",
  // The other end of every primary gradient — the orange lifts into gold
  // instead of sitting flat.
  accentHi: "#FFB13A",
  // A second voice for anything that should not be orange: player turns,
  // celebrations, the odd highlight.
  party: "#B45CFF",
  partySoft: "rgba(180,92,255,0.16)",
  partyHi: "#E07BFF",
  // A third, cool voice — the far end of the ambient backdrop and the
  // counterweight to all that orange.
  cool: "#4CC9F0",

  good: "#3BE38C",
  goodSoft: "rgba(59,227,140,0.16)",
  danger: "#FF5C7A",
  dangerSoft: "rgba(255,92,122,0.16)",
  word: "#FFD166",
  disabled: "#3B3260",

  // Gamemode branding (logo + selected mode card).
  impRed: "#E32636",
  oddYellow: "#F5C518",
  blefTeal: "#2DD4BF",
};

// Every gamemode's colour, in one place — the mode cards, the lobby
// header and the ambient glow behind a round all read from here so a
// mode looks the same wherever it turns up.
export const MODE_TINT: Record<string, string> = {
  imp: colors.impRed,
  odd: colors.oddYellow,
  mafia: "#E8EAF0",
  blef: colors.blefTeal,
  faker: "#B79BFF",
  skala: "#7BD948",
  sync: "#4A9EFF",
};

export function modeTint(mode: string): string {
  return MODE_TINT[mode] ?? colors.accent;
}

// #RRGGBB + opacity -> rgba(). Used for tinted fills and glows so a colour
// only has to be defined once.
export function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

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

// Closest palette colour to any given one.
function nearestColor(hex: string): string {
  const rgb = (c: string) => {
    const h = c.replace("#", "");
    return h.length === 6
      ? [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
      : [0, 0, 0];
  };
  const [r, g, b] = rgb(hex);
  let best = PLAYER_COLORS[0];
  let bestDist = Infinity;
  for (const c of PLAYER_COLORS) {
    const [cr, cg, cb] = rgb(c);
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

// Brings a saved roster onto the palette: anything off-palette snaps to
// the nearest colour, and duplicates are pushed to a free one.
export function snapColors<T extends { color: string }>(players: T[]): T[] {
  const taken: string[] = [];
  return players.map((p) => {
    const onPalette = PLAYER_COLORS.find((c) => c.toUpperCase() === p.color.toUpperCase());
    let color = onPalette ?? nearestColor(p.color);
    if (taken.some((c) => c.toUpperCase() === color.toUpperCase())) color = freeColor(taken);
    taken.push(color);
    return { ...p, color };
  });
}

// First color nobody else has taken (falls back to the first one).
export function freeColor(taken: string[]): string {
  const used = taken.map((c) => c.toUpperCase());
  return PLAYER_COLORS.find((c) => !used.includes(c.toUpperCase())) ?? PLAYER_COLORS[0];
}

export const spacing = {
  xxs: 4,
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
};

// One type scale for the whole app. Screens reach for these instead of
// inventing another 17px/700 somewhere.
export const type: Record<string, TextStyle> = {
  // Big numbers and single-word moments (timer, the word, a score).
  display: { fontSize: 46, fontWeight: "900", letterSpacing: -1 },
  // Screen titles.
  title: { fontSize: 30, fontWeight: "900", letterSpacing: -0.6 },
  // Card headings, player names.
  heading: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  // Buttons and chips.
  button: { fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },
  body: { fontSize: 16, fontWeight: "500", letterSpacing: 0 },
  bodyStrong: { fontSize: 16, fontWeight: "700" },
  // Small print under something.
  caption: { fontSize: 13, fontWeight: "600", letterSpacing: 0 },
  // The little uppercase label above a section.
  eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase" },
};

// Shadows read as almost nothing on a dark background, so they're used
// only to lift the things that should feel tappable.
const shadow = (color: string, opacity: number, radiusPx: number, y: number, elevation: number) =>
  Platform.select<ViewStyle>({
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: y },
    },
  }) as ViewStyle;

export const elevation = {
  card: shadow("#000000", 0.35, 12, 4, 3),
  sheet: shadow("#000000", 0.5, 24, -6, 16),
  // Coloured lift for the primary button — the orange bleeds a little.
  accent: shadow(colors.accent, 0.4, 16, 6, 8),
  glow: (color: string) => shadow(color, 0.45, 18, 6, 8),
  // Twice the bleed, for the one thing on screen that is the moment:
  // a winner's card, the selected mode, the card you just flipped.
  glowStrong: (color: string) => shadow(color, 0.6, 28, 8, 14),
};

// One vocabulary of springs, so everything in the app moves like it
// belongs to the same toy. `pop` is the party one — it overshoots
// visibly; `snap` is for controls that should feel precise; `soft` is
// for anything large enough that a bounce would read as a wobble.
export const motion = {
  pop: { speed: 14, bounciness: 14 },
  snap: { speed: 20, bounciness: 8 },
  soft: { speed: 12, bounciness: 2 },
  // Press-down / release. Down is fast and dead, release bounces back.
  pressIn: { speed: 40, bounciness: 0 },
  pressOut: { speed: 18, bounciness: 12 },
} as const;

// The two-colour ramps used for anything filled. Kept here so a button,
// a chip and a badge painted "primary" are painted the same primary.
export const gradients = {
  primary: [colors.accentHi, colors.accent] as const,
  party: [colors.partyHi, colors.party] as const,
  good: ["#7BFFB0", colors.good] as const,
  danger: ["#FF8FA3", colors.danger] as const,
  // A colour lifted towards white, for painting anything in a player's
  // or a role's own colour without it reading as a flat rectangle.
  of: (color: string): [string, string] => [mix(color, "#FFFFFF", 0.28), color],
};

// Blend two hex colours. Used for the lighter end of a gradient and for
// tinting a surface towards a player's colour.
export function mix(a: string, b: string, amount: number): string {
  const parse = (c: string) => {
    const h = c.replace("#", "");
    return h.length === 6
      ? [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
      : [0, 0, 0];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const to = (x: number) => Math.round(x).toString(16).padStart(2, "0");
  return `#${to(r1 + (r2 - r1) * amount)}${to(g1 + (g2 - g1) * amount)}${to(b1 + (b2 - b1) * amount)}`;
}
