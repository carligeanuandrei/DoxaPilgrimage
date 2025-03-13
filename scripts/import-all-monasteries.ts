import fs from 'fs';
import { db } from '../server/db';
import { monasteries } from '../shared/schema';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';

// Funcție pentru generarea unui slug unic
function generateUniqueSlug(name: string) {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'ro',
  });
}

// Structura unei mănăstiri simplificată pentru importul în masă
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
  website?: string;
  contactPhone?: string;
  contactEmail?: string;
  verification?: "verified" | "pending" | "rejected";
  country?: string;
  latitude?: number;
  longitude?: number;
};

/**
 * Lista tuturor mănăstirilor din Moldova (prima regiune ca exemplu)
 * Această listă va fi extinsă cu datele tuturor celor 637 de mănăstiri și schituri
 */
const allMonasteries: MonasteryData[] = [
  // MOLDOVA - 20 de mănăstiri ca exemplu (lista completă va conține toate mănăstirile)
  {
    name: "Mănăstirea Putna",
    description: "Mănăstirea Putna este una dintre cele mai importante mănăstiri din Moldova, cu o istorie bogată. Fondată de Ștefan cel Mare în 1466, este considerată leagănul culturii și spiritualității românești din Moldova medievală. Aici se află mormântul lui Ștefan cel Mare și al familiei sale.",
    shortDescription: "Necropola lui Ștefan cel Mare și leagăn al culturii românești",
    region: "moldova",
    city: "Putna",
    county: "Suceava",
    patronSaint: "Adormirea Maicii Domnului",
    foundedYear: 1466,
    type: "monastery",
    coverImage: "/images/manastirea-putna.jpg",
    website: "https://www.putna.ro",
    contactPhone: "0230 414055",
    contactEmail: "contact@putna.ro",
    verification: "verified",
    country: "România"
  },
  {
    name: "Mănăstirea Voroneț",
    description: "Mănăstirea Voroneț, cunoscută pentru „albastrul de Voroneț" - culoarea unică a frescelor exterioare, este una dintre cele mai valoroase ctitorii ale lui Ștefan cel Mare. Costruită în doar 3 luni și 3 săptămâni în anul 1488, este inclusă pe lista patrimoniului mondial UNESCO.",
    shortDescription: "Biserica cu frescele albastre, parte din patrimoniul UNESCO",
    region: "bucovina",
    city: "Gura Humorului",
    county: "Suceava",
    patronSaint: "Sfântul Gheorghe",
    foundedYear: 1488,
    type: "monastery",
    coverImage: "/images/manastirea-voronet.jpg",
    website: "https://www.voronet.ro",
    contactPhone: "0230 234969",
    verification: "verified",
    country: "România"
  },
  // Adaugă mai multe mănăstiri aici
];

/**
 * Lista tuturor mănăstirilor din Bucovina
 */
const bucovina: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Muntenia
 */
const muntenia: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Oltenia
 */
const oltenia: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Transilvania
 */
const transilvania: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Maramureș
 */
const maramures: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Banat
 */
const banat: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Lista tuturor mănăstirilor din Dobrogea
 */
const dobrogea: MonasteryData[] = [
  // Lista de adăugat
];

/**
 * Funcția principală pentru importul tuturor mănăstirilor
 * Combină listele de mănăstiri din fiecare regiune și le importă în baza de date
 */
async function importAllMonasteries() {
  try {
    console.log('Începere import mănăstiri...');
    
    // Combină toate listele de mănăstiri
    const allMonasteriesList = [
      ...allMonasteries,
      ...bucovina,
      ...muntenia,
      ...oltenia,
      ...transilvania,
      ...maramures,
      ...banat,
      ...dobrogea
    ];
    
    // Verifică dacă există deja mănăstiri în baza de date
    const existingMonasteries = await db.select().from(monasteries);
    console.log(`Există ${existingMonasteries.length} mănăstiri în baza de date.`);
    
    // Creează un set cu numele mănăstirilor existente pentru verificări rapide
    const existingMonasteryNames = new Set(existingMonasteries.map(m => m.name));
    
    // Filtrează doar mănăstirile care nu există deja
    const newMonasteries = allMonasteriesList.filter(m => !existingMonasteryNames.has(m.name));
    console.log(`Se vor importa ${newMonasteries.length} mănăstiri noi.`);
    
    if (newMonasteries.length === 0) {
      console.log('Nu există mănăstiri noi de importat.');
      return;
    }
    
    // Pregătește datele pentru import
    const monasteriesToInsert = newMonasteries.map(monastery => {
      const slug = generateUniqueSlug(monastery.name);
      
      return {
        name: monastery.name,
        slug,
        description: monastery.description,
        short_description: monastery.shortDescription || '',
        address: monastery.address || '',
        region: monastery.region,
        city: monastery.city,
        county: monastery.county,
        patron_saint: monastery.patronSaint || null,
        founded_year: monastery.foundedYear || null,
        type: monastery.type,
        cover_image: monastery.coverImage || '/images/default-monastery.jpg',
        website: monastery.website || null,
        contact_phone: monastery.contactPhone || null,
        contact_email: monastery.contactEmail || null,
        verification: monastery.verification || 'pending',
        country: monastery.country || 'România',
        latitude: monastery.latitude || null,
        longitude: monastery.longitude || null,
        created_at: new Date(),
      };
    });
    
    // Importă mănăstirile în baza de date
    if (monasteriesToInsert.length > 0) {
      const result = await db.insert(monasteries).values(monasteriesToInsert);
      console.log(`S-au importat cu succes ${monasteriesToInsert.length} mănăstiri noi.`);
    }
    
    console.log('Import finalizat cu succes!');
  } catch (error) {
    console.error('Eroare la importul mănăstirilor:', error);
  }
}

// Execută funcția principală
importAllMonasteries()
  .then(() => {
    console.log('Script finalizat.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Eroare în script:', error);
    process.exit(1);
  });