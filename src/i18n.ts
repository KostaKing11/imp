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
  imposterLabel: "Impostor: {names}",
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
  pointInstr: "Na tri, svi upiru prstom u onoga za koga misle da je impostor.",
  guessInstr:
    "Optužen si da si impostor? Pokušaj naglas da pogodiš tajnu reč — ako pogodiš, kradeš pobedu!",
  revealTheRoles: "Otkrij uloge",
  theWordWas: "Reč je bila",
  imposterWas: "Impostor je bio",
  impostersWere: "Impostori su bili",
  otherRoles: "Ostale uloge",
  newRoundBtn: "Nova runda",
  backToMenu: "Nazad na meni",
  // odd result
  oddPointInstr: "Na tri, svi upiru prstom u onoga za koga misle da ima drugačiju reč.",
  revealOdd: "Otkrij uljeza",
  oddWas: "Uljez je bio",
  everyoneHad: "Svi su imali",
  playerHad: "{name} je imao/la",
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
  seesWordHint: "Isključeno = ova uloga dobija samo nasumičan trag, kao impostor.",
  seesImposter: "Vidi ko je impostor",
  seesImposterHint: "Na njihovoj karti piše i ime impostora, kao kod Pomoćnika.",
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

// ---- built-in role localization ----
// Custom roles always show exactly what the user typed; built-in roles
// translate by id ("civilian" is shared, so it goes by English name).

const SR_ROLES: Record<string, { name: string; description: string }> = {
  imposter: {
    name: "Impostor",
    description: "NE znaš reč — imaš samo jedan trag. Uklopi se i nemoj da budeš izglasan.",
  },
  jester: {
    name: "Džoker",
    description: "Znaš reč, ali POBEĐUJEŠ ako te grupa izglasa. Ponašaj se sumnjivo!",
  },
  helper: {
    name: "Pomoćnik",
    description:
      "Znaš reč I znaš ko je impostor. Tajno mu pomaži — ako impostor pobedi, pobeđuješ i ti. Ali ako TEBE izglasaju, pobeđuje samo impostor.",
  },
  Innocent: {
    name: "Nevin",
    description: "Znaš tajnu reč. Daji pametne asocijacije i nanjuši impostora!",
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
