import { db } from "../server/db";
import { monasteries, regionEnum } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";

// Tipurile de date pentru mănăstiri
type IconDescription = {
  name: string;
  description: string;
  image: string;
};

type MonasteryData = {
  name: string;
  description: string;
  shortDescription?: string;
  address: string;
  region: "moldova" | "bucovina" | "muntenia" | "oltenia" | "transilvania" | "maramures" | "banat" | "dobrogea";
  city: string;
  county: string;
  access?: string;
  patronSaint?: string;
  patronSaintDate?: Date;
  foundedYear?: number;
  history?: string;
  specialFeatures?: string;
  relics?: string[];
  type: "monastery" | "hermitage" | "church";
  iconDescriptions?: IconDescription[];
  images?: string[];
  coverImage?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
};

// Date despre mănăstirile și schiturile din România
const monasteriesData = [
  // Moldova
  {
    name: "Mănăstirea Putna",
    description: "Mănăstirea Putna este o mănăstire ortodoxă de călugări din România, construită între anii 1466-1469 de voievodul Ștefan cel Mare. Este considerată unul dintre cele mai importante centre religioase, culturale și artistice românești.",
    shortDescription: "Necropola dinastiei Mușatinilor, ctitorie a lui Ștefan cel Mare",
    address: "Str. Principală nr. 1, Putna",
    region: "moldova",
    city: "Putna",
    county: "Suceava",
    access: "Mănăstirea Putna este situată la 33 km de municipiul Rădăuți, accesul fiind posibil pe DN2H și DJ178.",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: new Date("2023-08-15"),
    foundedYear: 1466,
    history: "Mănăstirea Putna a fost construită la îndemnul lui Ștefan cel Mare, după victoria de la Chilia, ca o recunoștință adusă lui Dumnezeu. Mănăstirea adăpostește mormântul lui Ștefan cel Mare.",
    specialFeatures: "Deține un muzeu de artă medievală cu obiecte de valoare inestimabilă, inclusiv broderii din fir de aur, icoane, manuscrise, obiecte liturgice și o copie a Tetraevanghelului din 1429 al lui Alexandru cel Bun.",
    relics: ["Părticele din moaștele Sf. Ghenadie", "Părticele din moaștele Sf. Simeon Stâlpnicul"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului Hodighitria",
        description: "Icoană făcătoare de minuni din sec. XV, adusă de Ștefan cel Mare de la Constantinopol",
        image: "https://www.crestinortodox.ro/files/article/120/12983_600x450.jpg"
      }
    ],
    images: [
      "https://arhistoria.ro/wp-content/uploads/2017/12/manastirea_putna_vedere-768x512.jpg",
      "https://www.crestinortodox.ro/files/article/121/12151_600x450.jpg",
      "https://www.ovlg.com/sites/files/inline-images/monastery-2.jpg"
    ],
    coverImage: "https://arhistoria.ro/wp-content/uploads/2017/12/manastirea_putna_vedere-768x512.jpg",
    contactEmail: "manastirea@putna.ro",
    contactPhone: "+40230414055",
    website: "https://www.putna.ro"
  },
  {
    name: "Mănăstirea Neamț",
    description: "Mănăstirea Neamț, cunoscută și ca Ierusalimul Ortodoxiei Românești, este una dintre cele mai vechi și mai importante mănăstiri din România, cu o tradiție monahală de peste 600 de ani.",
    shortDescription: "Cel mai vechi și important centru monahal și cultural din Moldova",
    address: "Comuna Vânători-Neamț",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    access: "Mănăstirea se află la 10 km de orașul Târgu Neamț, accesul fiind posibil pe DN15B.",
    patronSaint: "Înălțarea Domnului",
    patronSaintDate: new Date("2023-06-01"),
    foundedYear: 1407, 
    history: "Mănăstirea Neamţ a fost întemeiată în timpul domniei lui Alexandru cel Bun și a fost un important centru al culturii medievale românești. Aici a funcționat o renumită școală de caligrafi și miniaturiști.",
    specialFeatures: "Adăpostește cea mai veche bibliotecă mănăstirească din România și un muzeu important cu obiecte de artă religioasă.",
    relics: ["Moaștele Sf. Paisie de la Neamț", "Icoana făcătoare de minuni a Maicii Domnului"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului",
        description: "Icoană făcătoare de minuni, considerată ocrotitoarea mănăstirii",
        image: "https://www.crestinortodox.ro/files/article/111/11133_600x450.jpg"
      }
    ],
    images: [
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/neamt/main.jpg",
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/neamt/0.jpg",
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/neamt/1.jpg"
    ],
    coverImage: "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/neamt/main.jpg",
    contactEmail: "manastireaneamt@gmail.com",
    contactPhone: "+40233251580",
    website: "https://manastireaneamt.ro"
  },
  
  // Bucovina
  {
    name: "Mănăstirea Voroneț",
    description: "Mănăstirea Voroneț, cunoscută pentru culoarea unică albastră (albastrul de Voroneț), este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare, fiind inclusă în Patrimoniul Mondial UNESCO.",
    shortDescription: "Capodoperă a artei medievale românești, cunoscută pentru albastrul de Voroneț",
    address: "Str. Voroneț nr. 166, Gura Humorului",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    access: "Mănăstirea se află la aproximativ 4 km de orașul Gura Humorului, accesul fiind posibil pe DJ177.",
    patronSaint: "Sfântul Gheorghe",
    patronSaintDate: new Date("2023-04-23"),
    foundedYear: 1488,
    history: "Mănăstirea a fost ridicată de Ştefan cel Mare în anul 1488, în doar 3 luni şi 3 săptămâni, după o victorie împotriva turcilor. Pictura exterioară, realizată în 1547, este remarcabilă prin scena Judecății de Apoi.",
    specialFeatures: "Renumită pentru frescele exterioare și culoarea albastru de Voroneț, o nuanță specială de albastru folosită în pictura exterioară.",
    relics: ["Moaștele Sf. Daniil Sihastrul"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Sf. Gheorghe",
        description: "Icoană veche din sec. XVI, considerată făcătoare de minuni",
        image: "https://www.crestinortodox.ro/files/article/120/12059_600x450.jpg"
      }
    ],
    images: [
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/voronet/main.jpg",
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/voronet/0.jpg",
      "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/voronet/1.jpg"
    ],
    coverImage: "https://cdn.jsdelivr.net/gh/laurentiucretu68/AzureBlobStorage@latest/MonasteryDetails/images/voronet/main.jpg",
    contactEmail: "manastirea@voronet.ro",
    contactPhone: "+40230234912",
    website: "https://www.voronet.ro"
  },
  
  // Maramureș
  {
    name: "Mănăstirea Bârsana",
    description: "Mănăstirea Bârsana este una dintre cele mai frumoase mănăstiri din lemn din Maramureș, reprezentând un exemplu remarcabil al arhitecturii tradiționale maramureșene.",
    shortDescription: "Bijuterie a arhitecturii în lemn maramureșene",
    address: "Comuna Bârsana",
    region: "maramures",
    city: "Bârsana",
    county: "Maramureș",
    access: "Mănăstirea se află la 20 km de Sighetul Marmației, accesul fiind posibil pe DN18.",
    patronSaint: "Soborul Sfinților 12 Apostoli",
    patronSaintDate: new Date("2023-06-30"),
    foundedYear: 1993,
    history: "Deși construcția actuală datează din 1993, mănăstirea Bârsana are o istorie ce datează din secolul al XIV-lea, când exista o veche mănăstire pe același loc, desființată în 1791.",
    specialFeatures: "Construită integral din lemn de stejar, mănăstirea reprezintă o sinteză a arhitecturii tradiționale maramureșene, cu turnul clopotniță de 57 m înălțime.",
    relics: ["Părticele din moaștele Sf. Apostoli"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului cu Pruncul",
        description: "Icoană veche pictată pe lemn, considerată ocrotitoarea mănăstirii",
        image: "https://www.crestinortodox.ro/files/article/114/11463_600x450.jpg"
      }
    ],
    images: [
      "https://static4.libertatea.ro/wp-content/uploads/2021/06/manastirea-barsana-este-una-dintre-cele-mai-frumoase-manastiri-din-tara.jpg",
      "https://static4.libertatea.ro/wp-content/uploads/2021/06/manastirea-barsana-maramures.jpg",
      "https://static4.libertatea.ro/wp-content/uploads/2021/06/turnul-manastirii-barsana-are-57-de-metri-inaltime.jpg"
    ],
    coverImage: "https://static4.libertatea.ro/wp-content/uploads/2021/06/manastirea-barsana-este-una-dintre-cele-mai-frumoase-manastiri-din-tara.jpg",
    contactEmail: "contact@manastireabarsana.ro",
    contactPhone: "+40262337006",
    website: "https://www.manastireabarsana.ro"
  },
  
  // Transilvania
  {
    name: "Mănăstirea Sâmbăta de Sus",
    description: "Mănăstirea Sâmbăta, cunoscută și ca Brâncoveanu, este un important centru spiritual ortodox din Transilvania, ctitorie a domnitorului Constantin Brâncoveanu.",
    shortDescription: "Vatră de spiritualitate și cultură ortodoxă în Transilvania",
    address: "Comuna Sâmbăta de Sus",
    region: "transilvania",
    city: "Sâmbăta de Sus",
    county: "Brașov",
    access: "Mănăstirea se află la 70 km de Brașov, accesul fiind posibil pe DN1 și apoi pe DJ107B.",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: new Date("2023-08-15"),
    foundedYear: 1696,
    history: "Mănăstirea a fost construită între 1696-1707 de către Constantin Brâncoveanu, distrusă parțial de generalul austriac Bukow în 1785, și reconstruită între 1926-1936 de Mitropolitul Nicolae Bălan.",
    specialFeatures: "Deține o bogată colecție de icoane pe sticlă și lemn, manuscrise și cărți vechi. Este cunoscută și pentru Izvorul Tămăduirii, considerat a avea proprietăți tămăduitoare.",
    relics: ["Părticele din moaștele Sf. Brâncoveni"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului",
        description: "Icoană făcătoare de minuni din sec. XVIII",
        image: "https://www.crestinortodox.ro/files/article/114/11473_600x450.jpg"
      }
    ],
    images: [
      "https://www.crestinortodox.ro/files/article/116/11652_600x450.jpg",
      "https://www.crestinortodox.ro/files/article/116/11648_600x450.jpg",
      "https://www.crestinortodox.ro/files/article/116/11651_600x450.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/116/11652_600x450.jpg",
    contactEmail: "manastirea.sambata@gmail.com",
    contactPhone: "+40268360381",
    website: "https://www.manastireasambata.ro"
  },
  
  // Muntenia
  {
    name: "Mănăstirea Curtea de Argeș",
    description: "Mănăstirea Curtea de Argeș, cunoscută și ca Biserica Episcopală, este unul dintre cele mai reprezentative monumente de arhitectură din Țara Românească și necropolă regală.",
    shortDescription: "Capodoperă arhitecturală a Țării Românești și necropolă regală",
    address: "Str. Basarabilor nr. 1",
    region: "muntenia",
    city: "Curtea de Argeș",
    county: "Argeș",
    access: "Mănăstirea se află în centrul orașului Curtea de Argeș, accesul fiind posibil pe DN7C.",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: new Date("2023-08-15"),
    foundedYear: 1515,
    history: "Ctitorie a domnitorului Neagoe Basarab, construită între 1515-1517, mănăstirea este legată de legendarul meșter Manole. A fost restaurată în secolul al XIX-lea de arhitecții francezi Lecomte du Noüy și André Lecomte.",
    specialFeatures: "Aici se află mormintele regilor și reginelor României: Carol I și Elisabeta, Ferdinand și Maria, Carol al II-lea, precum și ale regilor Mihai I și Ana.",
    relics: ["Moaștele Sf. Filofteia"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Sf. Filofteia",
        description: "Icoană făcătoare de minuni ce adăpostește moaștele sfintei",
        image: "https://www.crestinortodox.ro/files/article/112/11274_600x450.jpg"
      }
    ],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/Curtea_de_Arges_Monastery.jpg",
      "https://romaniatourism.com/images/curtea-de-arges-monastery.jpg",
      "https://www.crestinortodox.ro/files/article/111/11111_600x450.jpg"
    ],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Curtea_de_Arges_Monastery.jpg",
    contactEmail: "manastireacurteadearges@gmail.com",
    contactPhone: "+40248721554",
    website: "https://www.episcopiaargesului.ro"
  },
  
  // Oltenia
  {
    name: "Mănăstirea Tismana",
    description: "Mănăstirea Tismana este cea mai veche mănăstire din Țara Românească, construită de Sfântul Nicodim de la Tismana în secolul al XIV-lea.",
    shortDescription: "Cea mai veche vatră monahală din Țara Românească",
    address: "Comuna Tismana",
    region: "oltenia",
    city: "Tismana",
    county: "Gorj",
    access: "Mănăstirea se află la 30 km de Târgu Jiu, accesul fiind posibil pe DN67D.",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: new Date("2023-08-15"),
    foundedYear: 1375,
    history: "Mănăstirea a fost ctitorită de Sfântul Nicodim, cu sprijinul domnitorilor Radu I și Dan I. În timpul celui de-al Doilea Război Mondial, aici a fost adăpostit tezaurul României.",
    specialFeatures: "Complexul monahal este așezat pe un pinten de stâncă, într-un cadru natural de o frumusețe rară, lângă cascada Tismana.",
    relics: ["Moaștele Sf. Nicodim de la Tismana"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului Hodighitria",
        description: "Icoană veche bizantină adusă de Sf. Nicodim",
        image: "https://www.crestinortodox.ro/files/article/112/11298_600x450.jpg"
      }
    ],
    images: [
      "https://www.directbooking.ro/upload/29111815635.jpg",
      "https://monumenteunice.ro/sites/default/files/TISMANA_2.jpg",
      "https://cdn.zi-de-zi.ro/wp-content/uploads/2019/12/manastirea-tismana.jpg"
    ],
    coverImage: "https://www.directbooking.ro/upload/29111815635.jpg",
    contactEmail: "manastireatismana@gmail.com",
    contactPhone: "+40253374015",
    website: "https://www.manastireatismana.ro"
  },
  
  // Banat
  {
    name: "Mănăstirea Prislop",
    description: "Mănăstirea Prislop, situată într-un cadru natural deosebit, este un important centru de pelerinaj, mai ales datorită legăturii cu părintele Arsenie Boca.",
    shortDescription: "Important centru de pelerinaj asociat cu părintele Arsenie Boca",
    address: "Sat Silvașu de Sus, Comuna Hațeg",
    region: "banat",
    city: "Hațeg",
    county: "Hunedoara",
    access: "Mănăstirea se află la 13 km de orașul Hațeg, accesul fiind posibil pe DN68.",
    patronSaint: "Sf. Ioan Evanghelistul",
    patronSaintDate: new Date("2023-05-08"),
    foundedYear: 1400,
    history: "Mănăstirea datează din secolul al XVI-lea, fiind ctitorită de călugărul Nicodim. A fost reconstruită în 1564 de domnitoarea Zamfira, fiica lui Moise Vodă din Țara Românească. În secolul XX, a fost condusă de părintele Arsenie Boca.",
    specialFeatures: "Mormântul părintelui Arsenie Boca, considerat loc de pelerinaj. Troița pictată de părintele Arsenie Boca.",
    relics: ["Părticele din moaștele Sf. Ioan Evanghelistul"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului",
        description: "Icoană pictată de părintele Arsenie Boca",
        image: "https://www.crestinortodox.ro/files/article/114/11414_600x450.jpg"
      }
    ],
    images: [
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Manastirea_Prislop_01.jpg",
      "https://www.banaterra.eu/romana/files/prislop1_0.jpg",
      "https://www.crestinortodox.ro/files/article/111/11115_600x450.jpg"
    ],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Manastirea_Prislop_01.jpg",
    contactEmail: "manastirea.prislop@gmail.com",
    contactPhone: "+40254775472",
    website: "https://www.manastireaprislophateg.ro"
  },
  
  // Dobrogea
  {
    name: "Mănăstirea Dervent",
    description: "Mănăstirea Dervent este situată în Dobrogea, având o istorie veche ce datează din perioada bizantină. Este cunoscută pentru crucea de piatră cu puteri vindecătoare.",
    shortDescription: "Vatră spirituală dobrogeană cu o cruce făcătoare de minuni",
    address: "Comuna Ostrov",
    region: "dobrogea",
    city: "Ostrov",
    county: "Constanța",
    access: "Mănăstirea se află la 25 km de Ostrov, accesul fiind posibil pe DN3.",
    patronSaint: "Sf. Parascheva",
    patronSaintDate: new Date("2023-10-14"),
    foundedYear: 1936,
    history: "Mănăstirea a fost înființată în 1936, pe locul unei vechi așezări monastice din perioada bizantină. Crucea de piatră datează din sec. IV-VI d.Hr.",
    specialFeatures: "Crucea de piatră, veche de peste 1500 de ani, considerată a avea puteri vindecătoare. Izvorul tămăduitor.",
    relics: ["Părticele din moaștele Sf. Parascheva"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Sf. Parascheva",
        description: "Icoană făcătoare de minuni",
        image: "https://www.crestinortodox.ro/files/article/115/11526_600x450.jpg"
      }
    ],
    images: [
      "https://www.crestinortodox.ro/files/article/115/11513_600x450.jpg",
      "https://www.crestinortodox.ro/files/article/115/11514_600x450.jpg",
      "https://www.crestinortodox.ro/files/article/115/11512_600x450.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/115/11513_600x450.jpg",
    contactEmail: "manastireadervent@gmail.com",
    contactPhone: "+40769290791",
    website: "https://www.manastireadervent.ro"
  },
  
  // Crișana
  {
    name: "Mănăstirea Izbuc",
    description: "Mănăstirea Izbuc este cunoscută pentru izvorul său intermitent, considerat făcător de minuni, și pentru icoana făcătoare de minuni a Maicii Domnului.",
    shortDescription: "Mănăstire cu izvor intermitent tămăduitor",
    address: "Sat Cărpinet, Comuna Cociuba Mare",
    region: "crisana",
    city: "Beiuș",
    county: "Bihor",
    access: "Mănăstirea se află la 20 km de orașul Beiuș, accesul fiind posibil pe DJ764.",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: new Date("2023-08-15"),
    foundedYear: 1930,
    history: "Mănăstirea a fost construită în apropierea unui izvor intermitent, cunoscut încă din sec. al XVII-lea. Actualul ansamblu monahal datează din anii '90.",
    specialFeatures: "Izvorul intermitent, care, conform tradiției, țâșnește la intervale regulate și are proprietăți tămăduitoare.",
    relics: ["Părticele din Sfânta Cruce", "Părticele din moaștele mai multor sfinți"],
    type: "monastery",
    iconDescriptions: [
      {
        name: "Icoana Maicii Domnului",
        description: "Icoană făcătoare de minuni descoperită la izvor",
        image: "https://www.crestinortodox.ro/files/article/115/11539_600x450.jpg"
      }
    ],
    images: [
      "https://www.crestinortodox.ro/files/article/115/11533_600x450.jpg",
      "https://media.stirileprotv.ro/images/68/w650/media_142780462181000400.jpg",
      "https://www.crestinortodox.ro/files/article/115/11538_600x450.jpg"
    ],
    coverImage: "https://www.crestinortodox.ro/files/article/115/11533_600x450.jpg",
    contactEmail: "manastireaizbuc@gmail.com",
    contactPhone: "+40259322694",
    website: "https://www.episcopiaoradiei.ro/manastirea-izbuc/"
  }
];

