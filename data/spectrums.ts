// ============================================================
//  SPECTRUMS FILE — the two ends of the dial for "Scale".
//
//  One player secretly sees a point somewhere between `left` and
//  `right` and names something that sits there. Everyone else turns
//  the dial to where they think they meant.
//
//  There is deliberately ONE list and no categories to pick from.
//  Scale is a party game you should be able to start by pressing
//  start; choosing which flavours of scale were switched on was a menu
//  in front of a game nobody had played yet.
//
//  WHAT MAKES A GOOD SPECTRUM
//  You have to be able to put almost ANYTHING on it — an object, a
//  person, a film, a sandwich — and still argue about where.
//
//    good   Cheap ↔ Expensive        (anything has a price)
//    good   Boring ↔ Exciting
//    bad    A phase ↔ A whole personality   (only fits a few things)
//    bad    Cheap ↔ Tasty            (two different questions)
//
//  Keep both ends the SAME axis, just opposite, and short enough to
//  read on a dial.
// ============================================================

export type SpectrumEntry = {
  left: string;
  right: string;
};

export type SpectrumCategory = {
  name: string;
  spectrums: SpectrumEntry[];
};

export const SPECTRUM_CATEGORIES: SpectrumCategory[] = [
  {
    name: "Scale",
    spectrums: [
      { left: "Cheap", right: "Expensive" },
      { left: "Boring", right: "Exciting" },
      { left: "Easy", right: "Hard" },
      { left: "Quiet", right: "Loud" },
      { left: "Slow", right: "Fast" },
      { left: "Small", right: "Huge" },
      { left: "Ugly", right: "Beautiful" },
      { left: "Useless", right: "Essential" },
      { left: "Ordinary", right: "Strange" },
      { left: "Safe", right: "Dangerous" },
      { left: "Unhealthy", right: "Healthy" },
      { left: "Old-fashioned", right: "Modern" },
      { left: "Simple", right: "Complicated" },
      { left: "Cold", right: "Hot" },
      { left: "Rare", right: "Everywhere" },
      { left: "For children", right: "For adults" },
      { left: "Overrated", right: "Underrated" },
      { left: "Annoying", right: "Relaxing" },
      { left: "Dirty", right: "Clean" },
      { left: "Weak", right: "Strong" },
      { left: "Forgettable", right: "Unforgettable" },
      { left: "Tacky", right: "Classy" },
      { left: "Alone", right: "In a crowd" },
      { left: "Everyday", right: "Once in a lifetime" },
      { left: "Light", right: "Heavy" },
      { left: "Messy", right: "Tidy" },
      { left: "Serious", right: "Silly" },
      { left: "Indoors", right: "Outdoors" },
    ],
  },
];
