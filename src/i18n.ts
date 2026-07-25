import { RoleDef } from "./game/types";

// Simple app-wide translations. The language is set once by App and
// every screen reads strings through t()/tf() at render time.

export type Language = "en" | "sr";

let current: Language = "en";

export function getLanguage(): Language {
  return current;
}

export function setLanguage(lang: Language): void {
  current = lang;
}

const en = {
  // home
  gameMode: "Game mode",
  players: "Players",
  categories: "Categories",
  roles: "Roles",
  start: "START",
  howToPlay: "How to play",
  playerN: "Player {n}",
  errMinPlayers: "You need at least 3 active players.",
  errTooManyRoles: "Too many roles for {n} players.",
  errNoWords: "Turn on at least one category with words.",
  errNoPairs: "Turn on at least one category with pairs.",
  errBlefPlayers: "Bluff is for exactly 2 players — turn the rest off.",
  errNoQuestions: "Turn on at least one category with questions.",
  modeImp: "IMP Classic",
  modeOdd: "Odd One Out",
  modeMafia: "Mafia",
  modeBlef: "Bluff",
  modeFaker: "Faker",
  // settings
  settings: "Settings",
  discussionTimers: "Discussion timers",
  language: "Language",
  // reveal
  whoAreYou: "Who are you?",
  revealInstr: "Everyone taps THEIR OWN card in secret, then passes the phone on.",
  tapToReveal: "tap to reveal",
  holdToReveal: "HOLD TO REVEAL",
  holdCardInstr: "Hold the card to flip it. Release to hide.",
  nobodyLooking: "Make sure nobody else is looking 👀",
  gotIt: "Got it — hide my card",
  everyonesReady: "Everyone's ready",
  theWordIs: "The word is",
  yourOnlyClue: "Your only clue",
  imposterLabel: "Imposter: {names}",
  yourWordIs: "Your word is",
  oddCardNote: "One player has a slightly different word. Maybe it's you…",
  // discussion
  discussion: "Discussion",
  discussionInstr:
    "Going around the circle, everyone says one word or association related to the secret word. Then discuss — who sounded like they were bluffing?",
  discussionInstrOdd:
    "Going around the circle, everyone says ONE clue about their own word. Listen closely — one player's word is slightly different…",
  goesFirst: "{name} goes first",
  vote: "Vote",
  timesUp: "TIME'S UP!",
  tapToStart: "tap to start",
  // classic result
  pointFingers: "Point your fingers!",
  pointInstr: "On three, everyone points at who they think the imposter is.",
  guessInstr:
    "Accused of being the imposter? Try guessing the secret word out loud — if you nail it, you steal the win!",
  revealTheRoles: "Reveal the roles",
  theWordWas: "The word was",
  imposterWas: "The Imposter was",
  impostersWere: "The Imposters were",
  otherRoles: "Other roles",
  newRoundBtn: "New round",
  backToMenu: "Back to menu",
  // odd result
  oddPointInstr: "On three, everyone points at who they think has the different word.",
  revealOdd: "Reveal the Odd One Out",
  oddWas: "The Odd One Out was",
  everyoneHad: "Everyone had",
  playerHad: "{name} had",
  // blef
  yourClue: "Your clue",
  blefCardNote: "It might be the real word… or just a hint. Nobody tells you.",
  blefDiscussionInstr:
    "Taking turns, each player says {n} clues out loud about what they're holding. Listen closely — did they really know the word?",
  blefRevealBtn: "Reveal",
  blefPointInstr:
    "On three, both of you say whether you think the other had the WORD or just a HINT.",
  blefHadWord: "had the word",
  blefHadHint: "had a hint",
  // faker
  fakerPlayStyle: "Play style",
  fakerOnePhone: "One phone",
  fakerManyPhones: "Everyone's phone",
  passPhoneTo: "Pass the phone to",
  fakerTapQuestion: "I'm {name} — show my question",
  fakerYourQuestion: "Your question",
  fakerAnswerPlaceholder: "Type your answer…",
  fakerLockIn: "Lock in my answer",
  fakerAnswersTitle: "The answers",
  fakerAnswersInstr:
    "Read them out loud and discuss — whose answer feels a little off?",
  fakerRevealFaker: "Reveal the Faker",
  fakerPointInstr:
    "On three, everyone points at who they think got the different question.",
  fakerWas: "The Faker was",
  fakerCaughtText: "You caught the Faker! 🎉",
  fakerEscapedText: "Wrong pick — the Faker escaped!",
  fakerVoteTie: "It's a tie — the Faker slips away!",
  fakerMainQLabel: "Everyone's question",
  fakerOddQLabel: "The Faker's question",
  fakerVotesLabel: "Votes",
  // play style
  playStyle: "How are you playing?",
  onePhone: "1 phone",
  localMultiplayer: "Local multiplayer",
  // local multiplayer
  yourName: "Your name",
  hostGame: "HOST",
  joinGame: "JOIN",
  roomCode: "Room code",
  enterCode: "Room code",
  scanQr: "Scan QR code",
  qrTitle: "Scan to join",
  qrUnavailable: "The code is still starting up — use the 4 digits.",
  close: "Close",
  sameWifiHint: "Everyone on the same Wi-Fi. No internet needed.",
  netWebOnly:
    "Local multiplayer needs the installed app — a browser can't open a room. On the web version you play on one phone.",
  netModeOnline: "Internet",
  netModeLan: "Wi-Fi",
  onlineHint: "Works with iPhones too — everyone needs internet.",
  lanOnlyOnApp: "Wi-Fi rooms need the installed app.",
  relayFailed: "Can't reach the game server. Check your internet.",
  roomNotFound: "No room with that code.",
  roomFull: "That room is full.",
  joiningRoom: "Room {code} — type your name and tap JOIN.",
  qrScanHint: "Any phone camera can scan this.",
  playersCount: "Players ({n})",
  kickHint: "Tap a player to kick them out.",
  kickQ: "Kick player?",
  kickText: "{name} will be removed from the room.",
  kickedText: "The host removed you from the room.",
  hostLeft: "The host left the game.",
  hostFailed: "Couldn't open the room on this network.",
  cameraDenied: "Camera access is needed to scan the code.",
  leaveRoomText: "You will leave the room.",
  tooManyPlayers: "Too many players — this mode takes {n}.",
  errNetContent: "Check the categories and roles — the game can't be dealt.",
  readyCount: "{done}/{total} ready",
  waitingPlayers: "Waiting for the others…",
  waitingHostReveal: "The host reveals the roles when the game is over.",
  voteWhoImp: "Who is the Imposter?",
  voteWhoOdd: "Who had the different word?",
  voteWhoBlef: "Word or hint?",
  blefWordBtn: "WORD",
  blefHintBtn: "HINT",
  blefGuessLine: "{name} guessed: {guess}",
  blefNoGuess: "{name} didn't guess.",
  votedOutLine: "Voted out: {name}",
  backToLobbyBtn: "Back to lobby",
  impCaught: "The Imposter was voted out — the group wins! 🎉",
  impEscaped: "Wrong pick — the Imposter got away!",
  impTie: "It's a tie — the Imposter got away!",
  impJester: "The Jester got voted out — the Jester wins!",
  oddCaught: "You caught the Odd One Out! 🎉",
  oddEscaped: "Wrong pick — the Odd One Out got away!",
  oddTie: "It's a tie — the Odd One Out got away!",
  theQuestionWas: "The question was",
  questionFirstInstr: "This is what everyone got — except one of you.",
  showAnswersBtn: "Show the answers",
  howToNet:
    "LOCAL MULTIPLAYER: switch the play style at the top to \"Local multiplayer\", type your name and pick a colour. One of you presses HOST and reads out the 4-digit room code (or shows the QR code); everyone else presses JOIN. The host picks the mode, categories and roles, can kick anyone, and starts the game — from there everyone plays from their own phone. All you need is the same Wi-Fi; no internet.",
  joinBtn: "Join",
  lobbyTitle: "Lobby",
  waitingForHost: "Waiting for the host to start…",
  startGameBtn: "Start game",
  needMorePlayers: "Need at least {n} players.",
  answeredCount: "{done}/{total} answered",
  votedCount: "{done}/{total} voted",
  continueBtn: "Continue",
  waitingOthers: "Answer locked in — waiting for the others…",
  waitingOthersVote: "Vote cast — waiting for the others…",
  voteWhoNet: "Who got the different question?",
  playAgainBtn: "PLAY AGAIN",
  leaveBtn: "LEAVE",
  waitingHostAgain: "Waiting for the host to start the next round…",
  joinNextRound: "You'll join when the next round starts.",
  connecting: "Connecting…",
  joinFailed: "Couldn't find that room. Same Wi-Fi or hotspot?",
  connectionLost: "Connection lost.",
  youAreHostNow: "You are the host now.",
  needFullApp: "This play style needs the installed app (not Expo Go).",
  hostLeftLobby: "Host changed — back to the lobby.",
  multipleRooms: "Two rooms have this code — pick the host:",
  netBlankAnswer: "(no answer)",
  questionsCount: "Questions ({n})",
  mainQuestionLabel: "Question for everyone",
  oddQuestionLabel: "Question for the Faker",
  addQuestion: "Add question",
  updateQuestion: "Update question",
  deleteCategoryTextQuestions: '"{name}" and its questions will be deleted.',
  // mafia result
  gameStarted: "The game has started!",
  mafiaPlayInstr: "Play it out loud — nights fall, roles wake up, the town votes.",
  narratorLine: "🎙️ {name} is the Narrator and runs the game.",
  whenOverReveal: "When the game is over, reveal the roles.",
  revealRolesBtn: "Reveal roles",
  mafiaWas: "The Mafia was",
  mafiaWere: "The Mafia were",
  noEvil: "No evil roles this round?!",
  // editors
  save: "Save",
  name: "Name",
  color: "Color",
  newPlayer: "New player",
  editPlayer: "Edit player",
  removePlayer: "Remove player",
  removePlayerQ: "Remove player?",
  removePlayerText: "{name} will be removed.",
  newCategory: "New category",
  editCategory: "Edit category",
  categoryName: "Category name",
  wordsCount: "Words ({n})",
  pairsCount: "Pairs ({n})",
  hintsTapEdit: "{n} hints · tap to edit",
  tapToEdit: "tap to edit",
  addWordLabel: "Add a word",
  editWordLabel: "Edit word",
  hintsLabel: "Hints (separated by commas)",
  addWord: "Add word",
  updateWord: "Update word",
  saveCategory: "Save category",
  deleteCategory: "Delete category",
  deleteCategoryQ: "Delete category?",
  deleteCategoryTextWords: '"{name}" and its words will be deleted.',
  deleteCategoryTextPairs: '"{name}" and its pairs will be deleted.',
  word1: "Word 1",
  word2: "Word 2",
  editWord1: "Edit word 1",
  editWord2: "Edit word 2",
  addPair: "Add pair",
  updatePair: "Update pair",
  newRole: "New role",
  editRole: "Edit role",
  roleNameLabel: "Role name",
  roleDescLabel: "Description (shown on the role card)",
  seesWord: "Sees the secret word",
  seesWordHint: "Off = this role only gets a random hint, like the imposter.",
  seesImposter: "Sees who the imposter is",
  seesImposterHint: "Their card also shows the imposter's name, like the Helper.",
  evilRole: "Evil role",
  evilRoleHint: "Evil roles are revealed together with the Mafia at the end.",
  deleteRole: "Delete role",
  deleteRoleQ: "Delete role?",
  deleteRoleText: '"{name}" will be deleted.',
  inTheGame: "In the game",
  pickColor: "Pick a color",
  useThisColor: "Use this color",
  // confirms
  yes: "Yes",
  no: "No",
  leaveGameQ: "Leave the game?",
  leaveGameText: "The current round will be lost.",
  quitQ: "Quit IMP?",
  quitText: "Do you want to close the app?",
};

