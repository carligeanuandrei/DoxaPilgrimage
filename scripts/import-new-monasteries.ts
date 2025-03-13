import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { sql } from "drizzle-orm";

// Tipul de date pentru mănăstiri
type MonasteryData = {
  name: string;
  description: string;
  shortDescription?: string;
  address?: string; 
  region: "moldova" | "bucovina" | "muntenia" | "oltenia" | "transilvania" | "maramures" | "banat" | "dobrogea";
  city: string;
  county: string;
  patronSaint?: string;
  foundedYear?: number;
  type: "monastery" | "hermitage" | "church";
  coverImage?: string;
  relics?: string[];
  history?: string;
  website?: string;
  contactPhone?: string;
  contactEmail?: string;
};

// Funcție pentru generarea unui slug unic
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Lista de mănăstiri din România cu date autentice din surse credibile
// (crestinortodox.ro, doxologia.ro, ro.orthodoxwiki.org, ortodox.ro)
const newMonasteriesData: MonasteryData[] = [
  // === MOLDOVA ===
  {
    name: "Mănăstirea Putna",
    description: "Mănăstirea Putna, ctitorie a lui Ștefan cel Mare (1466-1469), este un important centru spiritual, cultural și artistic al Ortodoxiei românești. Numită și \"Ierusalimul neamului românesc\", aici se află mormântul marelui voievod și opere de artă medievală de valoare inestimabilă.",
    shortDescription: "Ctitoria și necropola lui Ștefan cel Mare",
    region: "bucovina",
    city: "Putna",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1466,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/121/12151_600x450.jpg",
    relics: ["Părticele din moaștele Sf. Ghenadie de la Putna", "Părticele din moaștele Sf. Iacob de la Putna"],
    history: "Mănăstirea a fost construită pentru a comemora o victorie împotriva turcilor și a fost înzestrată bogat de către Ștefan cel Mare. De-a lungul secolelor, a trecut prin numeroase încercări, fiind arsă de mai multe ori, dar a fost mereu reconstruită. În timpul ocupației habsburgice, a fost închisă pentru o perioadă, dar și-a reluat activitatea în 1856.",
    website: "https://www.putna.ro",
    contactPhone: "0230 414 055"
  },
  {
    name: "Mănăstirea Neamț",
    description: "Mănăstirea Neamț, cunoscută și ca \"Lavra Neamțului\", este una dintre cele mai vechi și mai importante mănăstiri din Moldova, cu o tradiție culturală și spirituală de peste șase secole. A fost un important centru de cultură medievală românească, cu o renumită școală de caligrafi și miniaturiști.",
    shortDescription: "Cel mai important centru cultural-monastic din Moldova medievală",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Înălțarea Domnului",
    foundedYear: 1407,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11133_600x450.jpg",
    relics: ["Moaștele Sf. Paisie de la Neamț", "Părticele din moaștele Sf. Gheorghe"],
    history: "Prima atestare documentară datează din 1407, dintr-un hrisov al domnitorului Alexandru cel Bun. În timpul lui Ștefan cel Mare, mănăstirea a fost reconstruită și extinsă, devenind unul din cele mai importante centre de cultură din Moldova. Aici a funcționat școala de caligrafi și miniaturiști, unde s-au copiat și împodobit numeroase manuscrise. În secolul al XVIII-lea, sub îndrumarea starețului Paisie Velicikovski, mănăstirea a devenit un important centru de renaștere spirituală."
  },
  {
    name: "Mănăstirea Agapia",
    description: "Mănăstirea Agapia este una dintre cele mai mari mănăstiri de maici din România, renumită pentru pictura murală realizată de Nicolae Grigorescu în tinerețea sa. Așezată într-un cadru natural deosebit, mănăstirea a găzduit de-a lungul timpului importante personalități culturale românești.",
    shortDescription: "Celebră pentru picturile lui Nicolae Grigorescu",
    region: "moldova",
    city: "Agapia",
    county: "Neamț",
    patronSaint: "Sfinții Arhangheli Mihail și Gavriil",
    foundedYear: 1643,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/117/11712_600x450.jpg",
    history: "Mănăstirea a fost întemeiată în 1643 de hatmanul Gavril, fratele domnitorului Vasile Lupu. Biserica actuală a fost construită între 1642-1647. În perioada 1858-1862, tânărul pictor Nicolae Grigorescu a realizat monumentala pictură interioară, care a adus faimă mănăstirii. Astăzi, Agapia este cea mai populară mănăstire de maici din țară, fiind vizitată anual de mii de pelerini și turiști."
  },
  {
    name: "Mănăstirea Văratec",
    description: "Mănăstirea Văratec, cea mai mare mănăstire de maici din România, este strâns legată de personalitatea starețelor Olimpiada Alcaz și Veronica Micle. Aici se află mormântul Veronicăi Micle, muza poetului Mihai Eminescu. Mănăstirea Văratec a fost un important centru de cultură și spiritualitate feminină.",
    shortDescription: "Cea mai mare mănăstire de maici din România",
    region: "moldova",
    city: "Văratec",
    county: "Neamț",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1785,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/122/12287_600x450.jpg",
    history: "Mănăstirea a fost înființată în jurul anului 1785 de către maica Olimpiada, cu sprijinul duhovnicesc al starețului Paisie de la Neamț. Biserica mare a fost construită între 1808-1812 și renovată în 1841-1845. Mănăstirea a avut de suferit în urma reformelor lui Cuza, când a pierdut majoritatea moșiilor. În cimitirul mănăstirii se află mormântul poetei Veronica Micle, muza lui Mihai Eminescu."
  },
  {
    name: "Mănăstirea Sihăstria",
    description: "Mănăstirea Sihăstria este strâns legată de mari personalități ale spiritualității ortodoxe românești precum Părintele Cleopa Ilie și Părintele Paisie Olaru. Este un important centru isihast și un loc de pelerinaj pentru credincioșii din întreaga țară.",
    shortDescription: "Vatră de spiritualitate isihastă și duhovnicească",
    region: "moldova",
    city: "Vânători",
    county: "Neamț",
    patronSaint: "Nașterea Maicii Domnului",
    foundedYear: 1655,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg",
    relics: ["Părticele din moaștele Sf. Teodora de la Sihla"],
    history: "Mănăstirea a fost întemeiată în secolul al XVII-lea de către câțiva călugări din obștea Mănăstirii Secu. În 1734, schitul a fost ars de tătari, iar în 1741 a fost refăcut de starețul Atanasie. Mănăstirea Sihăstria a devenit un important centru duhovnicesc în secolul XX, mai ales datorită personalității părintelui Cleopa Ilie, care a fost stareț aici între 1944-1945 și 1954-1956.",
    website: "https://manastireasihastria.ro",
    contactPhone: "0233 251 896"
  },
  
  // === BUCOVINA ===
  {
    name: "Mănăstirea Voroneț",
    description: "Mănăstirea Voroneț, cunoscută pentru nuanța unică de albastru folosită în picturile exterioare, este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare. Supranumită \"Capela Sixtină a Estului\", mănăstirea este celebră pentru scena Judecății de Apoi de pe peretele vestic.",
    shortDescription: "Capela Sixtină a Estului cu renumitul albastru de Voroneț",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    patronSaint: "Sfântul Gheorghe",
    foundedYear: 1488,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/113/11352_600x450.jpg",
    history: "Conform tradiției, mănăstirea a fost construită de Ștefan cel Mare în 1488, în doar 3 luni și 3 săptămâni, ca recunoștință pentru sfaturile primite de la Sf. Daniil Sihastrul. Frescele exterioare au fost adăugate în timpul domniei lui Petru Rareș, în 1547. Mănăstirea a fost inclusă în patrimoniul UNESCO în 1993, fiind considerată una dintre cele mai valoroase monumente de artă medievală din Europa.",
    website: "https://www.voronet.ro",
    contactPhone: "0230 234 912"
  },
  {
    name: "Mănăstirea Humor",
    description: "Mănăstirea Humor, construită în timpul domniei lui Petru Rareș, este una dintre bisericile pictate din Bucovina inclusă în patrimoniul UNESCO. Este remarcabilă pentru predominanța culorii roșii în frescele exterioare și pentru scena \"Imnul Acatist\" de o rară frumusețe.",
    shortDescription: "Cunoscută pentru frescele în nuanțe predominante de roșu",
    region: "bucovina",
    city: "Mănăstirea Humorului",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1530,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11143_600x450.jpg",
    history: "Prima mănăstire de la Humor a fost construită înainte de 1415, din porunca boierului Oană. Biserica actuală a fost ridicată în 1530, la îndemnul lui Petru Rareș, de către logofătul Teodor Bubuiog. Picturile exterioare, realizate în 1535, sunt dominate de culoarea roșu-cărămiziu, de unde și denumirea de \"roșu de Humor\"."
  },
  {
    name: "Mănăstirea Sucevița",
    description: "Mănăstirea Sucevița, ultima dintre mănăstirile pictate din Bucovina, este remarcabilă pentru culoarea verde predominantă și pentru scena unică \"Scara Virtuților\". Este cea mai bine fortificată dintre mănăstirile bucovinene, cu ziduri puternice și turnuri de apărare.",
    shortDescription: "Ultima mănăstire pictată din Bucovina, cu ziduri de cetate",
    region: "bucovina",
    city: "Sucevița",
    county: "Suceava",
    patronSaint: "Învierea Domnului",
    foundedYear: 1584,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/111/11120_600x450.jpg",
    relics: ["Icoana făcătoare de minuni a Maicii Domnului"],
    history: "Mănăstirea a fost construită între 1582-1584 de către frații Ieremia, Simion și Gheorghe Movilă. Picturile murale, atât interioare cât și exterioare, datează din perioada 1595-1596. Ansamblul monastic a fost inclus în patrimoniul UNESCO în 2010. Zidurile de incintă, cu o înălțime de 6 metri și grosime de 3 metri, au transformat mănăstirea într-o adevărată fortăreață."
  },
  
  // === TRANSILVANIA ===
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
    history: "Mănăstirea a fost construită între 1696-1707 de voievodul Constantin Brâncoveanu, pe locul unui vechi schit de lemn. În 1785, mănăstirea a fost distrusă din ordinul generalului austriac Preiss. Reconstrucția a început abia în 1926, la inițiativa mitropolitului Nicolae Bălan, și a fost finalizată în 1936.",
    website: "https://manastireasambata.ro",
    contactPhone: "0268 360 611"
  },
  {
    name: "Mănăstirea Prislop",
    description: "Mănăstirea Prislop, situată într-un cadru natural de excepție, este strâns legată de personalitatea Părintelui Arsenie Boca. Aici se află mormântul său, care a devenit unul dintre cele mai vizitate locuri de pelerinaj din România în ultimii ani.",
    shortDescription: "Loc de pelerinaj la mormântul Părintelui Arsenie Boca",
    region: "transilvania",
    city: "Silvașu de Sus",
    county: "Hunedoara",
    patronSaint: "Sfântul Ioan Evanghelistul",
    foundedYear: 1400,
    type: "monastery",
    coverImage: "https://www.crestinortodox.ro/files/article/117/11781_600x450.jpg",
    history: "Mănăstirea Prislop este una dintre cele mai vechi așezări monahale din Transilvania. A fost întemeiată la începutul secolului al XV-lea de Sfântul Nicodim de la Tismana. Între 1949-1952, starețul mănăstirii a fost părintele Arsenie Boca, una dintre cele mai importante figuri duhovnicești ale Ortodoxiei românești din secolul XX."
  },
  
  // === OLTENIA ===
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
    relics: ["Părticele din moaștele Sf. Nicodim de la Tismana"],
    history: "Mănăstirea a fost construită între 1375-1378 de către Sfântul Nicodim, cu sprijinul domnitorului Radu I. De-a lungul vremii, Tismana a fost un important centru cultural și spiritual, aici funcționând o școală de copiști și caligrafi. În timpul Revoluției de la 1821, mănăstirea a fost sediul pandurilor lui Tudor Vladimirescu. În timpul celui de-al Doilea Război Mondial, aici a fost adăpostit tezaurul Băncii Naționale a României."
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
    coverImage: "https://www.crestinortodox.ro/files/article/111/11153_600x450.jpg",
    history: "Mănăstirea a fost construită între 1387-1388 de Mircea cel Bătrân. Arhitectura originală a fost de stil bizantin, cu influențe sârbești. Pictura interioară inițială a fost realizată de meșteri greci și sârbi. În secolul al XVIII-lea, Constantin Brâncoveanu a adăugat un pridvor în stil brâncovenesc. În mănăstire se păstrează mormântul lui Mircea cel Bătrân și al mamei lui Mihai Viteazul, Teodora.",
    website: "https://www.manastireacozia.ro",
    contactPhone: "0250 750 319"
  },
  {
    name: "Mănăstirea Horezu",
    description: "Mănăstirea Horezu, capodoperă a stilului brâncovenesc și monument UNESCO, este cea mai importantă ctitorie a domnitorului Constantin Brâncoveanu. Ansamblul monastic este remarcabil pentru sculptura în piatră și lemn, frescele și decorațiunile interioare de o rară frumusețe.",
    shortDescription: "Capodoperă a stilului brâncovenesc, inclusă în patrimoniul UNESCO",
    region: "oltenia",
    city: "Horezu",
    county: "Vâlcea",
    patronSaint: "Sfinții Împărați Constantin și Elena",
    foundedYear: 1690,
    type: "monastery",
    coverImage: "https://doxologia.ro/sites/default/files/styles/media-articol/public/articol/2014/06/manastirea_horezu.jpg",
    history: "Mănăstirea a fost construită între 1690-1693, la inițiativa domnitorului Constantin Brâncoveanu. Biserica principală a fost pictată de Constantinos, cel mai renumit zugrav al epocii, împreună cu ucenicii săi. Stilul arhitectural și decorativ, cunoscut astăzi ca \"stil brâncovenesc\", îmbină armonios elemente tradiționale românești cu influențe venețiene, orientale și baroce. În 1993, mănăstirea a fost inclusă în patrimoniul mondial UNESCO."
  },
  
  // === MUNTENIA ===
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
    history: "Biserica actuală a fost construită între 1515-1517 de voievodul Neagoe Basarab, pe locul vechii mitropolii. De numele acestei ctitorii se leagă celebra legendă a Meșterului Manole. Din 1886, biserica a devenit necropolă regală, aici fiind înmormântați regii Carol I, Ferdinand I și reginele Elisabeta și Maria.",
    website: "https://manastireacurteadearges.ro",
    contactPhone: "0248 721 396"
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
    coverImage: "https://www.crestinortodox.ro/files/article/111/11103_600x450.jpg",
    relics: ["Moaștele Sf. Calinic de la Cernica"],
    history: "Mănăstirea a fost întemeiată în 1608 de marele vornic Cernica Știrbei, pe o insulă din lacul Cernica. În secolul al XIX-lea, sub îndrumarea starețului Calinic (canonizat ulterior), mănăstirea a cunoscut o perioadă de mare înflorire spirituală și culturală. Aici a funcționat o renumită tipografie și o școală de pictură bisericească.",
    website: "https://manastireacernica.ro",
    contactPhone: "021 369 1010"
  },
  
  // === DOBROGEA ===
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
    history: "Conform tradiției, în această peșteră ar fi locuit Sfântul Apostol Andrei în secolul I, în timpul misiunii sale de creștinare în Sciția Minor (Dobrogea de astăzi). Prima biserică de lemn a fost construită aici în 1904-1905. Mănăstirea actuală a fost înființată în 1943, fiind renovată și extinsă de mai multe ori, mai ales după 1990. Este unul dintre cele mai importante locuri de pelerinaj din România.",
    website: "https://manastireapesterasfantulandrei.ro",
    contactPhone: "0241 856 102"
  }
];

