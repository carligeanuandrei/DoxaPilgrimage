
import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { sql } from "drizzle-orm";

// Funcție pentru generarea unui slug unic
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true, locale: 'ro' });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Structura unei mănăstiri pentru importul în masă
type MonasteryData = {
  name: string;
  description: string;
  shortDescription?: string;
  address?: string; 
  region: "moldova" | "bucovina" | "muntenia" | "oltenia" | "transilvania" | "maramures" | "banat" | "dobrogea" | "crisana";
  city: string;
  county: string;
  patronSaint?: string;
  patronSaintDate?: string;
  foundedYear?: number;
  history?: string;
  specialFeatures?: string;
  relics?: string[];
  type: "monastery" | "hermitage" | "church";
  coverImage?: string;
  images?: string[];
  website?: string;
  contactPhone?: string;
  contactEmail?: string;
  verification?: "verified" | "pending" | "rejected";
  country?: string;
  latitude?: number;
  longitude?: number;
  access?: string;
};

/**
 * Lista completă a mănăstirilor din România
 */
const allMonasteries: MonasteryData[] = [
  // MOLDOVA
  {
    name: "Mănăstirea Putna",
    description: "Mănăstirea Putna, ctitorie a lui Ștefan cel Mare (1466-1469), este un important centru spiritual, cultural și artistic al Ortodoxiei românești. Numită și \"Ierusalimul neamului românesc\", adăpostește mormântul lui Ștefan cel Mare și tezaure de artă medievală, inclusiv broderii, manuscrise și obiecte de cult.",
    shortDescription: "Ctitorie a lui Ștefan cel Mare și necropolă domnească",
    region: "bucovina",
    city: "Putna",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2025-08-15",
    foundedYear: 1466,
    history: "Mănăstirea a fost construită între anii 1466-1469 de către Ștefan cel Mare în urma victoriei asupra turcilor la Chilia. A fost concepută ca necropolă domnească, iar aici au fost înmormântați Ștefan cel Mare și membri ai familiei sale.",
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12151_600x450.jpg",
    website: "https://www.putna.ro",
    contactPhone: "0230 414 055",
    contactEmail: "secretariat@putna.ro",
    verification: "verified",
    country: "România",
    latitude: 47.8728,
    longitude: 25.6003
  },
  {
    name: "Mănăstirea Neamț",
    description: "Mănăstirea Neamț, cunoscută și ca „Lavra Neamțului", este una dintre cele mai vechi și mai importante mănăstiri din Moldova, cu o tradiție culturală și spirituală de peste șase secole. A fost un centru important de cultură medievală românească, cu o renumită școală de caligrafi și miniaturiști.",
    shortDescription: "Cel mai important centru cultural-monastic din Moldova medievală",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Înălțarea Domnului",
    patronSaintDate: "2025-06-05",
    foundedYear: 1407,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11133_600x450.jpg",
    website: "https://manastireaneamt.ro",
    contactPhone: "0233 251 580",
    contactEmail: "manastireaneamt@gmail.com",
    verification: "verified",
    country: "România"
  },
  {
    name: "Mănăstirea Agapia",
    description: "Mănăstirea Agapia este una dintre cele mai mari mănăstiri de maici din țară, renumită pentru pictura murală realizată de Nicolae Grigorescu în tinerețea sa. Așezată într-un cadru natural deosebit, mănăstirea a găzduit de-a lungul timpului importante personalități culturale românești.",
    shortDescription: "Celebră pentru picturile lui Nicolae Grigorescu",
    region: "moldova",
    city: "Agapia",
    county: "Neamț",
    patronSaint: "Sfinții Arhangheli Mihail și Gavriil",
    foundedYear: 1643,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/117/11712_600x450.jpg"
  },
  {
    name: "Mănăstirea Văratec",
    description: "Mănăstirea Văratec, cea mai mare mănăstire de maici din țară, este strâns legată de personalitatea starețelor Olimpiada Alcaz și Veronica Micle. Aici se află mormântul Veronicăi Micle, muza poetului Mihai Eminescu. Mănăstirea Văratec a fost un important centru de cultură și spiritualitate feminină.",
    shortDescription: "Cea mai mare mănăstire de maici din România",
    region: "moldova",
    city: "Văratec",
    county: "Neamț",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1785,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/122/12287_600x450.jpg"
  },
  {
    name: "Mănăstirea Secu",
    description: "Mănăstirea Secu, ctitorie a marelui vornic Nestor Ureche, este o mănăstire fortificată ce adăpostește importante valori de artă și cultură medievală românească. A fost un important centru de copiere a manuscriselor și cărților sfinte în perioada medievală.",
    shortDescription: "Ctitoria marelui vornic Nestor Ureche, tatăl cronicarului Grigore Ureche",
    region: "moldova",
    city: "Vânători",
    county: "Neamț",
    patronSaint: "Tăierea Capului Sfântului Ioan Botezătorul",
    foundedYear: 1602,
    type: "monastery",
    coverImage: "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2013/11/manastirea_secu_1.jpg"
  },
  {
    name: "Mănăstirea Sihăstria",
    description: "Mănăstirea Sihăstria este strâns legată de mari personalități ale spiritualității ortodoxe românești precum Părintele Cleopa Ilie și Părintele Paisie Olaru. Este un important centru isihast și un loc de pelerinaj pentru credincioșii din întreaga țară.",
    shortDescription: "Vatră de spiritualitate isihastă și duhovnicească",
    region: "moldova",
    city: "Vânători",
    county: "Neamț",
    patronSaint: "Nașterea Maicii Domnului",
    patronSaintDate: "2025-09-08",
    foundedYear: 1655,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg",
    website: "https://manastireasihastria.ro",
    contactPhone: "0233 251 896",
    contactEmail: "manastireasihastria@gmail.com"
  },
  {
    name: "Mănăstirea Golia",
    description: "Mănăstirea Golia, situată în centrul istoric al Iașului, este un impresionant ansamblu de arhitectură medievală în stil gotic și baroc. Turnul Goliei a fost folosit ca punct de observație pentru orașul Iași datorită înălțimii sale considerabile.",
    shortDescription: "Monument de arhitectură medievală în inima Iașului",
    region: "moldova",
    city: "Iași",
    county: "Iași",
    patronSaint: "Înălțarea Domnului",
    foundedYear: 1546,
    type: "monastery",
    coverImage: "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2013/11/manastirea_golia.jpg"
  },
  {
    name: "Mănăstirea Galata",
    description: "Mănăstirea Galata, ctitorie a domnitorului Petru Șchiopul, este un impresionant monument de arhitectură moldovenească din secolul al XVI-lea. Așezată pe o colină ce domină partea de vest a Iașului, mănăstirea a servit și ca necropolă domnească.",
    shortDescription: "Ctitorie a lui Petru Șchiopul cu elemente gotice și renascentiste",
    region: "moldova",
    city: "Iași",
    county: "Iași",
    patronSaint: "Înălțarea Domnului",
    foundedYear: 1584,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/114/11401_600x450.jpg"
  },
  
  // BUCOVINA
  {
    name: "Mănăstirea Voroneț",
    description: "Mănăstirea Voroneț, cunoscută pentru nuanța unică de albastru folosită în picturile exterioare, este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare. Supranumită „Capela Sixtină a Estului", mănăstirea este celebră pentru scena Judecății de Apoi de pe peretele vestic.",
    shortDescription: "Capela Sixtină a Estului cu renumitul albastru de Voroneț",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    patronSaint: "Sfântul Gheorghe",
    patronSaintDate: "2025-04-23",
    foundedYear: 1488,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11352_600x450.jpg",
    website: "https://www.voronet.ro",
    contactPhone: "0230234912",
    contactEmail: "manastirea@voronet.ro"
  },
  {
    name: "Mănăstirea Moldovița",
    description: "Mănăstirea Moldovița, cu remarcabilele sale fresce exterioare în nuanțe de galben, este parte din patrimoniul UNESCO. Construită în timpul domniei lui Petru Rareș, mănăstirea prezintă valoroase scene biblice și importante fresce ca „Asediul Constantinopolului".",
    shortDescription: "Remarcabilă pentru frescele galbene și scena Asediului Constantinopolului",
    region: "bucovina",
    city: "Vatra Moldoviței",
    county: "Suceava",
    patronSaint: "Buna Vestire",
    foundedYear: 1532,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/114/11451_600x450.jpg"
  },
  {
    name: "Mănăstirea Sucevița",
    description: "Mănăstirea Sucevița, ultima dintre mănăstirile pictate din Bucovina, este remarcabilă pentru culoarea verde predominantă și pentru scena unică „Scara Virtuților". Este cea mai bine fortificată dintre mănăstirile bucovinene, cu ziduri puternice și turnuri de apărare.",
    shortDescription: "Ultima mănăstire pictată din Bucovina, cu ziduri de cetate",
    region: "bucovina",
    city: "Sucevița",
    county: "Suceava",
    patronSaint: "Învierea Domnului",
    patronSaintDate: "2025-04-20",
    foundedYear: 1584,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11120_600x450.jpg",
    website: "https://manastireasucevita.ro",
    contactPhone: "0230 417 364",
    contactEmail: "manastirea.sucevita@gmail.com"
  },
  {
    name: "Mănăstirea Humor",
    description: "Mănăstirea Humor, construită în timpul domniei lui Petru Rareș, este una dintre bisericile pictate din Bucovina inclusă în patrimoniul UNESCO. Este remarcabilă pentru predominanța culorii roșii în frescele exterioare și pentru scena „Imnul Acatist" de o rară frumusețe.",
    shortDescription: "Cunoscută pentru frescele în nuanțe predominante de roșu",
    region: "bucovina",
    city: "Mănăstirea Humorului",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1530,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11143_600x450.jpg"
  },
  
  // TRANSILVANIA
  {
    name: "Mănăstirea Sâmbăta de Sus",
    description: "Mănăstirea Sâmbăta de Sus, cunoscută și ca Mănăstirea Brâncoveanu, este un important centru spiritual ortodox din inima Țării Făgărașului. Ctitorie a lui Constantin Brâncoveanu, mănăstirea a fost reconstruită în perioada interbelică de mitropolitul Nicolae Bălan.",
    shortDescription: "Important centru spiritual ortodox din inima Transilvaniei",
    region: "transilvania",
    city: "Sâmbăta de Sus",
    county: "Brașov",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1696,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/116/11652_600x450.jpg",
    website: "https://www.manastireasambata.ro",
    contactPhone: "0268360381",
    contactEmail: "manastirea.sambata@gmail.com"
  },
  {
    name: "Mănăstirea Râmeț",
    description: "Mănăstirea Râmeț, una dintre cele mai vechi așezări monahale din Transilvania, datează din secolul al XIII-lea. Biserica mănăstirii păstrează valoroase fresce medievale. În perioada comunistă, mănăstirea a fost un important centru de rezistență ortodoxă și spirituală.",
    shortDescription: "Una dintre cele mai vechi mănăstiri din Transilvania",
    region: "transilvania",
    city: "Râmeț",
    county: "Alba",
    patronSaint: "Izvorul Tămăduirii și Sfânta Treime",
    foundedYear: 1214,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/112/11227_600x450.jpg"
  },
  {
    name: "Mănăstirea Rohia",
    description: "Mănăstirea Rohia, cunoscută și pentru legătura sa cu scriitorul Nicolae Steinhardt, găzduiește o impresionantă bibliotecă cu peste 40.000 de volume. Așezată într-un cadru natural deosebit, mănăstirea a devenit un important centru cultural și spiritual din nordul Transilvaniei.",
    shortDescription: "Locul unde a viețuit Nicolae Steinhardt, autorul „Jurnalului fericirii"",
    region: "transilvania",
    city: "Târgu Lăpuș",
    county: "Maramureș",
    patronSaint: "Sfânta Ana",
    foundedYear: 1923,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11165_600x450.jpg"
  },
  {
    name: "Mănăstirea Nicula",
    description: "Mănăstirea Nicula este renumită pentru icoana făcătoare de minuni a Maicii Domnului și pentru tradiționalul pelerinaj de Sfânta Maria (15 august). Mănăstirea a fost un important centru de iconografie pe sticlă, contribuind la dezvoltarea acestei arte populare românești.",
    shortDescription: "Cel mai important centru de pelerinaj din Transilvania",
    region: "transilvania",
    city: "Nicula",
    county: "Cluj",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1552,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11109_600x450.jpg"
  },
  {
    name: "Mănăstirea Prislop",
    description: "Mănăstirea Prislop, situată într-un cadru natural de excepție, este strâns legată de personalitatea Părintelui Arsenie Boca. Aici se află mormântul său, care a devenit unul dintre cele mai vizitate locuri de pelerinaj din România în ultimii ani.",
    shortDescription: "Loc de pelerinaj la mormântul Părintelui Arsenie Boca",
    region: "transilvania",
    city: "Silvașu de Sus",
    county: "Hunedoara",
    patronSaint: "Sfântul Ioan Evanghelistul",
    patronSaintDate: "2025-05-08",
    foundedYear: 1400,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/117/11781_600x450.jpg",
    website: "https://www.manastireaprislophateg.ro",
    contactPhone: "0254775472",
    contactEmail: "manastirea.prislop@gmail.com"
  },
  
  // OLTENIA
  {
    name: "Mănăstirea Tismana",
    description: "Mănăstirea Tismana, cea mai veche din Țara Românească, este ctitoria Sfântului Nicodim de la Tismana. Așezată pe un pisc stâncos, lângă o cascadă spectaculoasă, mănăstirea a avut un rol important în istoria și cultura medievală românească.",
    shortDescription: "Cea mai veche mănăstire din Țara Românească",
    region: "oltenia",
    city: "Tismana",
    county: "Gorj",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1376,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/122/12235_600x450.jpg",
    website: "https://www.manastireatismana.ro",
    contactPhone: "0253 374 315",
    contactEmail: "manastireatismana@gmail.com"
  },
  {
    name: "Mănăstirea Polovragi",
    description: "Mănăstirea Polovragi, situată la poalele Munților Căpățânii, într-un cadru natural spectaculos, este un important centru spiritual din Oltenia. În apropierea mănăstirii se află Peștera Polovragi, un loc încărcat de legende și credințe populare.",
    shortDescription: "Mănăstire la poalele munților, lângă peștera cu același nume",
    region: "oltenia",
    city: "Polovragi",
    county: "Gorj",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1505,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11118_600x450.jpg"
  },
  {
    name: "Mănăstirea Horezu",
    description: "Mănăstirea Horezu, capodoperă a stilului brâncovenesc și monument UNESCO, este cea mai importantă ctitorie a domnitorului Constantin Brâncoveanu. Ansamblul monastic este remarcabil pentru sculptura în piatră și lemn, frescele și decorațiunile interioare de o rară frumusețe.",
    shortDescription: "Capodoperă a stilului brâncovenesc, inclusă în patrimoniul UNESCO",
    region: "oltenia",
    city: "Horezu",
    county: "Vâlcea",
    patronSaint: "Sfinții Împărați Constantin și Elena",
    patronSaintDate: "2025-05-21",
    foundedYear: 1690,
    type: "monastery",
    coverImage: "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2014/06/manastirea_horezu.jpg",
    website: "https://www.manastireahorezu.ro",
    contactPhone: "0250 860 071",
    contactEmail: "manastireahorezu@gmail.com"
  },
  {
    name: "Mănăstirea Govora",
    description: "Mănăstirea Govora, una dintre cele mai vechi din Țara Românească, este legată de începuturile tiparului românesc. Aici a funcționat o importantă tipografie în timpul lui Matei Basarab, unde s-a tipărit „Pravila de la Govora", primul cod de legi din Țara Românească.",
    shortDescription: "Importantă vatră de cultură și tipar din Țara Românească",
    region: "oltenia",
    city: "Mihăești",
    county: "Vâlcea",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1496,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11302_600x450.jpg"
  },
  {
    name: "Mănăstirea Bistrița",
    description: "Mănăstirea Bistrița, ctitorie a boierilor Craiovești, este o importantă necropolă a acestei familii boierești și păstrează moaștele Sfântului Grigorie Decapolitul. De-a lungul timpului, mănăstirea a fost un important centru cultural, aici funcționând o renumită școală.",
    shortDescription: "Ctitoria boierilor Craiovești, adăpostește moaștele Sf. Grigorie Decapolitul",
    region: "oltenia",
    city: "Costești",
    county: "Vâlcea",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1492,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11361_600x450.jpg"
  },
  {
    name: "Mănăstirea Cozia",
    description: "Mănăstirea Cozia, ctitorie a lui Mircea cel Bătrân, este unul dintre cele mai valoroase monumente de arhitectură și artă medievală din țară. Adăpostește mormântul ctitorului său și prezintă un remarcabil ansamblu de pictură murală medievală cu influențe bizantine și balcanice.",
    shortDescription: "Ctitoria lui Mircea cel Bătrân, important monument medieval",
    region: "oltenia",
    city: "Călimănești",
    county: "Vâlcea",
    patronSaint: "Sfânta Treime",
    foundedYear: 1388,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11153_600x450.jpg"
  },
  
  // MUNTENIA
  {
    name: "Mănăstirea Curtea de Argeș",
    description: "Mănăstirea Curtea de Argeș, cunoscută și ca Biserica Episcopală, este o capodoperă a arhitecturii românești și o importantă necropolă regală. Legenda meșterului Manole este strâns legată de construcția acestei biserici cu o arhitectură unică și decorațiuni exterioare spectaculoase.",
    shortDescription: "Necropolă regală și capodoperă arhitecturală legată de legenda Meșterului Manole",
    region: "muntenia",
    city: "Curtea de Argeș",
    county: "Argeș",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1517,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11111_600x450.jpg",
    website: "https://www.episcopiaargesului.ro",
    contactPhone: "0248721554",
    contactEmail: "manastireacurteadearges@gmail.com"
  },
  {
    name: "Mănăstirea Cernica",
    description: "Mănăstirea Cernica, situată pe două insule din lacul cu același nume, are o bogată istorie spirituală și culturală. Aici au viețuit personalități importante ale Ortodoxiei românești precum Sfântul Calinic de la Cernica și scriitorul Gala Galaction.",
    shortDescription: "Important centru spiritual și cultural în apropierea Bucureștiului",
    region: "muntenia",
    city: "Cernica",
    county: "Ilfov",
    patronSaint: "Sfântul Nicolae",
    foundedYear: 1608,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11103_600x450.jpg"
  },
  {
    name: "Mănăstirea Snagov",
    description: "Mănăstirea Snagov, situată pe o insulă din lacul cu același nume, este legată de figura controversată a lui Vlad Țepeș, a cărui presupusă mormânt se află aici. Mănăstirea era cunoscută în Evul Mediu pentru scriptorii și miniaturiștii săi talentați.",
    shortDescription: "Insulă monastică legată de legenda lui Vlad Țepeș",
    region: "muntenia",
    city: "Snagov",
    county: "Ilfov",
    patronSaint: "Intrarea în Biserică a Maicii Domnului",
    foundedYear: 1408,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11180_600x450.jpg"
  },
  
  // MARAMUREȘ
  {
    name: "Mănăstirea Bârsana",
    description: "Mănăstirea Bârsana, o bijuterie a arhitecturii tradiționale din lemn, este construită în stilul specific zonei Maramureșului. Complexul monastic impresionează prin înălțimea turnurilor din lemn, armonia arhitecturală și îmbinarea perfectă cu peisajul natural înconjurător.",
    shortDescription: "Capodoperă a arhitecturii tradiționale maramureșene în lemn",
    region: "maramures",
    city: "Bârsana",
    county: "Maramureș",
    patronSaint: "Soborul Sfinților 12 Apostoli",
    patronSaintDate: "2025-06-30",
    foundedYear: 1993,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11318_600x450.jpg",
    website: "https://www.manastireabarsana.ro",
    contactPhone: "0262337006",
    contactEmail: "contact@manastireabarsana.ro"
  },
  {
    name: "Mănăstirea Săpânța-Peri",
    description: "Mănăstirea Săpânța-Peri este cunoscută pentru biserica sa din lemn, care, cu o înălțime de 78 de metri, este considerată cea mai înaltă biserică din lemn din lume. Construită ca o replică a vechii Mănăstiri Peri, distrusă în secolul al XVIII-lea, acest lăcaș impresionează prin măreția sa.",
    shortDescription: "Cea mai înaltă biserică din lemn din lume",
    region: "maramures",
    city: "Săpânța",
    county: "Maramureș",
    patronSaint: "Sfântul Arhanghel Mihail",
    foundedYear: 1997,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12113_600x450.jpg"
  },
  {
    name: "Mănăstirea Moisei",
    description: "Mănăstirea Moisei, vechi centru spiritual din Maramureș, are o istorie zbuciumată ce reflectă lupta românilor pentru credință și identitate națională. Aici se află un important monument dedicat victimelor masacrului din octombrie 1944, realizat de sculptorul Vida Gheza.",
    shortDescription: "Vechi centru spiritual și simbol al rezistenței românești",
    region: "maramures",
    city: "Moisei",
    county: "Maramureș",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1672,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11122_600x450.jpg"
  },
  
  // BANAT
  {
    name: "Mănăstirea Hodoș-Bodrog",
    description: "Mănăstirea Hodoș-Bodrog este cea mai veche mănăstire din România cu viață monahală neîntreruptă. Situată pe malul Mureșului, mănăstirea adăpostește o valoroasă colecție de icoane, cărți vechi și obiecte de cult, precum și o icoană făcătoare de minuni a Maicii Domnului.",
    shortDescription: "Cea mai veche mănăstire din România cu viață monahală neîntreruptă",
    region: "banat",
    city: "Arad",
    county: "Arad",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1177,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11382_600x450.jpg"
  },
  {
    name: "Mănăstirea Săraca",
    description: "Mănăstirea Săraca, situată în Banat, are origini medievale și o istorie tumultuoasă marcată de distrugeri și reconstrucții. Biserica mănăstirii adăpostește valoroase picturi murale din secolul al XIX-lea. Numele neobișnuit provine de la o legendă locală despre o văduvă săracă.",
    shortDescription: "Veche vatră monahală ortodoxă din Banat",
    region: "banat",
    city: "Șemlacu Mic",
    county: "Timiș",
    patronSaint: "Nașterea Sfântului Ioan Botezătorul",
    foundedYear: 1270,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12156_600x450.jpg"
  },
  {
    name: "Mănăstirea Partoș",
    description: "Mănăstirea Partoș, legată de personalitatea Sfântului Iosif cel Nou de la Partoș, ocrotitorul Banatului, este un important loc de pelerinaj. Sfântul Iosif, originar din Macedonia, a fost mitropolit al Timișoarei în secolul al XVII-lea și a fost canonizat pentru viața sa sfântă și minunile săvârșite.",
    shortDescription: "Mănăstirea Sfântului Iosif cel Nou, ocrotitorul Banatului",
    region: "banat",
    city: "Partoș",
    county: "Timiș",
    patronSaint: "Sfântul Iosif cel Nou",
    foundedYear: 1385,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/120/12040_600x450.jpg"
  },
  {
    name: "Mănăstirea Izvorul Miron",
    description: "Mănăstirea Izvorul Miron, situată într-un cadru natural de excepție, la poalele Munților Semenic, este strâns legată de legenda unui călugăr sihastru pe nume Miron. Izvorul din apropierea mănăstirii este considerat făcător de minuni de către credincioși.",
    shortDescription: "Mănăstire lângă un izvor considerat făcător de minuni",
    region: "banat",
    city: "Românești",
    county: "Caraș-Severin",
    patronSaint: "Înălțarea Sfintei Cruci",
    foundedYear: 1720,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/120/12013_600x450.jpg"
  },
  
  // DOBROGEA
  {
    name: "Mănăstirea Dervent",
    description: "Mănăstirea Dervent, cunoscută pentru crucea de piatră din secolul al XI-lea considerată făcătoare de minuni, este un important centru de pelerinaj din Dobrogea. În fiecare an, mulți credincioși vin aici pentru a participa la sărbătoarea Izvorului Tămăduirii.",
    shortDescription: "Vechi centru spiritual cu o cruce de piatră făcătoare de minuni",
    region: "dobrogea",
    city: "Ostrov",
    county: "Constanța",
    patronSaint: "Sfântul Apostol Andrei",
    foundedYear: 1936,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12126_600x450.jpg",
    website: "https://www.manastireadervent.ro",
    contactPhone: "0769290791",
    contactEmail: "manastireadervent@gmail.com"
  },
  {
    name: "Mănăstirea Peștera Sfântului Apostol Andrei",
    description: "Mănăstirea Peștera Sfântului Apostol Andrei este construită lângă peștera în care, conform tradiției, a locuit Sfântul Apostol Andrei în timpul misiunii sale de creștinare a teritoriului Dobrogei de astăzi. Este unul dintre cele mai importante locuri de pelerinaj din România.",
    shortDescription: "Loc legat de misiunea Sfântului Apostol Andrei în Dobrogea",
    region: "dobrogea",
    city: "Ion Corvin",
    county: "Constanța",
    patronSaint: "Sfântul Apostol Andrei",
    foundedYear: 1943,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11161_600x450.jpg",
    website: "https://manastireapesterasfantulandrei.ro",
    contactPhone: "0241 856 102"
  },
  {
    name: "Mănăstirea Celic-Dere",
    description: "Mănăstirea Celic-Dere, cea mai veche mănăstire din Dobrogea, este situată într-un cadru natural spectaculos în Munții Măcinului. Numele de origine turcă (însemnând „râul curățeniei") atestă vechimea acestui lăcaș de cult din perioada dominației otomane.",
    shortDescription: "Cea mai veche mănăstire din Dobrogea, în Munții Măcinului",
    region: "dobrogea",
    city: "Frecăței",
    county: "Tulcea",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1841,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/116/11686_600x450.jpg"
  },
  {
    name: "Mănăstirea Techirghiol",
    description: "Mănăstirea Techirghiol, cunoscută și ca „Mănăstirea Sfânta Maria", este strâns legată de personalitatea Sfântului Arsenie Boca, care a pictat bisericia mănăstirii. Aici se află mormântul prințesei Ileana a României, devenită mai târziu maica Alexandra.",
    shortDescription: "Mănăstire cu biserică pictată de Părintele Arsenie Boca",
    region: "dobrogea",
    city: "Techirghiol",
    county: "Constanța",
    patronSaint: "Sfântul Mare Mucenic Pantelimon",
    foundedYear: 1928,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12178_600x450.jpg"
  },
  
  // CRIȘANA
  {
    name: "Mănăstirea Izbuc",
    description: "Mănăstirea Izbuc este cunoscută pentru izvorul său intermitent, considerat făcător de minuni, și pentru icoana făcătoare de minuni a Maicii Domnului.",
    shortDescription: "Mănăstire cu izvor intermitent tămăduitor",
    region: "crisana",
    city: "Beiuș",
    county: "Bihor",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1930,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/115/11533_600x450.jpg",
    website: "https://www.episcopiaoradiei.ro/manastirea-izbuc/",
    contactPhone: "0259322694",
    contactEmail: "manastireaizbuc@gmail.com"
  }
];

