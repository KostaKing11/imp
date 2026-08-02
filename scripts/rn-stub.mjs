// The room's state machine pulls in theme.ts and utils.ts, which import
// react-native for Platform and Alert. Node cannot parse react-native's
// own sources, so the room tests alias the whole module to this — enough
// of it to load, none of it used by the logic under test.
export const Platform = { OS: "android", select: (o) => o.android ?? o.default };
export const Alert = { alert: () => {} };
export const StyleSheet = { create: (s) => s, absoluteFill: {} };
export const Linking = {
  getInitialURL: async () => null,
  addEventListener: () => ({ remove: () => {} }),
};
