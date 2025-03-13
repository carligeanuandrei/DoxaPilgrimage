import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { sql } from "drizzle-orm";

// Tipul de date extins pentru mănăstiri, cu toate informațiile necesare
type ExtendedMonasteryData = {
  name: string;
  description: string;
  shortDescription: string;
  address: string; 
  region: "moldova" | "bucovina" | "muntenia" | "oltenia" | "transilvania" | "maramures" | "banat" | "dobrogea";
  city: string;
  county: string;
  patronSaint?: string;
  patronSaintDate?: string; // Format YYYY-MM-DD
  foundedYear?: number;
  history: string;
  specialFeatures?: string;
  relics: string[];
  iconsMiracles?: string[];
  type: "monastery" | "hermitage" | "church";
  images?: string[];
  coverImage: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  access?: string; // Cum se poate ajunge: transport public, auto, etc.
  latitude?: number;
  longitude?: number;
  importance?: "major" | "medium" | "minor"; // Importanța din punct de vedere turistic/religios
  openHours?: string;
  accommodationAvailable?: boolean;
  accommodationCapacity?: number;
  country: string; // Pentru viitoarea extindere către Athos, etc.
  athosMountainArea?: string; // Specific pentru mănăstirile din Muntele Athos
};

// Funcție pentru generarea unui slug unic
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Baza de date detaliată de mănăstiri din România
const expandedMonasteriesData: ExtendedMonasteryData[] = [
  // === MOLDOVA ===
  {
    name: "Mănăstirea Putna",
    description: "Mănăstirea Putna, ctitorie a lui Ștefan cel Mare (1466-1469), este unul dintre cele mai importante centre spirituale și culturale ale Ortodoxiei românești, supranumită și \"Ierusalimul neamului românesc\". Biserica principală, cu hramul Adormirea Maicii Domnului, adăpostește mormântul ctitorului său, Ștefan cel Mare, precum și mormintele altor membri ai familiei sale. Muzeul mănăstirii conține o colecție impresionantă de artă medievală, inclusiv broderii, manuscrise, icoane și obiecte de cult, multe dintre ele donate de Ștefan cel Mare și urmașii săi. În timpul domniei lui Ștefan cel Mare, aici a funcționat o renumită școală de caligrafi și miniaturiști.",
    shortDescription: "Ctitoria și necropola lui Ștefan cel Mare, unul dintre cele mai importante centre spirituale ale Ortodoxiei românești",
    address: "Str. Mănăstirii nr. 1, Putna, Județul Suceava, 727455",
    region: "bucovina",
    city: "Putna",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2025-08-15",
    foundedYear: 1466,
    history: "Mănăstirea a fost construită între anii 1466-1469 de către Ștefan cel Mare în urma victoriei asupra turcilor la Chilia. A fost concepută ca necropolă domnească, iar aici au fost înmormântați Ștefan cel Mare și membri ai familiei sale. Prima biserică a suferit multiple distrugeri în secolele XVI-XVII cauzate de incendii și invazii. Biserica actuală datează din perioada 1653-1662, fiind ridicată de domnitorul Vasile Lupu și terminată de Gheorghe Ștefan. După anexarea Bucovinei de către Imperiul Habsburgic în 1775, mănăstirea a trecut prin perioade dificile, fiind închisă temporar între 1783-1856. A fost redeschisă și restaurată în perioada modernă, devenind unul dintre cele mai importante centre de pelerinaj din România. În 1992 a fost canonizat Sfântul Iacob Putneanul, fostul mitropolit al Moldovei care s-a retras la Putna.",
    specialFeatures: "Mănăstirea are un complex arhitectural impresionant, care include biserica principală, turnul tezaur, turnul de poartă, muzeul, chiliile monahale și zidurile de incintă. Muzeul mănăstirii adăpostește una dintre cele mai valoroase colecții de artă medievală românească, incluzând broderii, manuscrise, icoane și obiecte de cult de o valoare inestimabilă.",
    relics: ["Părticele din moaștele Sf. Ghenadie de la Putna", "Părticele din moaștele Sf. Iacob Putneanul", "Părticele din moaștele Sfântului Mare Mucenic Gheorghe"],
    iconsMiracles: ["Icoana Maicii Domnului Hodighitria, dăruită de Ștefan cel Mare"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/121/12151_600x450.jpg", 
      "https://www.crestinortodox.ro/files/biserici/11020_mare.jpg",
      "https://basilica.ro/wp-content/uploads/2021/07/Manastirea-Putna-6.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/121/12151_600x450.jpg",
    contactEmail: "secretariat@putna.ro",
    contactPhone: "0230 414 055",
    website: "https://www.putna.ro",
    access: "Accesul la mănăstire se poate face cu mașina pe DN2H (Rădăuți-Putna) sau cu microbuzele care pleacă din orașele Suceava sau Rădăuți. Cea mai apropiată gară este la Rădăuți (25 km), iar cel mai apropiat aeroport la Suceava (60 km).",
    latitude: 47.8728,
    longitude: 25.6003,
    importance: "major",
    openHours: "Zilnic 8:00-20:00 (vara), 8:00-18:00 (iarna)",
    accommodationAvailable: true,
    accommodationCapacity: 100,
    country: "România"
  },
  {
    name: "Mănăstirea Neamț",
    description: "Mănăstirea Neamț, cunoscută și ca \"Lavra Neamțului\", este una dintre cele mai vechi și mai importante mănăstiri din Moldova, cu o tradiție culturală și spirituală de peste șase secole. A fost un important centru de cultură medievală românească, unde a funcționat o renumită școală de caligrafi și miniaturiști care au copiat și împodobit numeroase manuscrise. Biblioteca mănăstirii conține mii de volume rare, iar muzeul adăpostește o colecție impresionantă de artă religioasă. Mănăstirea a jucat un rol crucial în păstrarea și promovarea spiritualității și culturii ortodoxe românești în perioadele dificile ale istoriei.",
    shortDescription: "Cel mai important centru cultural-monastic din Moldova medievală, centru duhovnicesc al ortodoxiei românești",
    address: "Loc. Vânători-Neamț, com. Vânători-Neamț, Jud. Neamț",
    region: "moldova",
    city: "Vânători-Neamț",
    county: "Neamț",
    patronSaint: "Înălțarea Domnului",
    patronSaintDate: "2025-06-05",
    foundedYear: 1407,
    history: "Prima atestare documentară a mănăstirii datează din 1407, dintr-un hrisov al domnitorului Alexandru cel Bun. Biserica actuală a fost construită între 1497-1498, în timpul domniei lui Ștefan cel Mare. În secolele XIV-XIX, mănăstirea a fost un important centru cultural unde s-au copiat și tradus numeroase cărți bisericești și laice. În secolul al XVIII-lea, sub îndrumarea starețului Paisie Velicikovski, mănăstirea a devenit un important centru de renaștere spirituală, cunoscut în toată lumea ortodoxă. Paisie a adus cu el o importantă bibliotecă și a organizat o comunitate monastică de peste 500 de călugări, atrăgând discipoli din toate țările ortodoxe. În timpul regimului comunist, mănăstirea a rămas deschisă, dar cu un număr redus de călugări.",
    specialFeatures: "Biserica principală, ctitorie a lui Ștefan cel Mare, este un exemplu remarcabil de arhitectură moldovenească, cu elemente gotice și bizantine. Turnul lui Ștefan cel Mare, construit în 1497, dominează ansamblul. Muzeul mănăstirii conține o colecție impresionantă de cărți vechi, manuscrise, icoane, obiecte de cult și broderii. Biblioteca veche a mănăstirii, reorganizată de Paisie Velicikovski, a fost una dintre cele mai importante din Moldova medievală.",
    relics: ["Moaștele Sf. Paisie de la Neamț", "Icoana făcătoare de minuni a Maicii Domnului", "Părticele din moaștele Sf. Gheorghe", "Părticele din moaștele Sf. Ioan cel Nou de la Suceava"],
    iconsMiracles: ["Icoana făcătoare de minuni a Maicii Domnului \"Hodighitria\"", "Icoana Maicii Domnului dăruită de Ștefan cel Mare"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/111/11133_600x450.jpg",
      "https://basilica.ro/wp-content/uploads/2020/05/manastirea-neamt-2.jpg",
      "https://ortodoxinfo.ro/wp-content/uploads/2022/11/Manastirea-Neamt-scaled.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/111/11133_600x450.jpg",
    contactEmail: "manastireaneamt@gmail.com",
    contactPhone: "0233 251 580",
    website: "https://manastireaneamt.ro",
    access: "Accesul se poate face cu mașina pe DN15B sau cu mijloace de transport în comun din orașele Târgu Neamț sau Piatra Neamț. Cea mai apropiată gară este la Târgu Neamț (10 km), iar cel mai apropiat aeroport la Bacău (100 km).",
    latitude: 47.2634,
    longitude: 26.2136,
    importance: "major",
    openHours: "Zilnic 7:00-19:00",
    accommodationAvailable: true,
    accommodationCapacity: 150,
    country: "România"
  },
  {
    name: "Mănăstirea Sihăstria",
    description: "Mănăstirea Sihăstria este unul dintre cele mai importante centre duhovnicești ale Ortodoxiei românești, renumită pentru marii duhovnici care au viețuit aici, precum Părintele Cleopa Ilie și Părintele Paisie Olaru. Așezată într-o poiană înconjurată de păduri, în apropierea Munților Neamțului, mănăstirea oferă un cadru natural propice rugăciunii și contemplației. A devenit un important centru de pelerinaj și de îndrumare spirituală, unde mii de credincioși vin pentru a primi sfat duhovnicesc și mângâiere sufletească.",
    shortDescription: "Vatră de spiritualitate isihastă și duhovnicească, loc de viețuire al marilor duhovnici Cleopa Ilie și Paisie Olaru",
    address: "Loc. Vânători-Neamț, com. Vânători-Neamț, Jud. Neamț",
    region: "moldova",
    city: "Vânători-Neamț",
    county: "Neamț",
    patronSaint: "Nașterea Maicii Domnului",
    patronSaintDate: "2025-09-08",
    foundedYear: 1655,
    history: "Mănăstirea a fost întemeiată în secolul al XVII-lea de către câțiva călugări din obștea Mănăstirii Secu. Prima biserică a fost construită din lemn de starețul Atanasie împreună cu câțiva ucenici. În 1734, schitul a fost ars de tătari, iar în 1741 a fost refăcut de starețul Atanasie. Biserica actuală a fost construită între 1824-1826. Mănăstirea Sihăstria a devenit un important centru duhovnicesc în secolul XX, mai ales datorită personalității părintelui Cleopa Ilie, care a fost stareț aici între 1944-1945 și 1954-1956. Începând cu anii '60, Părintele Cleopa a devenit unul dintre cei mai căutați duhovnici din România, atrăgând mii de pelerini. Alături de el, Părintele Paisie Olaru a fost un alt mare duhovnic care a viețuit la Sihăstria.",
    specialFeatures: "Biserica principală este în stil moldovenesc, simplă și armonioasă. Mănăstirea dispune de un muzeu care păstrează obiecte personale ale Părintelui Cleopa și ale altor duhovnici, cărți vechi și icoane. Cimitirul mănăstirii adăpostește mormintele marilor duhovnici Cleopa Ilie și Paisie Olaru, locuri de pelerinaj pentru credincioși.",
    relics: ["Părticele din moaștele Sf. Teodora de la Sihla", "Părticele din moaștele Sf. Pantelimon"],
    iconsMiracles: ["Icoana făcătoare de minuni a Maicii Domnului"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg",
      "https://basilica.ro/wp-content/uploads/2021/06/Manastirea-Sihastria-3.jpg",
      "https://ziarullumina.ro/files/resize/locations/13/15101-1110x740.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg",
    contactEmail: "manastireasihastria@gmail.com",
    contactPhone: "0233 251 896",
    website: "https://manastireasihastria.ro",
    access: "Accesul se poate face cu mașina pe DN15B, la aproximativ 5 km de Mănăstirea Neamț, sau cu mijloace de transport în comun din Târgu Neamț. În apropiere se află și Mănăstirea Secu (2 km) și Schitul Sihla (7 km).",
    latitude: 47.2327,
    longitude: 26.1951,
    importance: "major",
    openHours: "Zilnic 6:00-20:00",
    accommodationAvailable: true,
    accommodationCapacity: 80,
    country: "România"
  },
  {
    name: "Mănăstirea Văratec",
    description: "Mănăstirea Văratec, cea mai mare mănăstire de maici din România, este un important centru spiritual și cultural situat într-un cadru natural deosebit, la poalele Munților Neamțului. Biserica principală, cu hramul Adormirea Maicii Domnului, impresionează prin arhitectura sa și frumoasele picturi interioare. Mănăstirea este strâns legată de personalitatea starețelor Olimpiada Alcaz și Veronica Micle. Aici se află mormântul Veronicăi Micle, muza poetului Mihai Eminescu, care a trăit ultimele zile ale vieții sale la această mănăstire.",
    shortDescription: "Cea mai mare mănăstire de maici din România, loc de odihnă al poetei Veronica Micle",
    address: "Loc. Văratec, com. Agapia, Jud. Neamț",
    region: "moldova",
    city: "Văratec",
    county: "Neamț",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2025-08-15",
    foundedYear: 1785,
    history: "Mănăstirea a fost înființată în jurul anului 1785 de către maica Olimpiada, cu sprijinul duhovnicesc al starețului Paisie de la Neamț. Prima biserică de lemn a fost construită între 1785-1789. Biserica mare, cu hramul Adormirea Maicii Domnului, a fost construită între 1808-1812, fiind renovată și mărită în 1841-1845. Mănăstirea a avut de suferit în urma reformelor lui Cuza din 1863, când a pierdut majoritatea moșiilor. Biserica Sf. Ioan Botezătorul a fost construită în 1844, iar Biserica Sfânta Treime în 1847. În timpul Primului Război Mondial, mănăstirea a fost devastată, iar obiectele de valoare au fost luate de trupele de ocupație. În cimitirul mănăstirii se află mormântul poetei Veronica Micle (1850-1889), muza lui Mihai Eminescu, care a murit la această mănăstire.",
    specialFeatures: "Complexul monastic cuprinde trei biserici: Biserica Adormirea Maicii Domnului (biserica principală), Biserica Sfântul Ioan Botezătorul și Biserica Sfânta Treime. Arhitectura este specifică stilului moldovenesc, cu elemente neoclasice. Mănăstirea păstrează numeroase obiecte de artă religioasă, cărți vechi și icoane valoroase.",
    relics: ["Părticele din moaștele Sf. Nectarie din Eghina"],
    iconsMiracles: ["Icoana Maicii Domnului cu Pruncul"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/122/12287_600x450.jpg",
      "https://www.crestinortodox.ro/files/biserici/3903_mare.jpg",
      "https://basilica.ro/wp-content/uploads/2022/06/Manastirea-Varatec-1.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12287_600x450.jpg",
    contactEmail: "contact@manastireavaratec.ro",
    contactPhone: "0233 244 698",
    website: "https://manastireavaratec.ro",
    access: "Accesul se poate face cu mașina pe DJ155F din direcția Târgu Neamț sau Piatra Neamț, fiind situată la aproximativ 12 km de Târgu Neamț și la 4 km de Mănăstirea Agapia.",
    latitude: 47.2079,
    longitude: 26.1824,
    importance: "major",
    openHours: "Zilnic 6:00-20:00",
    accommodationAvailable: true,
    accommodationCapacity: 120,
    country: "România"
  },
  {
    name: "Mănăstirea Sucevița",
    description: "Mănăstirea Sucevița, inclusă în patrimoniul UNESCO, este una dintre cele mai valoroase ctitorii ale Moldovei medievale. Ultima dintre mănăstirile pictate din Bucovina, este remarcabilă pentru picturile exterioare în care predomină culoarea verde și pentru impresionanta scenă \"Scara Virtuților\". Fortificată ca o adevărată cetate, cu ziduri înalte și turnuri de apărare, mănăstirea păstrează în interior picturi murale și obiecte de cult de o valoare inestimabilă, inclusiv broderii lucrate cu fir de aur și argint.",
    shortDescription: "Ultima mănăstire pictată din Bucovina, monument UNESCO, cu picturi exterioare predominant verzi",
    address: "Loc. Sucevița, com. Sucevița, Jud. Suceava",
    region: "bucovina",
    city: "Sucevița",
    county: "Suceava",
    patronSaint: "Învierea Domnului",
    patronSaintDate: "2025-04-20",
    foundedYear: 1584,
    history: "Mănăstirea a fost construită între 1582-1584 de către frații Ieremia, Simion și Gheorghe Movilă. Biserica a fost finalizată în 1585, iar picturile murale, atât interioare cât și exterioare, datează din perioada 1595-1596, fiind realizate de meșterii Ioan și Sofronie, împreună cu călugărul Gavril. Ansamblul monastic a fost fortificat cu ziduri puternice și turnuri de apărare, transformând mănăstirea într-o adevărată fortăreață. Mănăstirea a fost locuită de călugări până în 1783, când Bucovina a fost anexată de Imperiul Habsburgic. A fost reînființată în 1992 ca mănăstire de maici. În 2010, ansamblul monastic a fost inclus în patrimoniul mondial UNESCO.",
    specialFeatures: "Biserica este construită în stil moldovenesc, cu elemente gotice și bizantine. Ceea ce face Sucevița unică sunt picturile exterioare, în care predomină culoarea verde (\"verdele de Sucevița\"). Pe fațada de nord se află celebra scenă \"Scara Virtuților\", reprezentând urcușul spre Rai și căderea păcătoșilor. Mănăstirea este înconjurată de ziduri de incintă masive, cu o înălțime de 6 metri și grosime de 3 metri, cu 4 turnuri de colț.",
    relics: ["Icoana făcătoare de minuni a Maicii Domnului", "Părticele din moaștele Sf. Ioan cel Nou de la Suceava"],
    iconsMiracles: ["Icoana făcătoare de minuni a Maicii Domnului"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/111/11120_600x450.jpg",
      "https://basilica.ro/wp-content/uploads/2022/08/Manastirea-Sucevita-1.jpg",
      "https://www.historia.ro/cdn/historia2/images/2021/01/30/13/3b82d9c28bef2e7a.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/111/11120_600x450.jpg",
    contactEmail: "manastirea.sucevita@gmail.com",
    contactPhone: "0230 417 364",
    website: "https://manastireasucevita.ro",
    access: "Accesul se poate face cu mașina pe DJ177A, fiind situată la aproximativ 18 km de Rădăuți și 45 km de Suceava. Există și curse regulate de autobuz din Rădăuți.",
    latitude: 47.7783,
    longitude: 25.7134,
    importance: "major",
    openHours: "Zilnic 8:00-19:00 (vara), 8:00-17:00 (iarna)",
    accommodationAvailable: true,
    accommodationCapacity: 60,
    country: "România"
  },
  
  // === OLTENIA ===
  {
    name: "Mănăstirea Tismana",
    description: "Mănăstirea Tismana, cea mai veche mănăstire din Țara Românească, este ctitoria Sfântului Nicodim de la Tismana. Așezată spectaculos pe un pisc stâncos, lângă o cascadă impresionantă, mănăstirea a jucat un rol important în istoria și cultura medievală românească. De-a lungul secolelor, a fost un important centru cultural și spiritual, unde s-au copiat manuscrise și s-au păstrat valoroase opere de artă. În timpul Revoluției de la 1821, aici s-a refugiat Tudor Vladimirescu cu pandurii săi, iar în timpul celui de-al Doilea Război Mondial, mănăstirea a adăpostit tezaurul Băncii Naționale a României.",
    shortDescription: "Cea mai veche mănăstire din Țara Românească, ctitoria Sf. Nicodim, așezată pe un pisc stâncos lângă o cascadă",
    address: "Loc. Tismana, Jud. Gorj",
    region: "oltenia",
    city: "Tismana",
    county: "Gorj",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2025-08-15",
    foundedYear: 1376,
    history: "Mănăstirea a fost construită între 1375-1378 de către Sfântul Nicodim, cu sprijinul domnitorului Radu I. Biserica inițială a fost refăcută de mai multe ori de-a lungul secolelor. Macheta originală a bisericii se păstrează în Muzeul de Artă de la Viena. De-a lungul secolelor, Tismana a fost un important centru cultural și spiritual, aici funcționând o școală de copiști și caligrafi. În timpul Revoluției de la 1821, mănăstirea a fost sediul pandurilor lui Tudor Vladimirescu. În timpul celui de-al Doilea Război Mondial, între 1944-1947, aici a fost adăpostit tezaurul Băncii Naționale a României. În perioada comunistă, mănăstirea a fost transformată în muzeu, iar din 1966 a redevenit mănăstire de maici.",
    specialFeatures: "Biserica mănăstirii, în stil bizantin, păstrează picturi murale de mare valoare din secolul al XIX-lea, realizate de zugravul Dimitrie Diaconul. Complexul monahal include și clădiri administrative, chilii, un muzeu și o bibliotecă valoroasă. În apropierea mănăstirii se află o cascadă spectaculoasă și peștera unde, conform tradiției, s-a nevoit Sfântul Nicodim.",
    relics: ["Părticele din moaștele Sf. Nicodim de la Tismana", "Părticele din moaștele Sf. Grigorie Decapolitul"],
    iconsMiracles: ["Icoana făcătoare de minuni a Maicii Domnului, dăruită de Sf. Nicodim"],
    type: "monastery",
    images: [
      "https://www.crestinortodox.ro/files/article/122/12235_600x450.jpg",
      "https://basilica.ro/wp-content/uploads/2023/06/Manastirea-Tismana.jpg",
      "https://www.historia.ro/cdn/historia2/images/2022/10/06/06/03-9b4ead0028.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12235_600x450.jpg",
    contactEmail: "manastireatismana@gmail.com",
    contactPhone: "0253 374 315",
    website: "https://www.manastireatismana.ro",
    access: "Accesul se poate face cu mașina pe DN67, fiind situată la aproximativ 30 km de orașul Târgu Jiu. Există și curse regulate de autobuz din Târgu Jiu.",
    latitude: 45.0449,
    longitude: 22.8493,
    importance: "major",
    openHours: "Zilnic 7:00-20:00 (vara), 7:00-19:00 (iarna)",
    accommodationAvailable: true,
    accommodationCapacity: 70,
    country: "România"
  },
  {
    name: "Mănăstirea Horezu",
    description: "Mănăstirea Horezu, inclusă în patrimoniul mondial UNESCO, este o capodoperă a stilului arhitectural brâncovenesc și cea mai importantă ctitorie a domnitorului Constantin Brâncoveanu. Ansamblul monastic impresionează prin unitatea și armonia arhitecturală, prin bogăția decorațiilor sculptate în piatră și lemn, precum și prin frescele de o calitate artistică excepțională. Complexul monastic include biserica principală, paraclisul, bolnița, chiliile și alte clădiri auxiliare. Mănăstirea a fost și un important centru cultural unde a funcționat o școală de caligrafie și miniatură.",
    shortDescription: "Capodoperă a stilului brâncovenesc inclusă în patrimoniul UNESCO, cea mai importantă ctitorie a lui Constantin Brâncoveanu",
    address: "Str. Mănăstirii nr. 1, Romanii de Jos, Jud. Vâlcea",
    region: "oltenia",
    city: "Horezu",
    county: "Vâlcea",
    patronSaint: "Sfinții Împărați Constantin și Elena",
    patronSaintDate: "2025-05-21",
    foundedYear: 1690,
    history: "Mănăstirea a fost construită între 1690-1693, la inițiativa domnitorului Constantin Brâncoveanu. Biserica principală a fost târnosită la 8 septembrie 1693. Construcția a fost coordonată de starețul Ioan Arhimandritul, iar pictura a fost realizată de echipa condusă de Constantinos, cel mai renumit zugrav al epocii, împreună cu ucenicii săi. Stilul arhitectural și decorativ, cunoscut astăzi ca \"stil brâncovenesc\", îmbină armonios elemente tradiționale românești cu influențe venețiene, orientale și baroce. La Horezu a funcționat o importantă școală de sculptură, pictură și caligrafie. În 1993, mănăstirea a fost inclusă în patrimoniul mondial UNESCO.",
    specialFeatures: "Arhitectura mănăstirii reprezintă cea mai înaltă expresie a stilului brâncovenesc, caracterizat prin îmbinarea armonioasă a elementelor bizantine, orientale, baroce și renascentiste. Sculpturile în piatră de la portaluri, ancadramente, coloane și capiteluri sunt de o calitate artistică excepțională. Pictura murală din biserica principală, realizată de Constantinos și elevii săi, impresionează prin rafinament și expresivitate.",
    relics: ["Părticele din moaștele Sf. Grigorie Decapolitul", "Părticele din moaștele Sf. Mucenic Mercurie"],
    iconsMiracles: ["Icoana Maicii Domnului \"Pantanassa\"", "Icoana Sfinților Împărați Constantin și Elena"],
    type: "monastery",
    images: [
      "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2014/06/manastirea_horezu.jpg",
      "https://ziarullumina.ro/files/resize/locations/102/19391-1110x740.jpg",
      "https://basilica.ro/wp-content/uploads/2020/12/manastirea-horezu.jpg"
    ],
    coverImage: "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2014/06/manastirea_horezu.jpg",
    contactEmail: "manastireahorezu@gmail.com",
    contactPhone: "0250 860 071",
    website: "https://www.manastireahorezu.ro",
    access: "Accesul se poate face cu mașina pe DN67, fiind situată la aproximativ 10 km de orașul Horezu. Există și curse regulate de autobuz din Râmnicu Vâlcea (45 km).",
    latitude: 45.1702,
    longitude: 24.0364,
    importance: "major",
    openHours: "Zilnic 8:00-20:00 (vara), 8:00-18:00 (iarna)",
    accommodationAvailable: true,
    accommodationCapacity: 50,
    country: "România"
  }
];

// Funcția principală pentru import
async function importExpandedMonasteries() {
  console.log("Începem importul detaliat al mănăstirilor și schiturilor din România...");
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const monasteryData of expandedMonasteriesData) {
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
            shortDescription: monasteryData.shortDescription,
            address: monasteryData.address,
            history: monasteryData.history,
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
        shortDescription: monasteryData.shortDescription,
        address: monasteryData.address,
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
        verification: true,
        administratorId: null,
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
importExpandedMonasteries()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Eroare la rularea scriptului:", err);
    process.exit(1);
  });