// Funcția principală pentru import
async function importAllMonasteriesComplete() {
  console.log("Începem importul extins al mănăstirilor din România...");
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const monasteryData of allMonasteries) {
    try {
      // Generăm un slug unic pentru fiecare mănăstire
      const slug = generateUniqueSlug(monasteryData.name);
      
      // Verificăm dacă mănăstirea există deja (după nume)
      const existingMonastery = await db.query.monasteries.findFirst({
        where: (monasteries, { eq }) => eq(monasteries.name, monasteryData.name)
      });
      
      if (existingMonastery) {
        console.log(`Mănăstirea "${monasteryData.name}" există deja. Actualizăm informațiile...`);
        
        // Actualizăm mănăstirea existentă cu datele noi, detaliate
        await db.update(monasteries)
          .set({
            description: monasteryData.description,
            shortDescription: monasteryData.shortDescription || null,
            address: monasteryData.address || `Str. Principală, ${monasteryData.city}, ${monasteryData.county}`,
            history: monasteryData.history || null,
            specialFeatures: monasteryData.specialFeatures || null,
            relics: monasteryData.relics && monasteryData.relics.length > 0 
              ? sql`array[${sql.join(monasteryData.relics)}]::text[]` 
              : sql`ARRAY[]::text[]`,
            images: monasteryData.images && monasteryData.images.length > 0 
              ? sql`array[${sql.join(monasteryData.images)}]::text[]` 
              : sql`ARRAY[]::text[]`,
            coverImage: monasteryData.coverImage,
            contactEmail: monasteryData.contactEmail || null,
            contactPhone: monasteryData.contactPhone || null,
            website: monasteryData.website || null,
            access: monasteryData.access || null,
            latitude: monasteryData.latitude || null,
            longitude: monasteryData.longitude || null,
            updatedAt: new Date()
          })
          .where(sql`${monasteries.name} = ${monasteryData.name}`);
        
        skipCount++;
        console.log(`Informațiile pentru "${monasteryData.name}" au fost actualizate.`);
        continue;
      }
      
      // Inserăm mănăstirea nouă în baza de date
      await db.insert(monasteries).values({
        name: monasteryData.name,
        slug: slug,
        description: monasteryData.description,
        shortDescription: monasteryData.shortDescription || null,
        address: monasteryData.address || `Str. Principală, ${monasteryData.city}, ${monasteryData.county}`,
        region: monasteryData.region,
        city: monasteryData.city,
        county: monasteryData.county,
        access: monasteryData.access || null,
        patronSaint: monasteryData.patronSaint || null,
        patronSaintDate: monasteryData.patronSaintDate ? new Date(monasteryData.patronSaintDate) : null,
        foundedYear: monasteryData.foundedYear || null,
        history: monasteryData.history || null,
        specialFeatures: monasteryData.specialFeatures || null,
        relics: monasteryData.relics && monasteryData.relics.length > 0 
          ? sql`array[${sql.join(monasteryData.relics)}]::text[]` 
          : sql`ARRAY[]::text[]`,
        type: monasteryData.type,
        images: monasteryData.images && monasteryData.images.length > 0 
          ? sql`array[${sql.join(monasteryData.images)}]::text[]` 
          : sql`ARRAY[]::text[]`,
        coverImage: monasteryData.coverImage,
        contactEmail: monasteryData.contactEmail || null,
        contactPhone: monasteryData.contactPhone || null,
        website: monasteryData.website || null,
        latitude: monasteryData.latitude || null,
        longitude: monasteryData.longitude || null,
        verification: "verified",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      successCount++;
      console.log(`Mănăstirea "${monasteryData.name}" a fost importată cu succes.`);
    } catch (error) {
      errorCount++;
      console.error(`Eroare la importul mănăstirii "${monasteryData.name}":`, error);
    }
  }
  
  console.log(`Import finalizat: ${successCount} mănăstiri adăugate, ${skipCount} mănăstiri actualizate, ${errorCount} erori.`);
}

// Rulăm funcția de import
importAllMonasteriesComplete()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Eroare la rularea scriptului:", err);
    process.exit(1);
  });
