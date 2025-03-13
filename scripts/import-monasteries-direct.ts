import { db } from "../server/db";
import { monasteries } from "../shared/schema";
import { createId } from "@paralleldrive/cuid2";
import slugify from "slugify";
import { sql } from "drizzle-orm";

// Funcția pentru a genera un slug unic
function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  return `${baseSlug}-${createId().substring(0, 8)}`;
}

// Mănăstiri de importat - lista simplificată
const monasteriesData = [
  {
    name: "Mănăstirea Cozia",
    description: "Mănăstirea Cozia, cel mai vechi și bine conservat monument de arhitectură din Oltenia, este ctitoria lui Mircea cel Bătrân și adăpostește mormântul acestuia.",
    region: "oltenia",
    city: "Călimănești",
    county: "Vâlcea",
    type: "monastery"
  },
  {
    name: "Mănăstirea Humor",
    description: "Mănăstirea Humor este una dintre cele mai valoroase ctitorii din Bucovina, parte din patrimoniul UNESCO, cunoscută pentru frescele sale exterioare și pentru predominanța nuanței de roșu.",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    type: "monastery"
  },
  {
    name: "Mănăstirea Agapia",
    description: "Mănăstirea Agapia, una dintre cele mai mari mănăstiri de maici din România, este cunoscută pentru pictura lui Nicolae Grigorescu și pentru frumusețea sa arhitecturală.",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    type: "monastery"
  },
  {
    name: "Mănăstirea Sâmbăta de Sus",
    description: "Mănăstirea Sâmbăta, cunoscută și ca Brâncoveanu, este un important centru spiritual ortodox din Transilvania, ctitorie a domnitorului Constantin Brâncoveanu.",
    region: "transilvania",
    city: "Sâmbăta de Sus",
    county: "Brașov",
    type: "monastery"
  },
  {
    name: "Mănăstirea Cernica",
    description: "Mănăstirea Cernica, situată pe două insule din lacul cu același nume, este una dintre cele mai importante mănăstiri din preajma Bucureștiului, având un rol important în cultura românească.",
    region: "muntenia",
    city: "Pantelimon",
    county: "Ilfov",
    type: "monastery"
  },
  {
    name: "Mănăstirea Celic-Dere",
    description: "Mănăstirea Celic-Dere, cea mai veche mănăstire din Dobrogea, este situată într-un cadru natural spectaculos și păstrează fragmente de pictură din secolul al XIV-lea.",
    region: "dobrogea",
    city: "Tulcea",
    county: "Tulcea",
    type: "monastery"
  },
  {
    name: "Mănăstirea Prislop",
    description: "Mănăstirea Prislop, situată într-un cadru natural deosebit, este un important centru de pelerinaj, mai ales datorită legăturii cu părintele Arsenie Boca.",
    region: "banat",
    city: "Hațeg",
    county: "Hunedoara",
    type: "monastery"
  },
  {
    name: "Mănăstirea Bârsana",
    description: "Mănăstirea Bârsana este una dintre cele mai frumoase mănăstiri din lemn din Maramureș, reprezentând un exemplu remarcabil al arhitecturii tradiționale maramureșene.",
    region: "maramures",
    city: "Bârsana",
    county: "Maramureș",
    type: "monastery"
  },
  {
    name: "Schitul Sihla",
    description: "Schitul Sihla, cunoscut și ca Muntele Sihla, este un loc de sihăstrie unde a viețuit Sf. Teodora de la Sihla în secolul al XVII-lea, cu o peșteră sfântă accesibilă prin pădure.",
    region: "moldova",
    city: "Târgu Neamț",
    county: "Neamț",
    type: "hermitage"
  },
  {
    name: "Biserica Neagră",
    description: "Biserica Neagră din Brașov este cea mai mare biserică în stil gotic din sud-estul Europei și cel mai reprezentativ monument al orașului Brașov.",
    region: "transilvania",
    city: "Brașov",
    county: "Brașov",
    type: "church"
  }
];

// Funcția principală de import
async function importMonasteries() {
  console.log("Începem importul mănăstirilor...");
  let importedCount = 0;
  let errorsCount = 0;
  
  for (const monasteryData of monasteriesData) {
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
      
      // Inserăm mănăstirea în baza de date
      await db.insert(monasteries).values({
        name: monasteryData.name,
        slug: slug,
        description: monasteryData.description,
        shortDescription: null,
        address: `Strada Principală`,
        region: monasteryData.region,
        city: monasteryData.city,
        county: monasteryData.county,
        access: null,
        patronSaint: null,
        patronSaintDate: null,
        foundedYear: null,
        history: null,
        specialFeatures: null,
        relics: sql`ARRAY[]::text[]`,
        type: monasteryData.type,
        images: sql`ARRAY[]::text[]`,
        coverImage: null,
        contactEmail: null,
        contactPhone: null,
        website: null,
        latitude: null,
        longitude: null,
        verification: true,
        administratorId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      importedCount++;
      console.log(`Mănăstirea "${monasteryData.name}" a fost importată cu succes.`);
    } catch (error) {
      errorsCount++;
      console.error(`Eroare la importul mănăstirii "${monasteryData.name}":`, error);
    }
  }
  
  console.log(`Importul s-a încheiat: ${importedCount} mănăstiri noi, ${errorsCount} erori.`);
}

// Rulăm importul
importMonasteries()
  .then(() => {
    console.log("Script finalizat cu succes!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Eroare la rularea scriptului:", err);
    process.exit(1);
  });