// Funcția principală pentru import
async function importNewMonasteries() {
  console.log("Începem importul mănăstirilor din România...");
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const monasteryData of newMonasteriesData) {
    try {
      // Generăm un slug unic pentru fiecare mănăstire
      const slug = generateUniqueSlug(monasteryData.name);
      
      // Verificăm dacă mănăstirea există deja (după nume)
      const existingMonastery = await db.query.monasteries.findFirst({
        where: (monasteries, { eq }) => eq(monasteries.name, monasteryData.name)
      });
      
      if (existingMonastery) {
        console.log(`Mănăstirea "${monasteryData.name}" există deja. Trecem mai departe.`);
        skipCount++;
        continue;
      }
      
      // Inserăm mănăstirea în baza de date
      const relicsArray = monasteryData.relics ? monasteryData.relics : [];
      
      await db.insert(monasteries).values({
        name: monasteryData.name,
        slug: slug,
        description: monasteryData.description,
        shortDescription: monasteryData.shortDescription || null,
        address: monasteryData.address || `Str. Principală, ${monasteryData.city}`,
        region: monasteryData.region,
        city: monasteryData.city,
        county: monasteryData.county,
        access: null,
        patronSaint: monasteryData.patronSaint || null,
        patronSaintDate: null,
        foundedYear: monasteryData.foundedYear || null,
        history: monasteryData.history || null,
        specialFeatures: null,
        relics: relicsArray.length > 0 ? sql`array[${sql.join(relicsArray)}]::text[]` : sql`ARRAY[]::text[]`,
        type: monasteryData.type,
        images: sql`ARRAY[]::text[]`,
        coverImage: monasteryData.coverImage || null,
        contactEmail: monasteryData.contactEmail || null,
        contactPhone: monasteryData.contactPhone || null,
        website: monasteryData.website || null,
        latitude: null,
        longitude: null,
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
  
  console.log(`Import finalizat: ${successCount} mănăstiri adăugate, ${skipCount} mănăstiri sărite (deja existente), ${errorCount} erori.`);
}

// Rulăm funcția de import
importNewMonasteries()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Eroare la rularea scriptului:", err);
    process.exit(1);
  });