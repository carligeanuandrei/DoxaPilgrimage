import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";

// Tipurile de date pentru mănăstiri
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
  patronSaintDate?: string; // Format: YYYY-MM-DD
  foundedYear?: number;
  history?: string;
  specialFeatures?: string;
  relics?: string[];
  type: "monastery" | "hermitage" | "church";
  images?: string[];
  coverImage?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
};

// Date despre mai multe mănăstiri din România
const extendedMonasteriesData: MonasteryData[] = [
  // Moldova - Mai multe mănăstiri
  {
    name: "Mănăstirea Secu",
    description: "Mănăstirea Secu este un important lăcaș ortodox din județul Neamț, ctitorit în secolul al XVII-lea de marele vornic Nestor Ureche, tatăl cronicarului Grigore Ureche.",
    shortDescription: "Ctitorie a lui Nestor Ureche din secolul XVII",
    address: "Comuna Vânători-Neamț",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Sf. Nicolae",
    patronSaintDate: "2023-12-06",
    foundedYear: 1602,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/121/12135_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/121/12135_600x450.jpg",
    latitude: 47.211389,
    longitude: 26.226944
  },
  {
    name: "Mănăstirea Sihăstria",
    description: "Mănăstirea Sihăstria, cunoscută pentru duhovnicia sa, este strâns legată de nume mari ale spiritualității ortodoxe precum Părintele Cleopa Ilie și Părintele Paisie Olaru.",
    shortDescription: "Vatră de spiritualitate ortodoxă și viață duhovnicească",
    address: "Comuna Vânători-Neamț",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Nașterea Maicii Domnului",
    patronSaintDate: "2023-09-08",
    foundedYear: 1655,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12296_600x450.jpg",
    latitude: 47.123889,
    longitude: 26.198333
  },
  {
    name: "Mănăstirea Agapia",
    description: "Mănăstirea Agapia, una dintre cele mai mari mănăstiri de maici din România, este cunoscută pentru pictura lui Nicolae Grigorescu și pentru frumusețea sa arhitecturală.",
    shortDescription: "Celebră pentru pictura murală a lui Nicolae Grigorescu",
    address: "Comuna Agapia",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Sfinții Arhangheli Mihail și Gavriil",
    patronSaintDate: "2023-11-08",
    foundedYear: 1643,
    type: "monastery",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Manastirea_Agapia_vedere_de_jos.jpg/800px-Manastirea_Agapia_vedere_de_jos.jpg"],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Manastirea_Agapia_vedere_de_jos.jpg/800px-Manastirea_Agapia_vedere_de_jos.jpg",
    latitude: 47.155556,
    longitude: 26.175833
  },
  
  // Bucovina - Mai multe mănăstiri
  {
    name: "Mănăstirea Humor",
    description: "Mănăstirea Humor este una dintre cele mai valoroase ctitorii din Bucovina, parte din patrimoniul UNESCO, cunoscută pentru frescele sale exterioare și pentru predominanța nuanței de roșu.",
    shortDescription: "Frescele predominant roșii și valoroasa pictură exterioară",
    address: "Comuna Mănăstirea Humorului",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2023-08-15",
    foundedYear: 1530,
    type: "monastery",
    images: ["https://upload.wikimedia.org/wikipedia/commons/4/4c/RO_SV_Manastirea_Humor_2.jpg"],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/4/4c/RO_SV_Manastirea_Humor_2.jpg",
    latitude: 47.653333,
    longitude: 25.883333
  },
  {
    name: "Mănăstirea Moldovița",
    description: "Mănăstirea Moldovița, monument UNESCO, este renumită pentru culoarea sa galbenă și pentru frescele exterioare care reprezintă asediul Constantinopolului.",
    shortDescription: "Cunoscută pentru frescele galbene și reprezentarea Asediului Constantinopolului",
    address: "Comuna Vatra Moldoviței",
    region: "bucovina",
    city: "Vatra Moldoviței",
    county: "Suceava",
    patronSaint: "Buna Vestire",
    patronSaintDate: "2023-03-25",
    foundedYear: 1532,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/121/12132_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/121/12132_600x450.jpg",
    latitude: 47.686111,
    longitude: 25.540278
  },
  {
    name: "Mănăstirea Sucevița",
    description: "Mănăstirea Sucevița, ultima dintre mănăstirile pictate din Bucovina, impresionează prin scara lui Iacov și culoarea verde predominantă a frescelor sale.",
    shortDescription: "Ultima dintre mănăstirile pictate, cu predominanța culorii verzi",
    address: "Comuna Sucevița",
    region: "bucovina",
    city: "Sucevița",
    county: "Suceava",
    patronSaint: "Învierea Domnului",
    patronSaintDate: "2023-04-16",
    foundedYear: 1582,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/113/11392_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/113/11392_600x450.jpg",
    latitude: 47.778889,
    longitude: 25.708889
  },
  
  // Muntenia - Mai multe mănăstiri
  {
    name: "Mănăstirea Snagov",
    description: "Mănăstirea Snagov, situată pe o insulă din mijlocul lacului Snagov, este cunoscută drept locul de înmormântare al lui Vlad Țepeș, deși acest lucru rămâne controversat.",
    shortDescription: "Mănăstire insulară legată de legenda lui Vlad Țepeș",
    address: "Comuna Snagov",
    region: "muntenia",
    city: "Snagov",
    county: "Ilfov",
    patronSaint: "Intrarea în Biserică a Maicii Domnului",
    patronSaintDate: "2023-11-21",
    foundedYear: 1408,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/122/12246_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12246_600x450.jpg",
    latitude: 44.701667,
    longitude: 26.170833
  },
  {
    name: "Mănăstirea Cernica",
    description: "Mănăstirea Cernica, situată pe două insule din lacul cu același nume, este una dintre cele mai importante mănăstiri din preajma Bucureștiului, având un rol important în cultura românească.",
    shortDescription: "Important centru monastic și cultural lângă București",
    address: "Comuna Cernica",
    region: "muntenia",
    city: "Pantelimon",
    county: "Ilfov",
    patronSaint: "Sf. Nicolae",
    patronSaintDate: "2023-12-06",
    foundedYear: 1608,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/121/12121_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/121/12121_600x450.jpg",
    latitude: 44.423611,
    longitude: 26.293056
  },
  
  // Transilvania - Mai multe mănăstiri
  {
    name: "Mănăstirea Cozia",
    description: "Mănăstirea Cozia, cel mai vechi și bine conservat monument de arhitectură din Oltenia, este ctitoria lui Mircea cel Bătrân și adăpostește mormântul acestuia.",
    shortDescription: "Cea mai veche și bine conservată mănăstire din Oltenia",
    address: "Orașul Călimănești",
    region: "oltenia",
    city: "Călimănești",
    county: "Vâlcea",
    patronSaint: "Sf. Treime",
    patronSaintDate: "2023-06-04",
    foundedYear: 1386,
    type: "monastery",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/RO_VL_Manastirea_Cozia.jpg/800px-RO_VL_Manastirea_Cozia.jpg"],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/RO_VL_Manastirea_Cozia.jpg/800px-RO_VL_Manastirea_Cozia.jpg",
    latitude: 45.312778,
    longitude: 24.311944
  },
  {
    name: "Mănăstirea Horezu",
    description: "Mănăstirea Horezu, capodoperă a stilului brâncovenesc și monument UNESCO, este considerată cea mai reprezentativă ctitorie a lui Constantin Brâncoveanu.",
    shortDescription: "Capodoperă a stilului brâncovenesc și monument UNESCO",
    address: "Orașul Horezu",
    region: "oltenia",
    city: "Horezu",
    county: "Vâlcea",
    patronSaint: "Sfinții Împărați Constantin și Elena",
    patronSaintDate: "2023-05-21",
    foundedYear: 1690,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/113/11311_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/113/11311_600x450.jpg",
    latitude: 45.168056,
    longitude: 23.996111
  },
  
  // Dobrogea - Mănăstiri
  {
    name: "Mănăstirea Dervent",
    description: "Mănăstirea Dervent este un important centru de pelerinaj din sud-estul României, cunoscut pentru crucea de piatră cu proprietăți vindecătoare și izvorul cu apă tămăduitoare.",
    shortDescription: "Important centru de pelerinaj din Dobrogea",
    address: "Comuna Ostrov",
    region: "dobrogea",
    city: "Ostrov",
    county: "Constanța",
    patronSaint: "Sf. Apostol Andrei",
    patronSaintDate: "2023-11-30",
    foundedYear: 1936,
    type: "monastery",
    images: ["https://www.crestinortodox.ro/files/article/114/11417_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/114/11417_600x450.jpg",
    latitude: 44.018333,
    longitude: 27.426667
  },
  {
    name: "Mănăstirea Celic-Dere",
    description: "Mănăstirea Celic-Dere, cea mai veche mănăstire din Dobrogea, este situată într-un cadru natural spectaculos și păstrează fragmente de pictură din secolul al XIV-lea.",
    shortDescription: "Cea mai veche mănăstire din Dobrogea",
    address: "Comuna Frecăței",
    region: "dobrogea",
    city: "Tulcea",
    county: "Tulcea",
    patronSaint: "Adormirea Maicii Domnului",
    patronSaintDate: "2023-08-15",
    foundedYear: 1841,
    type: "monastery",
    images: ["https://ziarullumina.ro/thumb/detail-articol/630x400-21/1590672303.jpg"],
    coverImage: "https://ziarullumina.ro/thumb/detail-articol/630x400-21/1590672303.jpg",
    latitude: 45.171667,
    longitude: 28.406667
  },
  
  // Câteva schituri
  {
    name: "Schitul Sihla",
    description: "Schitul Sihla, cunoscut și ca Muntele Sihla, este un loc de sihăstrie unde a viețuit Sf. Teodora de la Sihla în secolul al XVII-lea, cu o peșteră sfântă accesibilă prin pădure.",
    shortDescription: "Loc de sihăstrie unde a viețuit Sf. Teodora de la Sihla",
    address: "Comuna Vânători-Neamț",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    patronSaint: "Sf. Teodora de la Sihla",
    patronSaintDate: "2023-08-07",
    foundedYear: 1741,
    type: "hermitage",
    images: ["https://www.crestinortodox.ro/files/article/113/11370_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/113/11370_600x450.jpg",
    latitude: 47.023333,
    longitude: 26.193333
  },
  {
    name: "Schitul Prodromu",
    description: "Schitul Prodromu este cel mai mare schit românesc din Muntele Athos, Grecia, întemeiat de călugări români în secolul al XIX-lea, având statut de autonomie.",
    shortDescription: "Cel mai mare schit românesc din Muntele Athos",
    address: "Muntele Athos",
    region: "dobrogea", // Deși e în Grecia, îl includem aici convențional
    city: "Karyes",
    county: "Halkidiki",
    patronSaint: "Sf. Ioan Botezătorul",
    patronSaintDate: "2023-01-07",
    foundedYear: 1856,
    type: "hermitage",
    images: ["https://www.crestinortodox.ro/files/article/122/12269_600x450.jpg"],
    coverImage: "https://www.crestinortodox.ro/files/article/122/12269_600x450.jpg",
    latitude: 40.185,
    longitude: 24.317222
  },
  
  // Biserici celebre
  {
    name: "Biserica Neagră",
    description: "Biserica Neagră din Brașov este cea mai mare biserică în stil gotic din sud-estul Europei și cel mai reprezentativ monument al orașului Brașov.",
    shortDescription: "Cea mai mare biserică gotică din sud-estul Europei",
    address: "Piața Sfatului",
    region: "transilvania",
    city: "Brașov",
    county: "Brașov",
    patronSaint: "Sfânta Maria",
    patronSaintDate: "2023-08-15",
    foundedYear: 1383,
    type: "church",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Brasov_black_church.jpg/800px-Brasov_black_church.jpg"],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Brasov_black_church.jpg/800px-Brasov_black_church.jpg",
    latitude: 45.641667,
    longitude: 25.588056
  },
  {
    name: "Biserica de lemn din Ieud",
    description: "Biserica de lemn din Ieud-Deal, monument UNESCO, este una dintre cele mai vechi biserici de lemn din România și din Europa, păstrând un exemplar al 'Codexului de la Ieud'.",
    shortDescription: "Una dintre cele mai vechi biserici de lemn din Europa",
    address: "Comuna Ieud",
    region: "maramures",
    city: "Ieud",
    county: "Maramureș",
    patronSaint: "Nașterea Maicii Domnului",
    patronSaintDate: "2023-09-08",
    foundedYear: 1364,
    type: "church",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/RO_MM_Ieud_wooden_church_23.jpg/800px-RO_MM_Ieud_wooden_church_23.jpg"],
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/RO_MM_Ieud_wooden_church_23.jpg/800px-RO_MM_Ieud_wooden_church_23.jpg",
    latitude: 47.625833,
    longitude: 24.261944
  }
];

// Generează un slug unic pentru fiecare mănăstire
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Funcția principală de import
async function importMoreMonasteries() {
  console.log("Începem importul suplimentar al mănăstirilor...");
  let importedCount = 0;
  
  for (const monasteryData of extendedMonasteriesData) {
    try {
      // Generăm un slug unic pentru fiecare mănăstire
      const slug = generateUniqueSlug(monasteryData.name);
      
      // Verificăm dacă mănăstirea există deja (după nume)
      const existingMonastery = await db.query.monasteries.findFirst({
        where: (monasteries, { eq }) => eq(monasteries.name, monasteryData.name)
      });
      
      if (existingMonastery) {
        console.log(`Mănăstirea "${monasteryData.name}" există deja. Trecem mai departe.`);
        continue;
      }
      
      // Folosim query parametrizat pentru a gestiona corect array-urile
      const query = `
        INSERT INTO monasteries (
          name, slug, description, short_description, address, region, city, county, 
          access, patron_saint, patron_saint_date, founded_year, history, 
          special_features, relics, type, images, cover_image, contact_email, 
          contact_phone, website, latitude, longitude, verification, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
        )
      `;
      
      const values = [
        monasteryData.name,
        slug,
        monasteryData.description,
        monasteryData.shortDescription || null,
        monasteryData.address,
        monasteryData.region,
        monasteryData.city,
        monasteryData.county,
        monasteryData.access || null,
        monasteryData.patronSaint || null,
        monasteryData.patronSaintDate ? new Date(monasteryData.patronSaintDate) : null,
        monasteryData.foundedYear || null,
        monasteryData.history || null,
        monasteryData.specialFeatures || null,
        JSON.stringify(monasteryData.relics || []),  // Convertim array-ul la JSON
        monasteryData.type,
        JSON.stringify(monasteryData.images || []),  // Convertim array-ul la JSON
        monasteryData.coverImage || null,
        monasteryData.contactEmail || null,
        monasteryData.contactPhone || null,
        monasteryData.website || null,
        monasteryData.latitude || null,
        monasteryData.longitude || null,
        true,
        new Date(),
        new Date()
      ];
      
      // Execută query-ul
      await db.execute(query, values);
      
      importedCount++;
      console.log(`Mănăstirea "${monasteryData.name}" a fost importată cu succes.`);
    } catch (error) {
      console.error(`Eroare la importul mănăstirii "${monasteryData.name}":`, error);
    }
  }
  
  console.log(`Importul suplimentar s-a încheiat. S-au importat ${importedCount} mănăstiri noi.`);
}

// Rulăm importul
importMoreMonasteries()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Eroare la rularea scriptului:", err);
    process.exit(1);
  });