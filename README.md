# IMP — party games

Local pass-and-play imposter word game. One phone, no internet, no accounts.

## How a round plays

1. **Setup (home screen)** — pick game mode, players (names + colors),
   categories and roles, then hit START.
2. **Card reveal** — everyone taps THEIR OWN card in secret, holds the card to
   flip it (the screen takes on the role's color), releases to hide, taps
   "Got it" and passes the phone on.
3. **Discussion** — everyone says one word/association in turn (optional
   timer, toggle it in ⚙️ settings).
4. **Vote & reveal** — point fingers, reveal all roles and the word.

## Roles

- **The Imposter** — doesn't know the word, only one random hint. Wins by not
  getting voted out (or by guessing the word when accused).
- **The Jester** — knows the word, wins if the group votes them out.
- **The Helper** — knows the word and who the imposter is; wins with the
  imposter unless the helper was voted out.
- **Custom roles** — add your own in the app (name, description, color,
  whether they see the word).

## Adding words

Built-in words live in [data/words.ts](data/words.ts), grouped into categories:

```ts
{ word: "Pizza", hints: ["round", "cheese", "dough", "italian", "slices", "oven"] },
```

Add a line inside a category = new word. Copy a category block = new category.
Custom categories can also be created inside the app (stored on the phone).

## Running

```
npm install
npx expo start          # then open in Expo Go (project uses SDK 56)
adb reverse tcp:8081 tcp:8081   # if testing over USB instead of Wi-Fi
npm run web             # quick preview in the browser
```

## Code layout

- `App.tsx` — screen state machine, persistence, Android back handling
- `data/words.ts` — built-in categories & words (edit this!)
- `src/game/` — types, roles, round engine; future gamemodes live here
- `src/screens/` — home / reveal / discussion / result + `editors/` modals
- `src/components/` — shared UI (buttons, chips, color picker, modal shell)
- `src/theme.ts` — colors & spacing
- `src/storage.ts` — AsyncStorage helpers (players, roles, categories, settings)
