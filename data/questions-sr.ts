// ============================================================
//  SRPSKA PITANJA — parovi pitanja za režim Folirant.
//
//  Dodavanje pitanja = dodaj jedan red u `questions` neke kategorije.
//  Dodavanje kategorije = kopiraj ceo { name: ..., questions: [...] } blok.
//
//  Svi dobijaju `main` — osim foliranta, koji tajno dobija `odd`.
//  Neka oba pitanja traže ISTU vrstu odgovora (jelo, broj, ime…)
//  da bi folirantov odgovor mogao da se uklopi.
// ============================================================

import { QuestionCategory } from "./questions";

export const QUESTION_CATEGORIES_SR: QuestionCategory[] = [
  {
    name: "Hrana i piće",
    questions: [
      { main: "Koje jelo možeš da jedeš svaki dan?", odd: "Koje jelo ne želiš nikad više da probaš?" },
      { main: "Koji je najbolji dodatak za picu?", odd: "Koji je najgori dodatak za picu?" },
      { main: "Šta je dobro za doručak?", odd: "Šta je dobro za jelo u ponoć?" },
      { main: "Koje piće ide uz ručak?", odd: "Koje piće naručuješ u kafiću?" },
      { main: "Navedi jedno voće.", odd: "Navedi jedno povrće." },
      { main: "Koji je najbolji desert?", odd: "Koja je najbolja grickalica?" },
      { main: "Koje jelo je bolje domaće?", odd: "Koje jelo je bolje iz restorana?" },
      { main: "Koja hrana miriše savršeno?", odd: "Koja hrana smrdi užasno?" },
      { main: "Šta ide u sendvič?", odd: "Šta ide u salatu?" },
      { main: "Šta je najbolje sa roštilja?", odd: "Šta je najbolje iz rerne?" },
    ],
  },
  {
    name: "Svakodnevica",
    questions: [
      { main: "Koliko sati spavaš?", odd: "Koliko sati si na telefonu?" },
      { main: "Koju aplikaciju otvaraš svaki dan?", odd: "Koja aplikacija ti je višak na telefonu?" },
      { main: "Šta prvo radiš ujutru?", odd: "Šta poslednje radiš pre spavanja?" },
      { main: "Koji kućni posao ti ne smeta?", odd: "Koji kućni posao uvek izbegavaš?" },
      { main: "Koje je dobro vreme za buđenje vikendom?", odd: "Koje je dobro vreme za spavanje?" },
      { main: "Šta uvek nosiš sa sobom?", odd: "Šta uvek gubiš?" },
      { main: "Gde ideš svake nedelje?", odd: "Gde ideš samo jednom godišnje?" },
      { main: "Šta kupuješ čim je na popustu?", odd: "Šta ne kupuješ ni na popustu?" },
      { main: "Šta se trenutno nalazi u tvom frižideru?", odd: "Šta se trenutno nalazi u tvojoj torbi?" },
      { main: "Koliko minuta kašnjenja je prihvatljivo?", odd: "Koliko minuta ranije stižeš?" },
    ],
  },
  {
    name: "Zabava",
    questions: [
      { main: "Koju životinju želiš za ljubimca?", odd: "Od koje životinje bežiš?" },
      { main: "Koju supermoć biraš?", odd: "Koja supermoć je najiritantnija?" },
      { main: "Šta nosiš na pusto ostrvo?", odd: "Šta nosiš na kampovanje?" },
      { main: "Koji posao želiš da probaš na jedan dan?", odd: "Koji posao nikako ne bi mogao da radiš?" },
      { main: "Šta radiš sa milion evra?", odd: "Šta radiš sa slobodnim vikendom?" },
      { main: "Šta je precenjeno?", odd: "Šta je potcenjeno?" },
      { main: "Koji film svi moraju da pogledaju?", odd: "Uz koji film se lako zaspi?" },
      { main: "Koje je dobro ime za psa?", odd: "Koje je dobro ime za brod?" },
      { main: "Šta je strašno?", odd: "Šta je odvratno?" },
      { main: "U koju godinu putuješ vremeplovom?", odd: "Koja godina ti je bila najbolja?" },
    ],
  },
  {
    name: "Društvo",
    questions: [
      { main: "Koju poznatu ličnost zoveš na večeru?", odd: "Koju poznatu ličnost izbegavaš?" },
      { main: "Ko iz ove prostorije će postati slavan?", odd: "Ko iz ove prostorije uvek kasni?" },
      { main: "Ko iz ove prostorije preživljava zombi apokalipsu?", odd: "Koga iz ove prostorije zombiji prvog hvataju?" },
      { main: "Koja osobina ti je najvažnija kod prijatelja?", odd: "Koja osobina te najviše nervira kod ljudi?" },
      { main: "Ko iz ove prostorije ima najbolji smeh?", odd: "Ko iz ove prostorije se smeje sopstvenim forama?" },
      { main: "Koji poklon želiš da dobiješ?", odd: "Koji poklon odmah poklanjaš dalje?" },
      { main: "Ko iz ove prostorije najviše gleda u telefon?", odd: "Ko iz ove prostorije najsporije odgovara na poruke?" },
      { main: "Koliko godina se osećaš?", odd: "Koliko godina želiš zauvek da imaš?" },
      { main: "Ko iz ove prostorije daje najbolje savete?", odd: "Ko iz ove prostorije daje najhaotičnije savete?" },
      { main: "Šta ti se odmah svidi kod nekoga?", odd: "Šta ti je odmah sumnjivo kod nekoga?" },
    ],
  },
];
