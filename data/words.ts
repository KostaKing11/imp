// ============================================================
//  WORDS FILE — built-in categories and their words.
//
//  Adding a word  = add one line inside a category's `words`.
//  Adding a category = copy a { name: ..., words: [...] } block.
//
//  Normal players see the word; the imposter sees ONE random
//  hint, so give each word 5–10 hints vague enough to bluff with.
//
//  (Custom categories can also be created inside the app itself —
//  those are stored on the phone, not in this file.)
// ============================================================

export type WordEntry = {
  word: string;
  hints: string[];
};

export type BuiltinCategory = {
  name: string;
  words: WordEntry[];
};

export const CATEGORIES: BuiltinCategory[] = [
  {
    name: "Objects",
    words: [
      { word: "Umbrella", hints: ["rain", "folding", "handle", "wet", "wind", "spring open"] },
      { word: "Guitar", hints: ["strings", "music", "wood", "band", "concert", "strumming"] },
      { word: "Mirror", hints: ["reflection", "glass", "bathroom", "selfie", "seven years", "wall"] },
      { word: "Backpack", hints: ["school", "straps", "zipper", "carrying", "books", "travel"] },
      { word: "Candle", hints: ["wax", "flame", "birthday", "scent", "wick", "romantic"] },
      { word: "Scissors", hints: ["cutting", "sharp", "paper", "two blades", "hairdresser", "crafts"] },
      { word: "Clock", hints: ["time", "ticking", "hands", "wall", "alarm", "numbers"] },
      { word: "Pillow", hints: ["soft", "sleep", "feathers", "bed", "fight", "dreams"] },
    ],
  },
  {
    name: "Animals",
    words: [
      { word: "Elephant", hints: ["huge", "trunk", "gray", "big ears", "africa", "memory"] },
      { word: "Penguin", hints: ["cold", "tuxedo", "waddle", "ice", "bird", "can't fly"] },
      { word: "Shark", hints: ["teeth", "fin", "ocean", "predator", "movie", "scary"] },
      { word: "Kangaroo", hints: ["jumping", "pouch", "australia", "boxing", "tail", "baby inside"] },
      { word: "Owl", hints: ["night", "wise", "hooting", "big eyes", "silent", "tree"] },
      { word: "Snake", hints: ["slither", "venom", "scales", "hissing", "long", "no legs"] },
      { word: "Spider", hints: ["eight legs", "web", "crawling", "scary", "silk", "ceiling corner"] },
      { word: "Dolphin", hints: ["smart", "ocean", "jumps", "clicking", "friendly", "fin"] },
    ],
  },
  {
    name: "Foods",
    words: [
      { word: "Pizza", hints: ["round", "cheese", "dough", "italian", "slices", "oven"] },
      { word: "Chocolate", hints: ["sweet", "brown", "melts", "cocoa", "dessert", "bar"] },
      { word: "Sushi", hints: ["rice", "raw", "japan", "rolls", "seaweed", "chopsticks"] },
      { word: "Pancakes", hints: ["breakfast", "syrup", "flat", "stack", "flipping", "fluffy"] },
      { word: "Popcorn", hints: ["cinema", "butter", "popping", "kernels", "salty", "bucket"] },
      { word: "Ice Cream", hints: ["cold", "cone", "scoop", "summer", "melts", "flavors"] },
      { word: "Burger", hints: ["bun", "patty", "fast food", "ketchup", "fries", "grill"] },
      { word: "Watermelon", hints: ["summer", "seeds", "red inside", "green outside", "juicy", "heavy"] },
    ],
  },
  {
    name: "Places",
    words: [
      { word: "Beach", hints: ["sand", "sun", "towel", "waves", "summer", "umbrella"] },
      { word: "Library", hints: ["quiet", "books", "shelves", "reading", "silence", "borrowing"] },
      { word: "Airport", hints: ["luggage", "gates", "flying", "tickets", "delays", "security"] },
      { word: "Circus", hints: ["clowns", "tent", "acrobats", "tickets", "animals", "show"] },
      { word: "Hospital", hints: ["doctors", "white", "emergency", "beds", "nurses", "waiting room"] },
      { word: "School", hints: ["teachers", "homework", "bell", "classes", "desks", "breaks"] },
      { word: "Cinema", hints: ["popcorn", "big screen", "dark", "tickets", "seats", "trailers"] },
      { word: "Desert", hints: ["hot", "sand", "camels", "dry", "dunes", "cactus"] },
    ],
  },
  {
    name: "People & Jobs",
    words: [
      { word: "Firefighter", hints: ["hose", "ladder", "smoke", "hero", "red truck", "helmet"] },
      { word: "Pirate", hints: ["ship", "treasure", "parrot", "eyepatch", "sea", "map"] },
      { word: "Astronaut", hints: ["space", "helmet", "floating", "rocket", "stars", "suit"] },
      { word: "Barber", hints: ["scissors", "chair", "mirror", "hair", "razor", "trim"] },
      { word: "Teacher", hints: ["school", "whiteboard", "homework", "students", "grades", "lessons"] },
      { word: "Police Officer", hints: ["uniform", "badge", "siren", "handcuffs", "patrol", "law"] },
      { word: "Chef", hints: ["kitchen", "tall hat", "knives", "recipes", "tasting", "restaurant"] },
      { word: "Clown", hints: ["circus", "red nose", "funny", "makeup", "balloons", "wig"] },
    ],
  },
  {
    name: "Sports & Games",
    words: [
      { word: "Football", hints: ["goal", "ball", "field", "referee", "world cup", "kicking"] },
      { word: "Basketball", hints: ["hoop", "dribbling", "tall players", "court", "orange ball", "dunking"] },
      { word: "Chess", hints: ["board", "king", "strategy", "black and white", "checkmate", "pieces"] },
      { word: "Swimming", hints: ["pool", "water", "goggles", "strokes", "laps", "wet"] },
      { word: "Boxing", hints: ["gloves", "ring", "punching", "rounds", "knockout", "bell"] },
      { word: "Tennis", hints: ["racket", "net", "serving", "yellow ball", "court", "grunting"] },
      { word: "Skiing", hints: ["snow", "mountain", "poles", "winter", "slopes", "lift"] },
      { word: "Hide and Seek", hints: ["counting", "hiding", "seeking", "kids", "found you", "ready or not"] },
    ],
  },
];