const sr: typeof en = {
  // home
  gameMode: "Režim igre",
  players: "Igrači",
  categories: "Kategorije",
  roles: "Uloge",
  start: "POČNI",
  howToPlay: "Kako se igra",
  playerN: "Igrač {n}",
  errMinPlayers: "Potrebna su bar 3 aktivna igrača.",
  errTooManyRoles: "Previše uloga za {n} igrača.",
  errNoWords: "Uključi bar jednu kategoriju sa rečima.",
  errNoPairs: "Uključi bar jednu kategoriju sa parovima.",
  errBlefPlayers: "Blef je za tačno 2 igrača — ostale isključi.",
  errNoQuestions: "Uključi bar jednu kategoriju sa pitanjima.",
  modeImp: "IMP Classic",
  modeOdd: "Uljez",
  modeMafia: "Mafija",
  modeBlef: "Blef",
  modeFaker: "Folirant",
  // settings
  settings: "Podešavanja",
  discussionTimers: "Tajmeri za diskusiju",
  language: "Jezik",
  // reveal
  whoAreYou: "Ko si ti?",
  revealInstr: "Svako tajno otvara SVOJU kartu, pa dodaje telefon dalje.",
  tapToReveal: "dodirni da otkriješ",
  holdToReveal: "DRŽI DA OTKRIJEŠ",
  holdCardInstr: "Drži kartu da je okreneš. Pusti da sakriješ.",
  nobodyLooking: "Proveri da niko drugi ne gleda 👀",
  gotIt: "Važi — sakrij moju kartu",
  everyonesReady: "Svi su spremni",
  theWordIs: "Reč je",
  yourOnlyClue: "Tvoj jedini trag",
  imposterLabel: "Imposter: {names}",
  yourWordIs: "Tvoja reč je",
  oddCardNote: "Jedan igrač ima malo drugačiju reč. Možda si to baš ti…",
  // discussion
  discussion: "Diskusija",
  discussionInstr:
    "Redom ukrug, svako kaže jednu reč ili asocijaciju povezanu sa tajnom rečju. Zatim raspravite — ko je zvučao kao da blefira?",
  discussionInstrOdd:
    "Redom ukrug, svako kaže JEDAN trag o svojoj reči. Slušajte pažljivo — jedan igrač ima malo drugačiju reč…",
  goesFirst: "{name} počinje",
  vote: "Glasanje",
  timesUp: "VREME JE ISTEKLO!",
  tapToStart: "dodirni da počneš",
  // classic result
  pointFingers: "Uperite prste!",
  pointInstr: "Na tri, svi upiru prstom u onoga za koga misle da je imposter.",
  guessInstr:
    "Optužen si da si imposter? Pokušaj naglas da pogodiš tajnu reč — ako pogodiš, kradeš pobedu!",
  revealTheRoles: "Otkrij uloge",
  theWordWas: "Reč je bila",
  imposterWas: "Imposter je bio",
  impostersWere: "Imposteri su bili",
  otherRoles: "Ostale uloge",
  newRoundBtn: "Nova runda",
  backToMenu: "Nazad na meni",
  // odd result
  oddPointInstr: "Na tri, svi upiru prstom u onoga za koga misle da ima drugačiju reč.",
  revealOdd: "Otkrij uljeza",
  oddWas: "Uljez je bio",
  everyoneHad: "Svi su imali",
  playerHad: "{name} je imao/la",
  // blef
  yourClue: "Tvoj trag",
  blefCardNote: "Možda je prava reč… a možda samo trag. Niko ti ne kaže.",
  blefDiscussionInstr:
    "Naizmenično, svaki igrač naglas kaže {n} traga o onome što drži. Slušaj pažljivo — da li je stvarno znao reč?",
  blefRevealBtn: "Otkrij",
  blefPointInstr:
    "Na tri, oboje recite da li mislite da je onaj drugi imao REČ ili samo TRAG.",
  blefHadWord: "je imao reč",
  blefHadHint: "je imao trag",
  // faker
  fakerPlayStyle: "Način igre",
  fakerOnePhone: "Jedan telefon",
  fakerManyPhones: "Svako svoj telefon",
  passPhoneTo: "Dodaj telefon igraču",
  fakerTapQuestion: "Ja sam {name} — pokaži mi pitanje",
  fakerYourQuestion: "Tvoje pitanje",
  fakerAnswerPlaceholder: "Upiši svoj odgovor…",
  fakerLockIn: "Zaključaj odgovor",
  fakerAnswersTitle: "Odgovori",
  fakerAnswersInstr:
    "Pročitajte ih naglas i raspravite — čiji odgovor deluje čudno?",
  fakerRevealFaker: "Otkrij foliranta",
  fakerPointInstr:
    "Na tri, svi upiru prstom u onoga ko je po vama dobio drugačije pitanje.",
  fakerWas: "Folirant je bio",
  fakerCaughtText: "Uhvatili ste foliranta! 🎉",
  fakerEscapedText: "Promašaj — folirant se izvukao!",
  fakerVoteTie: "Nerešeno — folirant se izvukao!",
  fakerMainQLabel: "Pitanje za sve",
  fakerOddQLabel: "Pitanje za foliranta",
  fakerVotesLabel: "Glasovi",
  // play style
  playStyle: "Kako igrate?",
  onePhone: "1 telefon",
  localMultiplayer: "Lokalni multiplayer",
  // local multiplayer
  yourName: "Tvoje ime",
  hostGame: "NAPRAVI",
  joinGame: "PRIDRUŽI SE",
  roomCode: "Kod sobe",
  enterCode: "Kod sobe",
  scanQr: "Skeniraj QR kod",
  qrTitle: "Skeniraj da uđeš",
  qrUnavailable: "Kod se još podiže — koristi 4 cifre.",
  close: "Zatvori",
  sameWifiHint: "Svi na istom Wi-Fi-ju. Internet nije potreban.",
  netWebOnly:
    "Za lokalni multiplayer treba instalirana aplikacija — browser ne može da otvori sobu. Na web verziji se igra na jednom telefonu.",
  netModeOnline: "Internet",
  netModeLan: "Wi-Fi",
  onlineHint: "Radi i sa iPhone-ovima — svima treba internet.",
  lanOnlyOnApp: "Za Wi-Fi sobe treba instalirana aplikacija.",
  relayFailed: "Server igre nije dostupan. Proveri internet.",
  roomNotFound: "Nema sobe sa tim kodom.",
  roomFull: "Ta soba je puna.",
  joiningRoom: "Soba {code} — upiši ime i klikni PRIDRUŽI SE.",
  qrScanHint: "Može da se skenira i običnom kamerom.",
  playersCount: "Igrači ({n})",
  kickHint: "Dodirni igrača da ga izbaciš.",
  kickQ: "Izbaciti igrača?",
  kickText: "{name} će biti izbačen iz sobe.",
  kickedText: "Domaćin te je izbacio iz sobe.",
  hostLeft: "Domaćin je napustio igru.",
  hostFailed: "Soba nije mogla da se otvori na ovoj mreži.",
  cameraDenied: "Za skeniranje koda treba pristup kameri.",
  leaveRoomText: "Izaći ćeš iz sobe.",
  tooManyPlayers: "Previše igrača — ovaj režim je za {n}.",
  errNetContent: "Proveri kategorije i uloge — igra ne može da se podeli.",
  readyCount: "{done}/{total} spremno",
  waitingPlayers: "Čekaju se ostali…",
  waitingHostReveal: "Domaćin otkriva uloge kad se igra završi.",
  voteWhoImp: "Ko je imposter?",
  voteWhoOdd: "Ko je imao drugačiju reč?",
  voteWhoBlef: "Reč ili trag?",
  blefWordBtn: "REČ",
  blefHintBtn: "TRAG",
  blefGuessLine: "{name} je pogađao: {guess}",
  blefNoGuess: "{name} nije pogađao.",
  votedOutLine: "Izglasan: {name}",
  backToLobbyBtn: "Nazad u čekaonicu",
  impCaught: "Imposter je izglasan — grupa pobeđuje! 🎉",
  impEscaped: "Promašaj — imposter se izvukao!",
  impTie: "Nerešeno — imposter se izvukao!",
  impJester: "Džoker je izglasan — džoker pobeđuje!",
  oddCaught: "Uhvatili ste uljeza! 🎉",
  oddEscaped: "Promašaj — uljez se izvukao!",
  oddTie: "Nerešeno — uljez se izvukao!",
  theQuestionWas: "Pitanje je bilo",
  questionFirstInstr: "Ovo su svi dobili — osim jednog od vas.",
  showAnswersBtn: "Prikaži odgovore",
  howToNet:
    "LOKALNI MULTIPLAYER: gore prebaci način igre na „Lokalni multiplayer“, upiši ime i izaberi boju. Jedan pravi sobu (NAPRAVI) i pročita četvorocifreni kod ili pokaže QR kod, ostali kliknu PRIDRUŽI SE. Domaćin bira režim, kategorije i uloge, može svakog da izbaci i pokreće igru — dalje svako igra sa svog telefona. Treba vam samo ista Wi-Fi mreža; internet nije potreban.",
  joinBtn: "Uđi",
  lobbyTitle: "Čekaonica",
  waitingForHost: "Čeka se da domaćin počne…",
  startGameBtn: "Počni igru",
  needMorePlayers: "Potrebno je bar {n} igrača.",
  answeredCount: "{done}/{total} odgovorilo",
  votedCount: "{done}/{total} glasalo",
  continueBtn: "Nastavi",
  waitingOthers: "Odgovor zaključan — čekaju se ostali…",
  waitingOthersVote: "Glas dat — čekaju se ostali…",
  voteWhoNet: "Ko je dobio drugačije pitanje?",
  playAgainBtn: "IGRAJ PONOVO",
  leaveBtn: "IZAĐI",
  waitingHostAgain: "Čeka se da domaćin počne sledeću rundu…",
  joinNextRound: "Ulaziš kad počne sledeća runda.",
  connecting: "Povezivanje…",
  joinFailed: "Soba nije pronađena. Ista Wi-Fi mreža ili hotspot?",
  connectionLost: "Veza je prekinuta.",
  youAreHostNow: "Ti si sada domaćin.",
  needFullApp: "Za ovaj način igre treba instalirana aplikacija (ne Expo Go).",
  hostLeftLobby: "Domaćin je promenjen — nazad u čekaonicu.",
  multipleRooms: "Dve sobe imaju ovaj kod — izaberi domaćina:",
  netBlankAnswer: "(bez odgovora)",
  questionsCount: "Pitanja ({n})",
  mainQuestionLabel: "Pitanje za sve",
  oddQuestionLabel: "Pitanje za foliranta",
  addQuestion: "Dodaj pitanje",
  updateQuestion: "Izmeni pitanje",
  deleteCategoryTextQuestions: '"{name}" i njena pitanja će biti obrisana.',
  // mafia result
  gameStarted: "Igra je počela!",
  mafiaPlayInstr: "Igrajte naglas — pada noć, uloge se bude, grad glasa.",
  narratorLine: "🎙️ {name} je Narator i vodi igru.",
  whenOverReveal: "Kad se igra završi, otkrijte uloge.",
  revealRolesBtn: "Otkrij uloge",
  mafiaWas: "Mafija je bio",
  mafiaWere: "Mafijaši su bili",
  noEvil: "Nema zlih uloga u ovoj rundi?!",
  // editors
  save: "Sačuvaj",
  name: "Ime",
  color: "Boja",
  newPlayer: "Novi igrač",
  editPlayer: "Izmeni igrača",
  removePlayer: "Ukloni igrača",
  removePlayerQ: "Ukloniti igrača?",
  removePlayerText: "{name} će biti uklonjen.",
  newCategory: "Nova kategorija",
  editCategory: "Izmeni kategoriju",
  categoryName: "Naziv kategorije",
  wordsCount: "Reči ({n})",
  pairsCount: "Parovi ({n})",
  hintsTapEdit: "{n} tragova · dodirni da izmeniš",
  tapToEdit: "dodirni da izmeniš",
  addWordLabel: "Dodaj reč",
  editWordLabel: "Izmeni reč",
  hintsLabel: "Tragovi (odvojeni zarezima)",
  addWord: "Dodaj reč",
  updateWord: "Izmeni reč",
  saveCategory: "Sačuvaj kategoriju",
  deleteCategory: "Obriši kategoriju",
  deleteCategoryQ: "Obrisati kategoriju?",
  deleteCategoryTextWords: '"{name}" i njene reči će biti obrisane.',
  deleteCategoryTextPairs: '"{name}" i njeni parovi će biti obrisani.',
  word1: "Reč 1",
  word2: "Reč 2",
  editWord1: "Izmeni reč 1",
  editWord2: "Izmeni reč 2",
  addPair: "Dodaj par",
  updatePair: "Izmeni par",
  newRole: "Nova uloga",
  editRole: "Izmeni ulogu",
  roleNameLabel: "Naziv uloge",
  roleDescLabel: "Opis (prikazuje se na karti uloge)",
  seesWord: "Vidi tajnu reč",
  seesWordHint: "Isključeno = ova uloga dobija samo nasumičan trag, kao imposter.",
  seesImposter: "Vidi ko je imposter",
  seesImposterHint: "Na njihovoj karti piše i ime impostera, kao kod Pomoćnika.",
  evilRole: "Zla uloga",
  evilRoleHint: "Zle uloge se na kraju otkrivaju zajedno sa mafijom.",
  deleteRole: "Obriši ulogu",
  deleteRoleQ: "Obrisati ulogu?",
  deleteRoleText: '"{name}" će biti obrisana.',
  inTheGame: "U igri",
  pickColor: "Izaberi boju",
  useThisColor: "Iskoristi ovu boju",
  // confirms
  yes: "Da",
  no: "Ne",
  leaveGameQ: "Napustiti igru?",
  leaveGameText: "Trenutna runda će biti izgubljena.",
  quitQ: "Izaći iz IMP-a?",
  quitText: "Da li želiš da zatvoriš aplikaciju?",
};

