// ============================================================
//  PAIRS FILE — word pairs for the "Odd One Out" gamemode.
//
//  Adding a pair = add one line inside a category's `pairs`.
//  Adding a category = copy a { name: ..., pairs: [...] } block.
//
//  Everyone gets the same word — except one player, who secretly
//  gets the other word of the pair. Keep the two words similar
//  enough that clues overlap!
//
//  (The game randomly decides which of the two words goes to the
//  group and which goes to the Odd One Out.)
// ============================================================

export type PairEntry = {
  main: string;
  odd: string;
};

export type PairCategory = {
  name: string;
  pairs: PairEntry[];
};

export const PAIR_CATEGORIES: PairCategory[] = [
  {
    name: "Food & Drink",
    pairs: [
      { main: "Coffee", odd: "Tea" },
      { main: "Pancakes", odd: "Waffles" },
      { main: "Burger", odd: "Hot Dog" },
      { main: "Ketchup", odd: "Mayonnaise" },
      { main: "Ice Cream", odd: "Milkshake" },
      { main: "Lemonade", odd: "Orange Juice" },
      { main: "Chocolate", odd: "Caramel" },
      { main: "Soup", odd: "Stew" },
      { main: "Beer", odd: "Wine" },
      { main: "Cheese", odd: "Butter" },
      { main: "Milk", odd: "Yogurt" },
      { main: "Jam", odd: "Honey" },
      { main: "Chips", odd: "Popcorn" },
      { main: "Pizza", odd: "Pasta" },
      { main: "Rice", odd: "Noodles" },
      { main: "Muffin", odd: "Cupcake" },
    ],
  },
  {
    name: "Animals",
    pairs: [
      { main: "Lion", odd: "Tiger" },
      { main: "Crocodile", odd: "Alligator" },
      { main: "Dolphin", odd: "Shark" },
      { main: "Bee", odd: "Wasp" },
      { main: "Frog", odd: "Toad" },
      { main: "Horse", odd: "Donkey" },
      { main: "Rabbit", odd: "Hamster" },
      { main: "Owl", odd: "Eagle" },
      { main: "Cat", odd: "Dog" },
      { main: "Penguin", odd: "Ostrich" },
      { main: "Sheep", odd: "Goat" },
      { main: "Duck", odd: "Goose" },
      { main: "Butterfly", odd: "Moth" },
      { main: "Seal", odd: "Walrus" },
      { main: "Fox", odd: "Wolf" },
      { main: "Mouse", odd: "Rat" },
    ],
  },
  {
    name: "Places",
    pairs: [
      { main: "Beach", odd: "Pool" },
      { main: "Cinema", odd: "Theater" },
      { main: "Cafe", odd: "Restaurant" },
      { main: "Hotel", odd: "Hostel" },
      { main: "School", odd: "University" },
      { main: "Gym", odd: "Stadium" },
      { main: "Supermarket", odd: "Mall" },
      { main: "Forest", odd: "Jungle" },
      { main: "Mountain", odd: "Volcano" },
      { main: "Park", odd: "Garden" },
      { main: "Bridge", odd: "Tunnel" },
      { main: "Village", odd: "Town" },
      { main: "Balcony", odd: "Terrace" },
      { main: "Attic", odd: "Basement" },
      { main: "Lake", odd: "Pond" },
    ],
  },
  {
    name: "Everyday",
    pairs: [
      { main: "Shower", odd: "Bath" },
      { main: "Pen", odd: "Pencil" },
      { main: "Sofa", odd: "Armchair" },
      { main: "Phone", odd: "Tablet" },
      { main: "Bus", odd: "Tram" },
      { main: "Sneakers", odd: "Boots" },
      { main: "Umbrella", odd: "Raincoat" },
      { main: "Piano", odd: "Guitar" },
      { main: "Clock", odd: "Watch" },
      { main: "Toothbrush", odd: "Hairbrush" },
      { main: "Towel", odd: "Blanket" },
      { main: "Mirror", odd: "Window" },
      { main: "Ladder", odd: "Stairs" },
      { main: "Candle", odd: "Lamp" },
      { main: "Backpack", odd: "Suitcase" },
      { main: "Scarf", odd: "Tie" },
    ],
  },
  {
    name: "Sports & Games",
    pairs: [
      { main: "Football", odd: "Rugby" },
      { main: "Tennis", odd: "Badminton" },
      { main: "Swimming", odd: "Diving" },
      { main: "Chess", odd: "Checkers" },
      { main: "Boxing", odd: "Wrestling" },
      { main: "Skiing", odd: "Snowboarding" },
      { main: "Marathon", odd: "Sprint" },
      { main: "Referee", odd: "Coach" },
      { main: "Stadium", odd: "Gym" },
      { main: "Medal", odd: "Trophy" },
      { main: "Goalkeeper", odd: "Striker" },
      { main: "Basketball", odd: "Volleyball" },
    ],
  },
  {
    name: "Travel",
    pairs: [
      { main: "Airport", odd: "Train station" },
      { main: "Hotel", odd: "Hostel" },
      { main: "Passport", odd: "Ticket" },
      { main: "Suitcase", odd: "Backpack" },
      { main: "Map", odd: "Compass" },
      { main: "Taxi", odd: "Bus" },
      { main: "Beach", odd: "Lake" },
      { main: "Mountain", odd: "Hill" },
      { main: "Souvenir", odd: "Postcard" },
      { main: "Tent", odd: "Cabin" },
      { main: "Cruise", odd: "Ferry" },
      { main: "Tour guide", odd: "Receptionist" },
    ],
  },
  {
    name: "Home & Tech",
    pairs: [
      { main: "Laptop", odd: "Tablet" },
      { main: "Phone", odd: "Smartwatch" },
      { main: "Headphones", odd: "Speaker" },
      { main: "Fridge", odd: "Freezer" },
      { main: "Oven", odd: "Microwave" },
      { main: "Washing machine", odd: "Dishwasher" },
      { main: "Remote", odd: "Keyboard" },
      { main: "Charger", odd: "Battery" },
      { main: "Printer", odd: "Scanner" },
      { main: "Camera", odd: "Binoculars" },
      { main: "Vacuum", odd: "Broom" },
      { main: "Router", odd: "Modem" },
    ],
  },
  {
    name: "School & Work",
    pairs: [
      { main: "Teacher", odd: "Professor" },
      { main: "Homework", odd: "Exam" },
      { main: "Notebook", odd: "Diary" },
      { main: "Pen", odd: "Pencil" },
      { main: "Meeting", odd: "Interview" },
      { main: "Boss", odd: "Manager" },
      { main: "Salary", odd: "Bonus" },
      { main: "Office", odd: "Classroom" },
      { main: "Deadline", odd: "Schedule" },
      { main: "Break", odd: "Holiday" },
      { main: "Diploma", odd: "Certificate" },
      { main: "Colleague", odd: "Classmate" },
    ],
  },
  {
    name: "Nature & Weather",
    pairs: [
      { main: "Rain", odd: "Snow" },
      { main: "Storm", odd: "Wind" },
      { main: "River", odd: "Stream" },
      { main: "Forest", odd: "Park" },
      { main: "Sun", odd: "Moon" },
      { main: "Rose", odd: "Tulip" },
      { main: "Sand", odd: "Mud" },
      { main: "Fog", odd: "Smoke" },
      { main: "Island", odd: "Peninsula" },
      { main: "Volcano", odd: "Geyser" },
      { main: "Rainbow", odd: "Sunset" },
      { main: "Desert", odd: "Savanna" },
    ],
  },
  {
    name: "Movies & Music",
    pairs: [
      { main: "Actor", odd: "Singer" },
      { main: "Cinema", odd: "Theatre" },
      { main: "Concert", odd: "Festival" },
      { main: "Guitar", odd: "Violin" },
      { main: "Drums", odd: "Piano" },
      { main: "Comedy", odd: "Cartoon" },
      { main: "Horror", odd: "Thriller" },
      { main: "Popcorn", odd: "Nachos" },
      { main: "Album", odd: "Playlist" },
      { main: "Trailer", odd: "Poster" },
      { main: "Superhero", odd: "Villain" },
      { main: "Dance", odd: "Karaoke" },
    ],
  },
];
