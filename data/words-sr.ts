// ============================================================
//  SRPSKE REČI — kategorije i reči za IMP Classic na srpskom.
//
//  Dodavanje reči = dodaj jedan red u `words` neke kategorije.
//  Dodavanje kategorije = kopiraj ceo { name: ..., words: [...] } blok.
//
//  Nevini vide reč; impostor dobija JEDAN nasumičan trag.
//  Tragovi su po jedna reč, dovoljno nejasni za blefiranje.
// ============================================================

import { BuiltinCategory } from "./words";

export const CATEGORIES_SR: BuiltinCategory[] = [
  {
    name: "Predmeti",
    words: [
      { word: "Kišobran", hints: ["kiša", "sklapanje", "drška", "mokro", "vetar"] },
      { word: "Gitara", hints: ["žice", "muzika", "drvo", "bend", "sviranje"] },
      { word: "Ogledalo", hints: ["odraz", "staklo", "kupatilo", "selfi", "zid"] },
      { word: "Ranac", hints: ["škola", "kaiševi", "rajsferšlus", "knjige", "leđa"] },
      { word: "Sveća", hints: ["vosak", "plamen", "rođendan", "miris", "fitilj"] },
      { word: "Makaze", hints: ["sečenje", "oštro", "papir", "frizer", "kancelarija"] },
      { word: "Sat", hints: ["vreme", "kucanje", "kazaljke", "zid", "alarm"] },
      { word: "Jastuk", hints: ["mekano", "spavanje", "perje", "krevet", "tuča"] },
    ],
  },
  {
    name: "Životinje",
    words: [
      { word: "Slon", hints: ["surla", "ogroman", "sivo", "uši", "afrika"] },
      { word: "Pingvin", hints: ["led", "frak", "geganje", "ptica", "hladno"] },
      { word: "Ajkula", hints: ["zubi", "peraje", "okean", "grabljivica", "film"] },
      { word: "Kengur", hints: ["skakanje", "torba", "australija", "boks", "rep"] },
      { word: "Sova", hints: ["noć", "mudrost", "hukanje", "oči", "drvo"] },
      { word: "Zmija", hints: ["gmizanje", "otrov", "krljušt", "siktanje", "trava"] },
      { word: "Konj", hints: ["galop", "sedlo", "kopita", "trka", "griva"] },
      { word: "Vuk", hints: ["zavijanje", "čopor", "mesec", "šuma", "sivo"] },
    ],
  },
  {
    name: "Hrana i piće",
    words: [
      { word: "Burek", hints: ["jufke", "meso", "sir", "pekara", "jogurt"] },
      { word: "Ćevapi", hints: ["roštilj", "somun", "luk", "meso", "leskovac"] },
      { word: "Sarma", hints: ["kupus", "zima", "mleveno", "slava", "baka"] },
      { word: "Ajvar", hints: ["paprika", "tegla", "jesen", "mazanje", "crveno"] },
      { word: "Kajmak", hints: ["mlečno", "belo", "mazanje", "pljeskavica", "domaće"] },
      { word: "Palačinke", hints: ["slatko", "eurokrem", "tanko", "prevrtanje", "fil"] },
      { word: "Gibanica", hints: ["sir", "jaja", "kore", "doručak", "pita"] },
      { word: "Rakija", hints: ["šljiva", "jako", "domaće", "čokanj", "slavlje"] },
    ],
  },
  {
    name: "Mesta",
    words: [
      { word: "Kafana", hints: ["muzika", "konobar", "meze", "kasno", "društvo"] },
      { word: "Pijaca", hints: ["tezge", "povrće", "cenkanje", "subota", "sveže"] },
      { word: "Splav", hints: ["reka", "muzika", "noć", "beograd", "žurka"] },
      { word: "Plaža", hints: ["pesak", "sunce", "peškir", "talasi", "leto"] },
      { word: "Biblioteka", hints: ["tišina", "knjige", "police", "čitanje", "članarina"] },
      { word: "Bolnica", hints: ["doktori", "belo", "hitno", "kreveti", "čekanje"] },
      { word: "Škola", hints: ["učitelji", "domaći", "zvono", "odmor", "klupe"] },
      { word: "Planina", hints: ["vrh", "penjanje", "sneg", "pogled", "vazduh"] },
    ],
  },
  {
    name: "Zanimanja",
    words: [
      { word: "Vatrogasac", hints: ["crevo", "merdevine", "dim", "heroj", "šlem"] },
      { word: "Policajac", hints: ["uniforma", "značka", "sirena", "lisice", "patrola"] },
      { word: "Doktor", hints: ["stetoskop", "recept", "bolnica", "pregled", "mantil"] },
      { word: "Frizer", hints: ["makaze", "ogledalo", "kosa", "šišanje", "fen"] },
      { word: "Učitelj", hints: ["škola", "tabla", "domaći", "đaci", "ocene"] },
      { word: "Kuvar", hints: ["kuhinja", "kapa", "noževi", "recepti", "restoran"] },
      { word: "Pekar", hints: ["brašno", "peć", "hleb", "zora", "kifle"] },
      { word: "Majstor", hints: ["alat", "popravka", "bušilica", "kuća", "zanat"] },
    ],
  },
  {
    name: "Sport",
    words: [
      { word: "Fudbal", hints: ["gol", "lopta", "teren", "sudija", "navijači"] },
      { word: "Košarka", hints: ["koš", "dribling", "visoki", "parket", "trojka"] },
      { word: "Tenis", hints: ["reket", "mreža", "servis", "žuto", "gem"] },
      { word: "Plivanje", hints: ["bazen", "voda", "naočare", "staze", "mokro"] },
      { word: "Boks", hints: ["rukavice", "ring", "udarac", "runde", "nokaut"] },
      { word: "Šah", hints: ["tabla", "kralj", "strategija", "mat", "figure"] },
      { word: "Odbojka", hints: ["mreža", "smeč", "servis", "tim", "blok"] },
      { word: "Rukomet", hints: ["gol", "sedmerac", "dvorana", "lopta", "pivot"] },
    ],
  },
  {
    name: "Priroda",
    words: [
      { word: "Vulkan", hints: ["lava", "erupcija", "planina", "pepeo", "vrelo"] },
      { word: "Duga", hints: ["boje", "kiša", "luk", "nebo", "sedam"] },
      { word: "Oluja", hints: ["grmljavina", "munja", "kiša", "oblaci", "vetar"] },
      { word: "Vodopad", hints: ["prskanje", "litica", "reka", "huka", "magla"] },
      { word: "Mesec", hints: ["noć", "krateri", "pun", "plima", "sjaj"] },
      { word: "Sneg", hints: ["belo", "hladno", "pahulje", "zima", "topljenje"] },
      { word: "Šuma", hints: ["drveće", "zeleno", "životinje", "hlad", "pečurke"] },
      { word: "Reka", hints: ["tok", "ribe", "most", "obala", "struja"] },
    ],
  },
  {
    name: "Tehnologija",
    words: [
      { word: "Robot", hints: ["metal", "budućnost", "program", "ruke", "zvuci"] },
      { word: "Telefon", hints: ["ekran", "aplikacije", "punjenje", "džep", "poruke"] },
      { word: "Vaj-faj", hints: ["lozinka", "ruter", "signal", "internet", "sporo"] },
      { word: "Dron", hints: ["letenje", "elise", "kamera", "zujanje", "daljinski"] },
      { word: "Slušalice", hints: ["muzika", "uši", "bežično", "kabl", "bas"] },
      { word: "Računar", hints: ["tastatura", "ekran", "miš", "fajlovi", "igrice"] },
      { word: "Kamera", hints: ["slike", "objektiv", "blic", "osmeh", "zum"] },
      { word: "Raketa", hints: ["lansiranje", "svemir", "odbrojavanje", "gorivo", "plamen"] },
    ],
  },
  {
    name: "Strašno i magično",
    words: [
      { word: "Zmaj", hints: ["vatra", "krila", "krljušt", "blago", "priče"] },
      { word: "Zombi", hints: ["mrtvo", "sporo", "mozak", "apokalipsa", "stenjanje"] },
      { word: "Vampir", hints: ["krv", "očnjaci", "noć", "luk", "kovčeg"] },
      { word: "Duh", hints: ["belo", "kuća", "lebdenje", "buu", "nevidljivo"] },
      { word: "Veštica", hints: ["metla", "kazan", "čini", "šešir", "smeh"] },
      { word: "Vukodlak", hints: ["mesec", "krzno", "zavijanje", "preobražaj", "kandže"] },
      { word: "Vila", hints: ["krila", "sitno", "prah", "magija", "želje"] },
      { word: "Div", hints: ["ogromno", "pasulj", "koraci", "visoko", "bajka"] },
    ],
  },
  {
    name: "Srbija",
    words: [
      { word: "Slava", hints: ["svečar", "kolač", "žito", "gosti", "sveća"] },
      { word: "Kolo", hints: ["igra", "krug", "truba", "svadba", "brzo"] },
      { word: "Trubači", hints: ["guča", "lim", "svadba", "glasno", "bakšiš"] },
      { word: "Opanak", hints: ["obuća", "koža", "narodno", "šiljak", "nošnja"] },
      { word: "Promaja", hints: ["vetar", "prozori", "bolest", "strah", "baka"] },
      { word: "Papuče", hints: ["kućno", "ulaz", "baka", "obavezno", "hladno"] },
      { word: "Gusle", hints: ["instrument", "epika", "žica", "pevanje", "starina"] },
      { word: "Šajkača", hints: ["kapa", "vojnik", "tradicija", "sivo", "glava"] },
    ],
  },
];