const STRINGS: Record<Language, typeof en> = { en, sr };

export type StringKey = keyof typeof en;

export function t(key: StringKey): string {
  return STRINGS[current][key] ?? en[key];
}

// t with {placeholder} substitution: tf("goesFirst", { name: "Kosta" })
export function tf(key: StringKey, vars: Record<string, string | number>): string {
  let out = t(key);
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

// Display name of a gamemode ("imp" -> "IMP Classic").
export function modeLabel(mode: "imp" | "odd" | "mafia" | "blef" | "faker"): string {
  const key: StringKey =
    mode === "imp"
      ? "modeImp"
      : mode === "odd"
        ? "modeOdd"
        : mode === "mafia"
          ? "modeMafia"
          : mode === "blef"
            ? "modeBlef"
            : "modeFaker";
  return t(key);
}

// ---- built-in role localization ----
// Custom roles always show exactly what the user typed; built-in roles
// translate by id ("civilian" is shared, so it goes by English name).

const SR_ROLES: Record<string, { name: string; description: string }> = {
  imposter: {
    name: "Imposter",
    description: "NE znaš reč — imaš samo jedan trag. Uklopi se i nemoj da budeš izglasan.",
  },
  jester: {
    name: "Džoker",
    description: "Znaš reč, ali POBEĐUJEŠ ako te grupa izglasa. Ponašaj se sumnjivo!",
  },
  helper: {
    name: "Pomoćnik",
    description:
      "Znaš reč I znaš ko je imposter. Tajno mu pomaži — ako imposter pobedi, pobeđuješ i ti. Ali ako TEBE izglasaju, pobeđuje samo imposter.",
  },
  Innocent: {
    name: "Nevin",
    description: "Znaš tajnu reč. Daji pametne asocijacije i nanjuši impostera!",
  },
  Civilian: {
    name: "Građanin",
    description:
      "Nevin građanin bez posebnih moći. Prati šta se dešava danju, raspravljaj i pomozi da se mafija izglasa.",
  },
  mafia: {
    name: "Mafija",
    description:
      "Svake noći se probudi sa ostalim mafijašima i tiho izaberite žrtvu. Danju glumi nevinog i sve poriči. Pobeđuješ kad mafija nadbroji grad.",
  },
  lady: {
    name: "Dama",
    description:
      "Radiš za mafiju. Svake noći poseti jednog igrača — te noći njegova moć ne radi. Pobeđuješ sa mafijom.",
  },
  police: {
    name: "Policajac",
    description:
      "Svake noći pokaži na jednog igrača — saznaćeš da li je zao. Iskoristi to da usmeriš glasanje, ali se ne otkrivaj.",
  },
  doctor: {
    name: "Doktor",
    description:
      "Svake noći izaberi igrača kog štitiš — ako ga mafija napadne, preživeće. Možeš da štitiš i sebe.",
  },
  mjester: {
    name: "Džoker",
    description:
      "Pobeđuješ sam: navuci grad da izglasa TEBE. Budi sumnjiv — ali ne previše očigledno. Nisi ni dobar ni zao.",
  },
  narrator: {
    name: "Narator",
    description:
      "Ti ne igraš — ti vodiš igru. Uspavaj grad, budi noćne uloge jednu po jednu i pričaj priču svakog dana.",
  },
};

function srRole(role: RoleDef): { name: string; description: string } | undefined {
  // "civilian" id exists in both Classic (Innocent) and Mafia (Civilian).
  if (role.id === "civilian") return SR_ROLES[role.name];
  return SR_ROLES[role.id];
}

export function roleName(role: RoleDef): string {
  if (current === "en" || !role.builtin) return role.name;
  return srRole(role)?.name ?? role.name;
}

export function roleDesc(role: RoleDef): string {
  if (current === "en" || !role.builtin) return role.description;
  return srRole(role)?.description ?? role.description;
}
