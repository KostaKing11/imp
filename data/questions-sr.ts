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
  {
    name: "Šta bi radije",
    questions: [
      { main: "Reci nešto što nikad ne bi uradio za pare.", odd: "Reci nešto što bi uradio za mnogo para." },
      { main: "Šta bi radio da sutra imaš slobodan dan?", odd: "Šta bi radio da sutra imaš slobodnu nedelju?" },
      { main: "Koju kućnu obavezu nikad više ne bi radio?", odd: "Koju kućnu obavezu tajno voliš?" },
      { main: "Reci državu u koju bi se preselio.", odd: "Reci državu koju bi samo posetio." },
      { main: "Na šta bi potrošio poslednjih 2000 dinara?", odd: "Na šta bi potrošio prvi milion?" },
      { main: "Reci supermoć koju bi stvarno koristio svaki dan.", odd: "Reci supermoć koja zvuči beskorisno." },
      { main: "U kojoj deceniji bi živeo?", odd: "Koju deceniju bi izbegao?" },
      { main: "Reci posao u kom bi bio iznenađujuće dobar.", odd: "Reci posao u kom bi bio katastrofa." },
      { main: "Šta nikad ne bi podelio sa drugom?", odd: "Šta bi uvek podelio sa drugom?" },
      { main: "Reci nešto zbog čega vredi čekati u redu.", odd: "Reci nešto zbog čega nikad ne vredi čekati u redu." },
    ],
  },
  {
    name: "Filmovi i muzika",
    questions: [
      { main: "Reci film koji možeš gledati beskonačno.", odd: "Reci film koji nikad ne bi ponovo gledao." },
      { main: "Koja pesma te uvek digne na noge?", odd: "Koja pesma te uvek rastuži?" },
      { main: "Reci glumca kog svi vole.", odd: "Reci glumca koji je malo precenjen." },
      { main: "Šta je savršena grickalica za film?", odd: "Šta je najgora grickalica za film?" },
      { main: "Reci seriju sa odličnim krajem.", odd: "Reci seriju koja se otegla." },
      { main: "Koju pesmu bi pevao na karaokama?", odd: "Koju pesmu niko ne bi smeo da peva na karaokama?" },
      { main: "Reci crtani koji si voleo kao klinac.", odd: "Reci crtani koji ti sad ide na živce." },
      { main: "Sa kojim filmskim likom bi se družio?", odd: "Koji filmski lik bi ti išao na živce?" },
      { main: "Reci bend koji vredi gledati uživo.", odd: "Reci bend koji je bolji na snimku." },
      { main: "Koji film te je rasplakao?", odd: "Koji film te je najviše nasmejao?" },
    ],
  },
  {
    name: "Malo dublje",
    questions: [
      { main: "Šta čini dobrog prijatelja?", odd: "Šta čini dobrog komšiju?" },
      { main: "Reci nešto o čemu si promenio mišljenje.", odd: "Reci nešto o čemu nikad nećeš promeniti mišljenje." },
      { main: "Zbog čega vredi zakasniti?", odd: "Zbog čega nikad ne vredi zakasniti?" },
      { main: "Reci sitnicu koja ti ulepša dan.", odd: "Reci sitnicu koja ti pokvari dan." },
      { main: "Koji savet bi dao sebi od pre deset godina?", odd: "Koji savet od sebe mlađeg ne bi poslušao?" },
      { main: "Reci naviku na koju si ponosan.", odd: "Reci naviku koje bi se rešio." },
      { main: "Šta prvo primetiš kod čoveka?", odd: "Čega se setiš o čoveku nedelju dana kasnije?" },
      { main: "Reci nešto što ljudi prečesto govore.", odd: "Reci nešto što bi ljudi trebalo češće da govore." },
      { main: "Šta je najbolje u starenju?", odd: "Šta je najgore u starenju?" },
      { main: "Reci nešto što nikad ne bi pozajmio.", odd: "Reci nešto što bi pozajmio bilo kome." },
    ],
  },
  {
    name: "Kuća i navike",
    questions: [
      { main: "Reci nešto što ti je uvek u frižideru.", odd: "Reci nešto što ti nikad nije u frižideru." },
      { main: "Šta prvo uradiš ujutru?", odd: "Šta poslednje uradiš uveče?" },
      { main: "Reci prostoriju koja je uvek u haosu.", odd: "Reci prostoriju koja je uvek sređena." },
      { main: "Šta uvek zaboraviš da kupiš?", odd: "Čega uvek kupiš previše?" },
      { main: "Reci aplikaciju koju otvaraš svaki dan.", odd: "Reci aplikaciju koju bi trebalo da obrišeš." },
      { main: "Šta ti je najlenja večera?", odd: "Šta ti je večera za posebnu priliku?" },
      { main: "Reci stvar koje imaš previše.", odd: "Reci stvar koje ti nikad nije dovoljno." },
      { main: "Šta ti je sad na stolu?", odd: "Šta ti je sad ispod kreveta?" },
      { main: "Reci obavezu koju odmah odradiš.", odd: "Reci obavezu koju odlažeš danima." },
      { main: "Koji zvuk te budi?", odd: "Koji zvuk te uspava?" },
    ],
  },
];
