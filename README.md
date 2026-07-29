# IMP — party games

Party games for a group. No accounts to make, nothing to sign up for.

Five gamemodes: **IMP Classic** (the imposter doesn't know the word),
**Odd One Out** (one player's word is slightly different), **Mafia** (the app
deals the roles, you play it out loud), **Bluff** (a 2-player duel) and
**Faker** (one player answers a slightly different question).

Two ways to play, picked at the top of the home screen:

- **1 phone** — pass-and-play, everyone taps their own card.
- **Every phone** — each player on their own phone, over the internet or
  over a local Wi-Fi with no internet at all.

## Every phone

Type your name, pick a colour, then **HOST** or **JOIN**. The host's phone is
the game server: it shows a 4-digit room code (and a QR code behind the small
QR button), picks the mode/categories/roles, can kick players, and drives the
round. Everyone else joins by typing the code or scanning the QR.

There are two ways for the phones to reach each other, picked with the
**Internet / No internet** chips:

- **Internet** — everyone meets in a Firebase Realtime Database, so an
  iPhone on the web version and an Android with the app play together and
  nobody has to be in the same place. The database is only a postbox; the
  host's phone still runs the game. The room QR is a plain link
  (`…/imp/?join=1234`) that any phone camera can open.
- **No internet** — phone-to-phone over the local network (TCP + UDP
  discovery), no server at all. Installed app only, since browsers have no
  raw sockets. Same Wi-Fi for everyone; a phone hotspot works too.

Per mode: cards are dealt privately to each phone → the app announces who
speaks first → everyone votes on their own phone → the reveal shows who was
what and who won. Mafia only deals roles and lets the host reveal them at the
end; Faker shows the shared question first and the answers after. The flow is
the same either way — only the pipe differs.

## The online rooms (Firebase)

A room is a small tree in the Realtime Database:

```
rooms/<code>/host            { uid, at } — removed the moment the host drops
rooms/<code>/peers/<uid>     one entry per player, removed on disconnect
rooms/<code>/toHost/<id>     messages for the host, deleted once read
rooms/<code>/toPeer/<uid>/…  messages for one player
```

Every phone signs in anonymously, so each has an id — nobody types
anything, but [the rules](firebase/database.rules.json) can then keep a
private card readable only by the phone it was dealt to, and the players'
answers readable only by the host. Presence (`onDisconnect`) is what tells
the room somebody left.

Setting up a project: create one in the Firebase console, add a Realtime
Database in **europe-west1**, turn on **Anonymous** sign-in, paste the
rules from `firebase/database.rules.json`, and copy the web config into
[src/net/firebase.ts](src/net/firebase.ts).

### Testing it

Both test suites run against the local emulator (which needs a JDK 21+ on
the PATH — the Android build ships an older one, so point `JAVA_HOME` at a
newer JDK for these):

```
npm run emulator      # database + auth emulators
npm run test:room     # a host and three players: cards, votes, kick, quit
npm run test:rules    # tries to cheat and expects to be refused
```

## Running

```
npm install
npx expo start          # dev; the net modes need a real build, not Expo Go
npm run android         # build + run on a connected phone
npm run apk             # release APK (+ optional install over adb)
npm run web             # quick browser preview
```

## Web version (installable PWA)

`npm run web:build` exports the site into `dist/` — a real installable web
app: home-screen icon, fullscreen, and a service worker that caches the whole
game so it also runs with no connection.

```
npm run web:build       # export into dist/
npm run web:serve       # serve it locally on :8088 (also reachable over Wi-Fi)
npm run web:deploy      # build + push dist/ to the gh-pages branch
```

### Publishing to GitHub Pages

1. Create a repo on GitHub (public — free Pages needs that) and connect it:
   `git remote add origin https://github.com/<user>/<repo>.git`
2. Set the path in [app.json](app.json): `experiments.baseUrl` must be
   `"/<repo>"`. Use `""` if the repo is named `<user>.github.io` (site at the
   domain root).
3. `npm run web:deploy`
4. On GitHub: **Settings → Pages → Branch: `gh-pages` / root**.
5. Open `https://<user>.github.io/<repo>/` on the phone → Share → **Add to
   Home Screen**.

`public/.nojekyll` is there because GitHub Pages otherwise drops the
`_expo/` folder.

### APK size

The release APK ships **arm64-v8a and armeabi-v7a only** — the flag lives in
`apk:build` and in [scripts/build-apk.ps1](scripts/build-apk.ps1):

```
-PreactNativeArchitectures=arm64-v8a,armeabi-v7a
```

x86 and x86_64 are emulator-only and were adding ~45 MB of native libraries
that no phone ever loads. Add them back to that flag if you ever need to run
a *release* build on an emulator (debug builds are unaffected).

What is left is mostly unavoidable: the two ARM library sets, and ~5 MB per
architecture of Google's ML Kit barcode scanner, which comes with
`expo-camera` and is what reads the room QR code.

The Java/Kotlin side (~33 MB of `.dex`) can be shrunk further with R8 by
building with `-Pandroid.enableMinifyInReleaseBuilds=true
-Pandroid.enableShrinkResourcesInReleaseBuilds=true`. That is off by default
because minification can break things that are only found at runtime — try it
on a build you are willing to test properly.

## Shipping a new APK (in-app updates)

The web version updates itself — the service worker picks up a new build on
the next visit. The installed Android app cannot, so it asks: on launch it
reads the repo's **latest GitHub release**, and if the tag is newer than the
version it is running, it offers to download the APK and hand it to Android's
installer. **Later** just closes it, and the next launch asks again.

The order matters — the APK you attach must already carry the new version,
because the app compares the release tag against its own `versionName`:

1. Bump `expo.version` in [app.json](app.json) (e.g. `1.0.0` → `1.0.1`).
2. `npx expo prebuild --platform android` — writes the version into the
   native project.
3. `npm run apk` — builds `android/app/build/outputs/apk/release/app-release.apk`.
4. Publish a release whose **tag equals that version** and attach the APK:

```bash
gh release create v1.0.1 android/app/build/outputs/apk/release/app-release.apk --title "1.0.1" --notes "What changed"
```

The release body is shown in the prompt, so it is worth a line about what
changed. Draft and pre-releases are skipped, as is a release with no `.apk`
attached — so a half-finished release never reaches anyone.

Installing needs the `REQUEST_INSTALL_PACKAGES` permission (already in
[app.json](app.json)); the first time, Android will also ask the user to allow
installs from IMP. The repo the app checks is set in
[src/update/appUpdate.ts](src/update/appUpdate.ts) (`RELEASE_API`).

## Adding content

Built-in content lives in `data/`, grouped into categories:

```ts
{ word: "Pizza", hints: ["round", "cheese", "dough", "italian", "slices", "oven"] },
```

- [data/words.ts](data/words.ts) — words + hints (IMP Classic, Bluff)
- [data/pairs.ts](data/pairs.ts) — word pairs (Odd One Out)
- [data/questions.ts](data/questions.ts) — question pairs (Faker)
- `*-sr.ts` next to each — the Serbian sets
- [data/howto.ts](data/howto.ts) — the "?" how-to-play texts

Add a line inside a category = new entry. Copy a category block = new
category. Custom categories and roles can also be made inside the app (stored
on the phone).

## Code layout

- `App.tsx` — screen state machine, persistence, Android back handling
- `src/game/` — types, roles and the per-mode round engines
- `src/net/` — multiplayer: `protocol.ts` (wire format), `room.ts`
  (host-authoritative game state), `transport.ts` (the interface both ways
  of connecting implement, plus an in-memory mock), `FirebaseTransport.ts`
  (online), `TcpTransport.ts` (local Wi-Fi, no internet)
- `src/screens/` — one-phone screens, `net/` for local multiplayer,
  `setup/GameSetup.tsx` shared by the home screen and the host's lobby,
  `editors/` for the category/role/player modals
- `src/components/` — shared UI (buttons, chips, color picker, modal shell)
- `src/theme.ts` — colors & spacing
- `src/i18n.ts` — all strings, English + Serbian
- `public/` — the web shell: PWA `index.html`, `manifest.json`, `sw.js`
