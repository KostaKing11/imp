// ============================================================
//  SRPSKI PAROVI — parovi reči za Uljeza (Odd One Out) na srpskom.
//
//  Dodavanje para = dodaj jedan red u `pairs` neke kategorije.
//  Dodavanje kategorije = kopiraj ceo { name: ..., pairs: [...] } blok.
//
//  Igra nasumično bira koja od dve reči ide grupi, a koja uljezu.
// ============================================================

import { PairCategory } from "./pairs";

export const PAIR_CATEGORIES_SR: PairCategory[] = [
  {
    name: "Hrana i piće",
    pairs: [
      { main: "Kafa", odd: "Čaj" },
      { main: "Burek", odd: "Gibanica" },
      { main: "Ćevapi", odd: "Pljeskavica" },
      { main: "Palačinke", odd: "Uštipci" },
      { main: "Ajvar", odd: "Ljutenica" },
      { main: "Sarma", odd: "Punjena paprika" },
      { main: "Kajmak", odd: "Pavlaka" },
      { main: "Sladoled", odd: "Frape" },
      { main: "Hleb", odd: "Lepinja" },
      { main: "Rakija", odd: "Vinjak" },
    ],
  },
  {
    name: "Životinje",
    pairs: [
      { main: "Lav", odd: "Tigar" },
      { main: "Mačka", odd: "Pas" },
      { main: "Pčela", odd: "Osa" },
      { main: "Žaba", odd: "Krastača" },
      { main: "Konj", odd: "Magarac" },
      { main: "Zec", odd: "Hrčak" },
      { main: "Sova", odd: "Orao" },
      { main: "Delfin", odd: "Ajkula" },
      { main: "Krokodil", odd: "Aligator" },
      { main: "Ovca", odd: "Koza" },
    ],
  },
  {
    name: "Mesta",
    pairs: [
      { main: "Kafana", odd: "Restoran" },
      { main: "Plaža", odd: "Bazen" },
      { main: "Bioskop", odd: "Pozorište" },
      { main: "Škola", odd: "Fakultet" },
      { main: "Pijaca", odd: "Prodavnica" },
      { main: "Selo", odd: "Grad" },
      { main: "Planina", odd: "Brdo" },
      { main: "Šuma", odd: "Park" },
      { main: "Most", odd: "Tunel" },
      { main: "Splav", odd: "Klub" },
    ],
  },
  {
    name: "Svakodnevica",
    pairs: [
      { main: "Tuš", odd: "Kada" },
      { main: "Olovka", odd: "Hemijska" },
      { main: "Kauč", odd: "Fotelja" },
      { main: "Telefon", odd: "Tablet" },
      { main: "Autobus", odd: "Tramvaj" },
      { main: "Patike", odd: "Čizme" },
      { main: "Kišobran", odd: "Kabanica" },
      { main: "Sat", odd: "Budilnik" },
      { main: "Jastuk", odd: "Ćebe" },
      { main: "Metla", odd: "Usisivač" },
    ],
  },
];
