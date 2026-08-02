// ============================================================
//  WORDS FILE — built-in categories and their words.
//
//  Adding a word  = add one line inside a category's `words`.
//  Adding a category = copy a { name: ..., words: [...] } block.
//
//  Normal players see the word; the imposter sees ONE random hint.
//
//  WHAT MAKES A GOOD HINT
//  The imposter has to say ONE word out loud and sound like they know
//  the secret word. So the hint has to be something you can actually
//  say:
//
//    good   Cave -> "dark", "echo", "bats", "rock"
//    bad    Cave -> "cold"
//
//  Rules of thumb:
//   • a concrete thing, place, part or action — usually a noun
//   • NOT a mood or an abstraction ("honestly", "the end", "someone
//     else's", "forgotten") — there is nothing to say from those
//   • ordinary enough that an innocent player might say the same
//     thing, because that is exactly how the imposter hides
//   • not so precise that it hands the word over
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
      { word: "Umbrella", hints: ["rain", "handle", "folds up", "wind", "doorway"] },
      { word: "Guitar", hints: ["strings", "stage", "chords", "case", "song"] },
      { word: "Mirror", hints: ["reflection", "bathroom", "glass", "frame", "hair"] },
      { word: "Backpack", hints: ["shoulders", "school", "zip", "books", "hiking"] },
      { word: "Candle", hints: ["wax", "flame", "birthday", "dark", "wick"] },
      { word: "Scissors", hints: ["cutting", "paper", "blades", "barber", "two handles"] },
      { word: "Clock", hints: ["time", "hands", "wall", "alarm", "ticking"] },
      { word: "Pillow", hints: ["sleep", "bed", "feathers", "head", "case"] },
      { word: "Toothbrush", hints: ["bathroom", "bristles", "morning", "paste", "two minutes"] },
      { word: "Ladder", hints: ["height", "rungs", "climbing", "garage", "painting"] },
      { word: "Telescope", hints: ["stars", "lens", "night", "tripod", "far away"] },
      { word: "Wallet", hints: ["money", "cards", "pocket", "leather", "ID"] },
      { word: "Balloon", hints: ["air", "party", "pops", "string", "helium"] },
      { word: "Trampoline", hints: ["bouncing", "garden", "springs", "net", "kids"] },
      { word: "Refrigerator", hints: ["cold", "kitchen", "food", "door", "humming"] },
      { word: "Skateboard", hints: ["wheels", "ramp", "park", "tricks", "deck"] },
      { word: "Compass", hints: ["north", "needle", "map", "hiking", "direction"] },
      { word: "Piano", hints: ["keys", "black and white", "pedals", "heavy", "lessons"] },
      { word: "Toilet", hints: ["bathroom", "flush", "seat", "paper", "plumber"] },
      { word: "Vacuum Cleaner", hints: ["carpet", "loud", "dust", "cable", "Sunday"] },
      { word: "Sunglasses", hints: ["sun", "lenses", "beach", "frames", "lost"] },
      { word: "Tent", hints: ["camping", "poles", "zip", "sleeping bag", "pegs"] },
    ],
  },
  {
    name: "Animals",
    words: [
      { word: "Elephant", hints: ["trunk", "tusks", "huge", "Africa", "ears"] },
      { word: "Penguin", hints: ["ice", "swims", "waddles", "colony", "black and white"] },
      { word: "Shark", hints: ["sea", "teeth", "fin", "hunter", "deep"] },
      { word: "Kangaroo", hints: ["jumps", "pouch", "Australia", "tail", "hind legs"] },
      { word: "Owl", hints: ["night", "tree", "hoot", "turns its head", "big eyes"] },
      { word: "Snake", hints: ["crawls", "venom", "sheds skin", "hisses", "no legs"] },
      { word: "Spider", hints: ["web", "eight legs", "corner", "flies", "bath"] },
      { word: "Dolphin", hints: ["sea", "clever", "jumps", "pod", "fin"] },
      { word: "Lion", hints: ["mane", "roar", "savanna", "king", "hunt"] },
      { word: "Giraffe", hints: ["neck", "tall", "spots", "leaves", "savanna"] },
      { word: "Crocodile", hints: ["river", "teeth", "jaws", "still", "scales"] },
      { word: "Bee", hints: ["honey", "flower", "sting", "hive", "buzz"] },
      { word: "Octopus", hints: ["eight arms", "ink", "sea", "suckers", "clever"] },
      { word: "Turtle", hints: ["shell", "slow", "pulls its head in", "long-lived", "beach"] },
      { word: "Wolf", hints: ["pack", "forest", "howl", "moon", "teeth"] },
      { word: "Bat", hints: ["night", "cave", "wings", "upside down", "sonar"] },
      { word: "Horse", hints: ["riding", "horseshoe", "stable", "mane", "race"] },
      { word: "Chicken", hints: ["eggs", "farm", "feathers", "clucking", "coop"] },
      { word: "Monkey", hints: ["bananas", "trees", "climbing", "tail", "zoo"] },
      { word: "Frog", hints: ["pond", "jumps", "green", "croak", "tadpole"] },
      { word: "Hedgehog", hints: ["spines", "curls up", "night", "garden", "small"] },
      { word: "Whale", hints: ["ocean", "huge", "blowhole", "song", "deep"] },
    ],
  },
  {
    name: "Foods",
    words: [
      { word: "Pizza", hints: ["slices", "cheese", "oven", "delivery", "round"] },
      { word: "Chocolate", hints: ["sweet", "bar", "melts", "brown", "gift"] },
      { word: "Sushi", hints: ["rice", "raw fish", "chopsticks", "seaweed", "soy sauce"] },
      { word: "Pancakes", hints: ["pan", "flip", "syrup", "breakfast", "stack"] },
      { word: "Popcorn", hints: ["cinema", "pops", "salt", "bucket", "kernels"] },
      { word: "Ice Cream", hints: ["cold", "cone", "melts", "summer", "scoop"] },
      { word: "Burger", hints: ["bun", "patty", "fries", "ketchup", "bite"] },
      { word: "Watermelon", hints: ["seeds", "summer", "slice", "green outside", "juicy"] },
      { word: "Spaghetti", hints: ["long", "fork", "sauce", "boiling", "Italian"] },
      { word: "Taco", hints: ["shell", "folded", "filling", "salsa", "messy"] },
      { word: "Soup", hints: ["spoon", "hot", "bowl", "noodles", "ill"] },
      { word: "Cheese", hints: ["yellow", "grated", "mouse", "board", "smell"] },
      { word: "Banana", hints: ["peel", "yellow", "curved", "monkey", "bunch"] },
      { word: "Honey", hints: ["bees", "sticky", "jar", "sweet", "spoon"] },
      { word: "French Fries", hints: ["salt", "ketchup", "fried", "paper bag", "potato"] },
      { word: "Donut", hints: ["hole", "glaze", "sugar", "round", "coffee"] },
      { word: "Salad", hints: ["leaves", "bowl", "healthy", "dressing", "fork"] },
      { word: "Egg", hints: ["shell", "yolk", "pan", "breakfast", "boiled"] },
      { word: "Cake", hints: ["candles", "birthday", "slice", "icing", "oven"] },
      { word: "Kebab", hints: ["skewer", "grill", "wrap", "late night", "sauce"] },
      { word: "Strawberry", hints: ["red", "seeds", "cream", "summer", "basket"] },
      { word: "Coffee", hints: ["morning", "mug", "bitter", "beans", "awake"] },
    ],
  },
  {
    name: "Places",
    words: [
      { word: "Beach", hints: ["sand", "sea", "sun", "towel", "summer"] },
      { word: "Library", hints: ["books", "quiet", "shelves", "card", "study"] },
      { word: "Airport", hints: ["planes", "suitcase", "passport", "delay", "runway"] },
      { word: "Circus", hints: ["tent", "clown", "ring", "acrobats", "audience"] },
      { word: "Hospital", hints: ["doctors", "corridor", "waiting room", "beds", "ambulance"] },
      { word: "School", hints: ["board", "bell", "holidays", "pupils", "marks"] },
      { word: "Cinema", hints: ["screen", "popcorn", "dark", "ticket", "row"] },
      { word: "Desert", hints: ["sand", "heat", "camel", "dunes", "no water"] },
      { word: "Supermarket", hints: ["trolley", "aisles", "checkout", "queue", "shelves"] },
      { word: "Gym", hints: ["weights", "sweat", "membership", "mirrors", "machines"] },
      { word: "Church", hints: ["candles", "bell", "pews", "quiet", "Sunday"] },
      { word: "Prison", hints: ["bars", "guards", "cell", "sentence", "yard"] },
      { word: "Zoo", hints: ["cages", "animals", "tickets", "feeding", "children"] },
      { word: "Farm", hints: ["fields", "tractor", "animals", "barn", "early"] },
      { word: "Castle", hints: ["stone", "towers", "moat", "old", "king"] },
      { word: "Space Station", hints: ["orbit", "floating", "astronauts", "modules", "docking"] },
      { word: "Restaurant", hints: ["menu", "waiter", "bill", "table", "booking"] },
      { word: "Swimming Pool", hints: ["water", "lanes", "diving", "chlorine", "trunks"] },
      { word: "Mountain", hints: ["peak", "climb", "snow", "trail", "air"] },
      { word: "Museum", hints: ["exhibits", "do not touch", "guide", "halls", "old"] },
      { word: "Playground", hints: ["swings", "slide", "children", "sand", "park"] },
      { word: "Gas Station", hints: ["fuel", "pump", "coffee", "motorway", "receipt"] },
    ],
  },
  {
    name: "People & Jobs",
    words: [
      { word: "Firefighter", hints: ["hose", "fire", "helmet", "siren", "ladder"] },
      { word: "Pirate", hints: ["ship", "treasure", "parrot", "flag", "eye patch"] },
      { word: "Astronaut", hints: ["space", "suit", "helmet", "launch", "floating"] },
      { word: "Barber", hints: ["scissors", "hair", "chair", "mirror", "shave"] },
      { word: "Teacher", hints: ["board", "pupils", "marks", "chalk", "homework"] },
      { word: "Police Officer", hints: ["uniform", "fine", "patrol", "station", "badge"] },
      { word: "Chef", hints: ["kitchen", "pans", "recipe", "hat", "salt"] },
      { word: "Clown", hints: ["red nose", "circus", "makeup", "big shoes", "balloons"] },
      { word: "Doctor", hints: ["coat", "prescription", "check-up", "stethoscope", "surgery"] },
      { word: "Ninja", hints: ["black", "silent", "shadows", "throwing star", "rooftop"] },
      { word: "King", hints: ["crown", "throne", "castle", "rules", "robe"] },
      { word: "Wizard", hints: ["staff", "spells", "beard", "book", "tower"] },
      { word: "Farmer", hints: ["fields", "tractor", "animals", "harvest", "boots"] },
      { word: "Pilot", hints: ["plane", "cockpit", "sky", "uniform", "landing"] },
      { word: "Singer", hints: ["microphone", "stage", "audience", "voice", "tour"] },
      { word: "Magician", hints: ["hat", "cards", "rabbit", "trick", "wand"] },
      { word: "Waiter", hints: ["tray", "order", "bill", "tables", "tip"] },
      { word: "Dentist", hints: ["teeth", "drill", "chair", "gloves", "appointment"] },
      { word: "Judge", hints: ["court", "verdict", "hammer", "law", "robe"] },
      { word: "Youtuber", hints: ["camera", "editing", "subscribers", "thumbnail", "upload"] },
      { word: "Soldier", hints: ["uniform", "barracks", "boots", "orders", "rifle"] },
      { word: "Detective", hints: ["clues", "case", "notebook", "questions", "suspect"] },
    ],
  },
  {
    name: "Sports & Games",
    words: [
      { word: "Football", hints: ["goal", "ball", "pitch", "fans", "penalty"] },
      { word: "Basketball", hints: ["hoop", "dribble", "court", "three points", "tall"] },
      { word: "Chess", hints: ["board", "pieces", "move", "checkmate", "queen"] },
      { word: "Swimming", hints: ["pool", "lanes", "stroke", "water", "cap"] },
      { word: "Boxing", hints: ["gloves", "ring", "round", "punch", "bell"] },
      { word: "Tennis", hints: ["racket", "net", "serve", "set", "yellow ball"] },
      { word: "Skiing", hints: ["snow", "slope", "poles", "lift", "mountain"] },
      { word: "Hide and Seek", hints: ["counting", "hiding", "found", "children", "garden"] },
      { word: "Golf", hints: ["club", "hole", "green", "tee", "buggy"] },
      { word: "Volleyball", hints: ["net", "spike", "block", "six players", "serve"] },
      { word: "Hockey", hints: ["ice", "puck", "stick", "goal", "helmet"] },
      { word: "Darts", hints: ["board", "throw", "pub", "bullseye", "points"] },
      { word: "Bowling", hints: ["pins", "lane", "ball", "strike", "shoes"] },
      { word: "Karate", hints: ["belt", "kick", "bow", "mat", "white suit"] },
      { word: "Poker", hints: ["cards", "chips", "bluff", "table", "bet"] },
      { word: "Video Games", hints: ["controller", "screen", "levels", "console", "hours"] },
      { word: "Fishing", hints: ["rod", "river", "patience", "bait", "catch"] },
      { word: "Ping Pong", hints: ["table", "bat", "small net", "ball", "fast"] },
    ],
  },
  {
    name: "Nature",
    words: [
      { word: "Volcano", hints: ["lava", "crater", "eruption", "ash", "mountain"] },
      { word: "Rainbow", hints: ["colours", "after rain", "arch", "sky", "seven"] },
      { word: "Thunderstorm", hints: ["thunder", "wind", "rain", "dark", "flash"] },
      { word: "Waterfall", hints: ["drop", "noise", "river", "rocks", "spray"] },
      { word: "Sun", hints: ["heat", "day", "sunset", "light", "summer"] },
      { word: "Moon", hints: ["night", "phases", "sky", "full", "silver"] },
      { word: "Snow", hints: ["white", "flakes", "winter", "snowball", "drifts"] },
      { word: "Forest", hints: ["trees", "path", "mushrooms", "shade", "quiet"] },
      { word: "River", hints: ["flow", "bridge", "bank", "fish", "current"] },
      { word: "Earthquake", hints: ["shaking", "cracks", "ground", "scale", "aftershock"] },
      { word: "Glacier", hints: ["ice", "slow", "valley", "melting", "blue"] },
      { word: "Cave", hints: ["dark", "echo", "rock", "bats", "entrance"] },
      { word: "Iceberg", hints: ["floating", "ice", "mostly underwater", "ship", "cold sea"] },
      { word: "Fog", hints: ["cannot see", "morning", "damp", "thick", "driving"] },
      { word: "Tornado", hints: ["funnel", "wind", "lifts things", "warning", "plains"] },
      { word: "Lake", hints: ["still water", "shore", "boat", "fish", "mountains"] },
      { word: "Autumn", hints: ["leaves", "wind", "shorter days", "orange", "rain"] },
      { word: "Cloud", hints: ["sky", "white", "shapes", "rain", "plane"] },
      { word: "Wildfire", hints: ["smoke", "forest", "spreads", "helicopters", "dry"] },
      { word: "Cliff", hints: ["edge", "drop", "sea", "rock", "height"] },
    ],
  },
  {
    name: "Tech",
    words: [
      { word: "Robot", hints: ["machine", "programmed", "factory", "metal", "future"] },
      { word: "Smartphone", hints: ["screen", "calls", "pocket", "apps", "charging"] },
      { word: "Wifi", hints: ["password", "signal", "router", "internet", "weak"] },
      { word: "Drone", hints: ["flies", "camera", "propellers", "filming", "remote"] },
      { word: "Headphones", hints: ["music", "ears", "cable", "wireless", "tangled"] },
      { word: "Computer", hints: ["screen", "keyboard", "mouse", "work", "games"] },
      { word: "Camera", hints: ["photos", "lens", "flash", "tripod", "memory card"] },
      { word: "Electric Car", hints: ["charging", "quiet", "battery", "range", "plug"] },
      { word: "Rocket", hints: ["space", "launch", "fuel", "countdown", "high"] },
      { word: "Printer", hints: ["paper", "ink", "jams", "office", "copy"] },
      { word: "Keyboard", hints: ["letters", "typing", "keys", "computer", "space bar"] },
      { word: "Password", hints: ["secret", "forgotten", "login", "letters and numbers", "account"] },
      { word: "Selfie", hints: ["phone", "front camera", "pose", "posting", "group"] },
      { word: "Charger", hints: ["cable", "socket", "battery", "forgotten", "phone"] },
      { word: "Smartwatch", hints: ["wrist", "steps", "heart rate", "notifications", "charging"] },
      { word: "Video Call", hints: ["screen", "camera", "you are muted", "family", "connection"] },
      { word: "Game Console", hints: ["controller", "television", "disc", "playing", "sofa"] },
      { word: "Screenshot", hints: ["screen", "two buttons", "sending", "proof", "gallery"] },
      { word: "Speaker", hints: ["loud", "music", "bass", "party", "wireless"] },
      { word: "Search Engine", hints: ["typing", "results", "questions", "browser", "first page"] },
    ],
  },
  {
    name: "Clothes",
    words: [
      { word: "Trainers", hints: ["feet", "laces", "sport", "comfortable", "new"] },
      { word: "Jacket", hints: ["winter", "zip", "pockets", "cold", "hood"] },
      { word: "Jeans", hints: ["denim", "blue", "pockets", "zip", "everyday"] },
      { word: "T-shirt", hints: ["short sleeves", "cotton", "summer", "print", "washing"] },
      { word: "Hat", hints: ["head", "sun", "brim", "wool", "takes it off"] },
      { word: "Scarf", hints: ["neck", "winter", "wool", "long", "wrapped"] },
      { word: "Socks", hints: ["feet", "pair", "lost one", "wool", "hole"] },
      { word: "Shoes", hints: ["leather", "laces", "heel", "polished", "smart"] },
      { word: "Belt", hints: ["trousers", "buckle", "leather", "holes", "waist"] },
      { word: "Shirt", hints: ["buttons", "collar", "ironing", "smart", "sleeves"] },
      { word: "Dress", hints: ["smart", "length", "wedding", "summer", "cut"] },
      { word: "Hoodie", hints: ["hood", "comfortable", "cotton", "autumn", "at home"] },
      { word: "Gloves", hints: ["hands", "winter", "pair", "fingers", "driving"] },
      { word: "Slippers", hints: ["house", "doorway", "comfortable", "guest", "soft"] },
      { word: "Pyjamas", hints: ["sleep", "bed", "soft", "evening", "at home"] },
      { word: "Swimsuit", hints: ["beach", "pool", "summer", "wet", "sunbathing"] },
      { word: "Tie", hints: ["neck", "knot", "smart", "work", "gift"] },
      { word: "Coat", hints: ["long", "winter", "wool", "smart", "hanger"] },
      { word: "Shorts", hints: ["summer", "short", "heat", "sport", "knees"] },
      { word: "Bag", hints: ["shoulder", "carried", "things", "zip", "shopping"] },
    ],
  },
  {
    name: "Transport",
    words: [
      { word: "Airplane", hints: ["wings", "airport", "seatbelt", "clouds", "luggage"] },
      { word: "Train", hints: ["rails", "platform", "carriages", "timetable", "tunnel"] },
      { word: "Bicycle", hints: ["pedals", "chain", "two wheels", "helmet", "lock"] },
      { word: "Submarine", hints: ["underwater", "periscope", "deep", "crew", "hatch"] },
      { word: "Helicopter", hints: ["rotor", "hovers", "loud", "landing pad", "rescue"] },
      { word: "Motorcycle", hints: ["helmet", "two wheels", "engine", "leathers", "fast"] },
      { word: "Bus", hints: ["stop", "ticket", "driver", "seats", "route"] },
      { word: "Taxi", hints: ["meter", "address", "yellow", "fare", "back seat"] },
      { word: "Ship", hints: ["sea", "deck", "anchor", "port", "cabins"] },
      { word: "Tractor", hints: ["field", "big wheels", "farm", "slow", "trailer"] },
      { word: "Fire Truck", hints: ["red", "siren", "ladder", "hose", "crew"] },
      { word: "Hot Air Balloon", hints: ["basket", "burner", "slow", "sunrise", "colourful"] },
      { word: "Scooter", hints: ["standing", "small wheels", "city", "kick", "app"] },
      { word: "Ferry", hints: ["cars on board", "crossing", "deck", "port", "sea"] },
      { word: "Ambulance", hints: ["siren", "hospital", "stretcher", "blue lights", "paramedic"] },
      { word: "Cable Car", hints: ["mountain", "cable", "hanging", "skiers", "view"] },
    ],
  },
];