// Funcție pentru generarea unui slug unic
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Funcția principală de inițializare
async function initMonasteries() {
  console.log("Începem importul mănăstirilor...");
  
  for (const monasteryData of monasteriesData as MonasteryData[]) {
    try {
      // Generăm un slug unic pentru fiecare mănăstire
      const slug = generateUniqueSlug(monasteryData.name);
      
      // Verificăm dacă mănăstirea există deja (după nume)
      const existingMonastery = await db.query.monasteries.findFirst({
        where: (monasteries, { eq }) => eq(monasteries.name, monasteryData.name)
      });
      
      if (existingMonastery) {
        console.log(`Mănăstirea ${monasteryData.name} există deja. Trecem mai departe.`);
        continue;
      }
      
      // Pregătim datele pentru inserare, conform schemei
      const monasteryInsertData = {
        name: monasteryData.name,
        slug,
        description: monasteryData.description,
        address: monasteryData.address,
        region: monasteryData.region,
        city: monasteryData.city,
        county: monasteryData.county,
        type: monasteryData.type,
        verification: "verified" as const, // Toate mănăstirile importate sunt automat verificate
        shortDescription: monasteryData.shortDescription,
        access: monasteryData.access,
        patronSaint: monasteryData.patronSaint,
        patronSaintDate: monasteryData.patronSaintDate,
        foundedYear: monasteryData.foundedYear,
        history: monasteryData.history,
        specialFeatures: monasteryData.specialFeatures,
        relics: monasteryData.relics,
        iconDescriptions: monasteryData.iconDescriptions,
        images: monasteryData.images,
        coverImage: monasteryData.coverImage,
        contactEmail: monasteryData.contactEmail,
        contactPhone: monasteryData.contactPhone,
        website: monasteryData.website
      };
      
      // Inserăm mănăstirea în baza de date
      await db.insert(monasteries).values(monasteryInsertData);
      
      console.log(`Mănăstirea ${monasteryData.name} a fost adăugată cu succes.`);
    } catch (error) {
      console.error(`Eroare la adăugarea mănăstirii ${monasteryData.name}:`, error);
    }
  }
  
  console.log("Importul mănăstirilor a fost finalizat.");
}

// Rulăm funcția de inițializare
initMonasteries()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Eroare la rularea scriptului:", error);
    process.exit(1);
  });