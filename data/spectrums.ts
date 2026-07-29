// ============================================================
//  SPECTRUMS FILE — the two ends of the dial for "Scale".
//
//  Adding a spectrum = add one line inside a category's `spectrums`.
//  Adding a category = copy a { name: ..., spectrums: [...] } block.
//
//  One player secretly sees a point somewhere between `left` and
//  `right` and names something that sits there. Everyone else turns
//  the dial to where they think they meant.
//
//  A good spectrum is one where almost anything can be placed on it
//  and people will still argue about where. Avoid ends that are two
//  different questions ("cheap ↔ tasty") — they have to be the same
//  axis, just opposite.
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
    name: "Everyday",
    spectrums: [
      { left: "Useless", right: "Essential" },
      { left: "Cheap", right: "Expensive" },
      { left: "Boring", right: "Exciting" },
      { left: "Easy", right: "Hard" },
      { left: "Quiet", right: "Loud" },
      { left: "Normal", right: "Weird" },
      { left: "Forgettable", right: "Unforgettable" },
      { left: "A chore", right: "A treat" },
      { left: "Slow", right: "Fast" },
      { left: "Old-fashioned", right: "Modern" },
      { left: "Private", right: "Public" },
      { left: "Waste of time", right: "Time well spent" },
      { left: "Rare", right: "Everywhere" },
      { left: "Simple", right: "Complicated" },
      { left: "Temporary", right: "Permanent" },
    ],
  },
  {
    name: "Opinions",
    spectrums: [
      { left: "Overrated", right: "Underrated" },
      { left: "Guilty pleasure", right: "Proud of it" },
      { left: "Cringe", right: "Cool" },
      { left: "Bad taste", right: "Good taste" },
      { left: "Nobody cares", right: "Everyone has an opinion" },
      { left: "Fine to admit", right: "Take it to your grave" },
      { left: "A red flag", right: "A green flag" },
      { left: "Basic", right: "Original" },
      { left: "Trashy", right: "Classy" },
      { left: "Fair", right: "Unfair" },
      { left: "Harmless", right: "Offensive" },
      { left: "Childish", right: "Grown-up" },
      { left: "Dated", right: "Timeless" },
      { left: "Try-hard", right: "Effortless" },
      { left: "A phase", right: "A personality" },
    ],
  },
  {
    name: "Food & Drink",
    spectrums: [
      { left: "Unhealthy", right: "Healthy" },
      { left: "Snack", right: "Full meal" },
      { left: "Bland", right: "Spicy" },
      { left: "Breakfast", right: "Dinner" },
      { left: "Eat alone", right: "Share with everyone" },
      { left: "Fast food", right: "Fine dining" },
      { left: "Kids love it", right: "Adults only" },
      { left: "Better cold", right: "Better hot" },
      { left: "Sad desk lunch", right: "Special occasion" },
      { left: "Needs a fork", right: "Eat with your hands" },
      { left: "Everyday", right: "Once a year" },
      { left: "Disappointing", right: "Worth the hype" },
      { left: "Light", right: "Heavy" },
      { left: "Weird combination", right: "Obvious combination" },
      { left: "Cheap night in", right: "Expensive night out" },
    ],
  },
  {
    name: "People",
    spectrums: [
      { left: "Introvert", right: "Extrovert" },
      { left: "Annoying habit", right: "Charming habit" },
      { left: "Bad first impression", right: "Great first impression" },
      { left: "Would forget you", right: "Would remember you forever" },
      { left: "Bad at parties", right: "Life of the party" },
      { left: "Terrible advice", right: "Great advice" },
      { left: "Would betray you", right: "Would take a bullet" },
      { left: "Messy", right: "Obsessively tidy" },
      { left: "Always late", right: "Painfully early" },
      { left: "Keeps secrets", right: "Tells everyone" },
      { left: "Peacemaker", right: "Starts the argument" },
      { left: "Follows the rules", right: "Breaks every rule" },
      { left: "Bad liar", right: "Frighteningly convincing" },
      { left: "Low maintenance", right: "High maintenance" },
      { left: "Would text back instantly", right: "Would reply in a week" },
    ],
  },
  {
    name: "Risky",
    spectrums: [
      { left: "Not scary", right: "Terrifying" },
      { left: "Safe", right: "Dangerous" },
      { left: "Mildly annoying", right: "Ruins your day" },
      { left: "Legal", right: "Very illegal" },
      { left: "Would survive it", right: "Absolutely not" },
      { left: "Small problem", right: "Call someone" },
      { left: "Gross", right: "Fine actually" },
      { left: "Embarrassing", right: "Nobody would notice" },
      { left: "Worth the risk", right: "Never worth it" },
      { left: "Painless", right: "Agony" },
      { left: "Fixable", right: "Ruined forever" },
      { left: "Sensible fear", right: "Irrational fear" },
      { left: "Everyone does it", right: "Nobody admits it" },
      { left: "Awkward", right: "Genuinely upsetting" },
      { left: "Bad idea", right: "Great idea" },
    ],
  },
  {
    name: "Movies & Music",
    spectrums: [
      { left: "Terrible film", right: "Masterpiece" },
      { left: "Watch alone", right: "Watch with everyone" },
      { left: "Skip it", right: "Watch it twice" },
      { left: "Background music", right: "Full attention" },
      { left: "Song for cleaning", right: "Song for crying" },
      { left: "Nobody knows it", right: "Everyone knows it" },
      { left: "Bad karaoke choice", right: "Perfect karaoke song" },
      { left: "Cheesy", right: "Genuinely moving" },
      { left: "Made for kids", right: "Made for adults" },
      { left: "Aged badly", right: "Aged perfectly" },
      { left: "Sequel bait", right: "Ends properly" },
      { left: "Turn it down", right: "Turn it up" },
      { left: "Guilty listen", right: "Would put on a playlist" },
      { left: "Slow burn", right: "Grabs you instantly" },
      { left: "Forgettable song", right: "Stuck in your head for days" },
    ],
  },
  {
    name: "Home & Work",
    spectrums: [
      { left: "Do it now", right: "Put it off forever" },
      { left: "Nobody notices", right: "First thing people see" },
      { left: "Throw it away", right: "Keep it forever" },
      { left: "Do it yourself", right: "Call a professional" },
      { left: "A quick job", right: "Ruins your weekend" },
      { left: "Cheap fix", right: "Costs a fortune" },
      { left: "Optional", right: "Non-negotiable" },
      { left: "Casual", right: "Formal" },
      { left: "Fine to email", right: "Needs a phone call" },
      { left: "Junk drawer", right: "Display shelf" },
      { left: "Would lend it", right: "Never leaves the house" },
      { left: "Clutter", right: "Decoration" },
      { left: "Ignore the noise", right: "Investigate immediately" },
      { left: "Reasonable request", right: "Absolute cheek" },
      { left: "Works from home", right: "Has to be in person" },
    ],
  },
  {
    name: "Nature & Places",
    spectrums: [
      { left: "Would visit once", right: "Would live there" },
      { left: "Tourist trap", right: "Hidden gem" },
      { left: "Indoors", right: "Outdoors" },
      { left: "Peaceful", right: "Chaotic" },
      { left: "City", right: "Countryside" },
      { left: "Cold", right: "Hot" },
      { left: "Easy walk", right: "Serious hike" },
      { left: "Ugly", right: "Beautiful" },
      { left: "Empty", right: "Packed" },
      { left: "Cheap holiday", right: "Costs a fortune" },
      { left: "Go for a day", right: "Need a whole week" },
      { left: "Man-made", right: "Untouched" },
      { left: "Too far", right: "Round the corner" },
      { left: "Better in photos", right: "Better in person" },
      { left: "Nothing to do", right: "Never enough time" },
    ],
  },
];
