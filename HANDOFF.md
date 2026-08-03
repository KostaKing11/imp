# Handoff — start here

Paste the brief below into a fresh session. Everything in it was learned
the hard way; a cold session that skips it will re-discover the same
traps.

---

**Projekat:** IMP — party igra (Expo/React Native), radi kao web PWA i kao
Android APK.
Folder: `C:\Users\KOSTA\Desktop\IMP FINALLY` · repo `KostaKing11/imp` ·
sajt `kostaking11.github.io/imp`

**Prvi zadatak:** redizajniraj **home screen**. Trenutni je u redu ali
može mnogo bolje — hoću da izgleda kao prava moderna party igra. Posle
toga idemo redom kroz ostale ekrane (kartica sa ulogom, diskusija,
glasanje, otkrivanje, čekaonica, Skala, Uskladi se, Folirant, turnir,
podešavanja).

**Moj telefon je povezan kablom — koristi ga, ne nagađaj.** Snimci ekrana
u pregledaču NE rade u ovom okruženju, telefon je jedini način da vidiš
aplikaciju. Petlja traje oko minut:

```bash
npx expo prebuild --platform android
cd android && ./gradlew.bat assembleRelease "-PreactNativeArchitectures=arm64-v8a"
cd .. && adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell monkey -p com.kosta.imp -c android.intent.category.LAUNCHER 1
adb exec-out screencap -p > shot.png
```

Pa pročitaj `shot.png` alatom Read. Klikći sa `adb shell input tap X Y`
(ekran je 1080x2340). Ako Play Protect blokira instalaciju, na telefonu
izaberi **„Don't send"**.

**Zamke koje su već pronađene — ne ponavljaj ih:**

- Android-ov react-native-svg **odbacuje prozirnost iz `rgba()`** u
  `fill`/`stroke`/`stopColor` i boji punom bojom. Uvek `fillOpacity` /
  `strokeOpacity` / `stopOpacity`. Komponenta `Gradient` to već sama
  rešava.
- Aplikacija je edge-to-edge, pa `adjustResize` **ne radi** —
  `Screen.tsx` sam oduzima prostor tastature za celu aplikaciju. Ne
  dodavati to po ekranima.
- `Screen` već uvlači sadržaj za `spacing.md`. Apsolutno pozicionirana
  dugmad idu na `left: 0` / `right: 0`, ne `spacing.md`, inače je ekran
  nakrivo.

**Pre svakog objavljivanja:** `npm run test:net` — četiri test grupe, sve
moraju da prođu.

**Verzije:** `MAJOR.FEATURE.FIX` (piše i u `app.json`). Zadnji broj za
sitne popravke, srednji kad se nešto dodaje/prerađuje, prvi samo za
prepisivanje cele igre. Sad je **1.2.2**.

**Objavljivanje** (uradi i web i APK):

```bash
npm run web:build && npx gh-pages --nojekyll -d dist
gh release create vX.Y.Z <apk> --title "X.Y.Z" --notes "..."
```

APK **mora** imati isti potpis
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`
(proveri sa `apksigner verify --print-certs`), inače se update ne
instalira preko postojeće aplikacije.

**Kako hoću da radiš:** ne objašnjavaj mi koliko je zadatak veliki —
znam. Radi ekran po ekran, snimi pre i posle, i reci mi šta si tačno
promenio i šta nisi stigao.

---

## Where the UI pass got to

Two screens are done, both checked on the phone rather than guessed at:

- **Home** (1.2.1) — the category list was being cut through the middle
  by the start button instead of fading under it, and sections sat 32px
  apart on top of their own gaps, so only three of seven modes fitted.
- **Card hand-out** (1.2.2) — a four-player roster left the bottom third
  of the screen empty, and "tap to reveal" was printed under every name.

Still to go: the role card, discussion/timer, voting, the reveal, the
online lobby, Scale, Same Page, Faker, the tournament table, settings
and the editors.
