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
];
