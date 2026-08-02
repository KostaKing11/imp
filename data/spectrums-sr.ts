// ============================================================
//  SKALE — dva kraja brojčanika za mod "Skala" (srpski).
//
//  Jedan igrač tajno vidi tačku između `left` i `right` i kaže
//  nešto što po njemu tu stoji. Ostali okreću strelicu tamo gde
//  misle da je mislio.
//
//  Namerno postoji JEDNA lista i nema kategorija za biranje. Skala je
//  društvena igra koju treba moći pokrenuti pritiskom na START;
//  biranje koje vrste skala su uključene bilo je meni ispred igre
//  koju niko još nije odigrao.
//
//  ŠTA JE DOBRA SKALA
//  Na nju mora da može da se stavi BILO ŠTA — predmet, čovek, film,
//  sendvič — a da se ljudi i dalje svađaju gde tačno stoji.
//
//    dobro   Jeftino ↔ Skupo        (sve ima cenu)
//    dobro   Dosadno ↔ Uzbudljivo
//    loše    Faza ↔ Cela ličnost    (ide uz malo šta)
//    loše    Jeftino ↔ Ukusno       (to su dva pitanja)
//
//  Oba kraja moraju biti ista osa, samo suprotna, i dovoljno kratka
//  da se pročitaju na brojčaniku.
// ============================================================

import { SpectrumCategory } from "./spectrums";

export const SPECTRUM_CATEGORIES_SR: SpectrumCategory[] = [
  {
    name: "Skala",
    spectrums: [
      { left: "Jeftino", right: "Skupo" },
      { left: "Dosadno", right: "Uzbudljivo" },
      { left: "Lako", right: "Teško" },
      { left: "Tiho", right: "Glasno" },
      { left: "Sporo", right: "Brzo" },
      { left: "Malo", right: "Ogromno" },
      { left: "Ružno", right: "Lepo" },
      { left: "Beskorisno", right: "Neophodno" },
      { left: "Obično", right: "Čudno" },
      { left: "Bezbedno", right: "Opasno" },
      { left: "Nezdravo", right: "Zdravo" },
      { left: "Staromodno", right: "Moderno" },
      { left: "Prosto", right: "Komplikovano" },
      { left: "Hladno", right: "Vruće" },
      { left: "Retko se viđa", right: "Na svakom ćošku" },
      { left: "Za decu", right: "Za odrasle" },
      { left: "Precenjeno", right: "Potcenjeno" },
      { left: "Nervira", right: "Opušta" },
      { left: "Prljavo", right: "Čisto" },
      { left: "Slabo", right: "Jako" },
      { left: "Zaboravi se", right: "Pamti se zauvek" },
      { left: "Prostački", right: "Otmeno" },
      { left: "Sam", right: "Pred svima" },
      { left: "Svaki dan", right: "Jednom u životu" },
      { left: "Lagano", right: "Teško" },
      { left: "Neuredno", right: "Uredno" },
      { left: "Ozbiljno", right: "Blesavo" },
      { left: "Unutra", right: "Napolju" },
    ],
  },
];
