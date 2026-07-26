// ============================================================
//  QUESTIONS FILE — question pairs for the Faker gamemode.
//
//  Adding a question = add one line inside a category's `questions`.
//  Adding a category = copy a { name: ..., questions: [...] } block.
//
//  Everyone gets `main` — except the Faker, who secretly gets `odd`.
//  Keep the two questions in the SAME answer domain (both produce a
//  food, a number, a name…) so the Faker's answer can blend in.
// ============================================================

export type QuestionEntry = {
  main: string;
  odd: string;
};

export type QuestionCategory = {
  name: string;
  questions: QuestionEntry[];
};

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    name: "Food & Drink",
    questions: [
      { main: "Name a food you could eat every single day.", odd: "Name a food you never want to eat again." },
      { main: "What's the best pizza topping?", odd: "What's the worst pizza topping?" },
      { main: "Name something you'd eat for breakfast.", odd: "Name something you'd eat at midnight." },
      { main: "What drink goes best with lunch?", odd: "What drink do you order at a café?" },
      { main: "Name a fruit.", odd: "Name a vegetable." },
      { main: "What's the best dessert?", odd: "What's the best snack?" },
      { main: "Name a food that's better homemade.", odd: "Name a food that's better from a restaurant." },
      { main: "What food smells amazing?", odd: "What food smells terrible?" },
      { main: "Name something you put in a sandwich.", odd: "Name something you put in a salad." },
      { main: "What's the best thing to grill?", odd: "What's the best thing to fry?" },
    ],
  },
  {
    name: "Everyday Life",
    questions: [
      { main: "How many hours do you sleep?", odd: "How many hours are you on your phone?" },
      { main: "Name an app you open every day.", odd: "Name an app you'd happily delete." },
      { main: "What do you do first thing in the morning?", odd: "What do you do last thing before bed?" },
      { main: "Name a chore you don't mind doing.", odd: "Name a chore you always avoid." },
      { main: "What's a good time to wake up on weekends?", odd: "What's a good time to go to sleep?" },
      { main: "Name something you always carry with you.", odd: "Name something you always lose." },
      { main: "Name a place you go every week.", odd: "Name a place you visit once a year." },
      { main: "What do you buy the moment it's on sale?", odd: "What wouldn't you buy even on sale?" },
      { main: "Name something in your fridge right now.", odd: "Name something in your bag right now." },
      { main: "How many minutes late is acceptable?", odd: "How many minutes early do you arrive?" },
    ],
  },
  {
    name: "Fun & Weird",
    questions: [
      { main: "Name an animal you'd want as a pet.", odd: "Name an animal you'd run away from." },
      { main: "What superpower would you choose?", odd: "What superpower would be the most annoying?" },
      { main: "Name something you'd bring to a desert island.", odd: "Name something you'd bring camping." },
      { main: "Name a job you'd love to try for a day.", odd: "Name a job you could never do." },
      { main: "What would you do with a million euros?", odd: "What would you do with a free weekend?" },
      { main: "Name something that's overrated.", odd: "Name something that's underrated." },
      { main: "Name a movie everyone should watch.", odd: "Name a movie that puts you to sleep." },
      { main: "What's a good name for a dog?", odd: "What's a good name for a boat?" },
      { main: "Name something scary.", odd: "Name something gross." },
      { main: "If you could time travel, which year?", odd: "Which year of your life was the best?" },
    ],
  },
  {
    name: "People & Party",
    questions: [
      { main: "Name a famous person you'd invite to dinner.", odd: "Name a famous person you'd avoid." },
      { main: "Who in this room is most likely to become famous?", odd: "Who in this room is always late?" },
      { main: "Who in this room would survive a zombie apocalypse?", odd: "Who in this room would get caught first?" },
      { main: "Name a quality you value in a friend.", odd: "Name a quality that annoys you in people." },
      { main: "Who in this room has the best laugh?", odd: "Who in this room laughs at their own jokes?" },
      { main: "Name a gift you'd love to receive.", odd: "Name a gift you'd immediately regift." },
      { main: "Who in this room checks their phone the most?", odd: "Who in this room replies the slowest?" },
      { main: "What age do you feel inside?", odd: "What age would you stay forever?" },
      { main: "Who in this room gives the best advice?", odd: "Who in this room gives the most chaotic advice?" },
      { main: "Name something that instantly makes you like someone.", odd: "Name something that instantly makes you suspicious of someone." },
    ],
  },
  {
    name: "Would You Rather",
    questions: [
      { main: "Name something you would never do for money.", odd: "Name something you would do for a lot of money." },
      { main: "What would you do with a free day tomorrow?", odd: "What would you do with a free week tomorrow?" },
      { main: "Which chore would you happily never do again?", odd: "Which chore do you secretly enjoy?" },
      { main: "Name a country you would move to.", odd: "Name a country you would only visit." },
      { main: "What would you spend your last 20 euros on?", odd: "What would you spend your first million on?" },
      { main: "Name a superpower you would actually use daily.", odd: "Name a superpower that sounds useless." },
      { main: "Which decade would you live in?", odd: "Which decade would you avoid?" },
      { main: "Name a job you would be surprisingly good at.", odd: "Name a job you would be terrible at." },
      { main: "What would you never share with a friend?", odd: "What would you always share with a friend?" },
      { main: "Name something worth waiting in line for.", odd: "Name something never worth waiting in line for." },
    ],
  },
  {
    name: "Movies & Music",
    questions: [
      { main: "Name a film you could rewatch forever.", odd: "Name a film you would never watch again." },
      { main: "Which song always gets you dancing?", odd: "Which song always makes you sad?" },
      { main: "Name an actor everyone likes.", odd: "Name an actor who is a bit overrated." },
      { main: "What is the perfect movie snack?", odd: "What is the worst movie snack?" },
      { main: "Name a series with a great ending.", odd: "Name a series that went on too long." },
      { main: "Which song would you sing at karaoke?", odd: "Which song should nobody sing at karaoke?" },
      { main: "Name a cartoon you loved as a kid.", odd: "Name a cartoon you find annoying now." },
      { main: "Which movie character would you be friends with?", odd: "Which movie character would annoy you?" },
      { main: "Name a band worth seeing live.", odd: "Name a band better on the record." },
      { main: "What film made you cry?", odd: "What film made you laugh the hardest?" },
    ],
  },
  {
    name: "Deep-ish",
    questions: [
      { main: "What makes a good friend?", odd: "What makes a good neighbour?" },
      { main: "Name something you have changed your mind about.", odd: "Name something you will never change your mind about." },
      { main: "What is worth being late for?", odd: "What is never worth being late for?" },
      { main: "Name a small thing that makes your day.", odd: "Name a small thing that ruins your day." },
      { main: "What advice would you give your younger self?", odd: "What advice from your younger self would you ignore?" },
      { main: "Name a habit you are proud of.", odd: "Name a habit you would like to drop." },
      { main: "What do you notice first about a person?", odd: "What do you remember about a person a week later?" },
      { main: "Name something people say too often.", odd: "Name something people should say more often." },
      { main: "What is the best part of getting older?", odd: "What is the worst part of getting older?" },
      { main: "Name something you would never lend out.", odd: "Name something you would lend to anyone." },
    ],
  },
  {
    name: "Home & Habits",
    questions: [
      { main: "Name something always in your fridge.", odd: "Name something never in your fridge." },
      { main: "What is the first thing you do in the morning?", odd: "What is the last thing you do at night?" },
      { main: "Name a room that is always messy.", odd: "Name a room that is always tidy." },
      { main: "What do you always forget to buy?", odd: "What do you always buy too much of?" },
      { main: "Name an app you open every day.", odd: "Name an app you should delete." },
      { main: "What is your go-to lazy dinner?", odd: "What is your go-to fancy dinner?" },
      { main: "Name a thing you own too many of.", odd: "Name a thing you never have enough of." },
      { main: "What is on your desk right now?", odd: "What is under your bed right now?" },
      { main: "Name a chore you do immediately.", odd: "Name a chore you put off for days." },
      { main: "What sound wakes you up?", odd: "What sound puts you to sleep?" },
    ],
  },
];
