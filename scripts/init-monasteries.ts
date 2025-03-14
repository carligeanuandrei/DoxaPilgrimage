import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';

async function initMonasteries() {
  console.log("Începem importul mănăstirilor...");

  // List of monasteries with additional info
  const monasteriesData = [
    // Original monasteries
    {
      name: "Mănăstirea Putna",
      description: "Mănăstirea Putna este o mănăstire ortodoxă de călugări din România, construită între anii 1466–1469 și ctitorită de domnitorul Ștefan cel Mare.",
      location: "Putna, Suceava",
      county: "Suceava",
      region: "Moldova",
      foundedYear: 1466,
      feast_day: "15 august",
      image_url: "/images/monasteries/putna.jpg",
      latitude: 47.8697,
      longitude: 25.6022
    },
    {
      name: "Mănăstirea Neamț",
      description: "Mănăstirea Neamț este una dintre cele mai vechi și importante mănăstiri ortodoxe din România, situată în comuna Vânători-Neamț.",
      location: "Vânători-Neamț, Neamț",
      county: "Neamț",
      region: "Moldova",
      foundedYear: 1407,
      feast_day: "6 august",
      image_url: "/images/monasteries/neamt.jpg",
      latitude: 47.2675,
      longitude: 26.2144
    },
    {
      name: "Mănăstirea Voroneț",
      description: "Mănăstirea Voroneț, cunoscută pentru albastrul său unic, a fost construită în 1488 de Ștefan cel Mare și este parte din patrimoniul UNESCO.",
      location: "Voroneț, Suceava",
      county: "Suceava",
      region: "Moldova",
      foundedYear: 1488,
      feast_day: "8 septembrie",
      image_url: "/images/monasteries/voronet.jpg",
      latitude: 47.5175,
      longitude: 25.8636
    },
    {
      name: "Mănăstirea Bârsana",
      description: "Mănăstirea Bârsana este o mănăstire ortodoxă din Maramureș, recunoscută pentru arhitectura sa tradițională în lemn.",
      location: "Bârsana, Maramureș",
      county: "Maramureș",
      region: "Transilvania",
      foundedYear: 1720,
      feast_day: "15 august",
      image_url: "/images/monasteries/barsana.jpg",
      latitude: 47.7986,
      longitude: 24.1289
    },
    {
      name: "Mănăstirea Sâmbăta de Sus",
      description: "Mănăstirea Sâmbăta de Sus, cunoscută și ca 'Catedrala din Munți', a fost construită de Constantin Brâncoveanu în 1696.",
      location: "Sâmbăta de Sus, Brașov",
      county: "Brașov",
      region: "Transilvania",
      foundedYear: 1696,
      feast_day: "15 august",
      image_url: "/images/monasteries/sambata.jpg",
      latitude: 45.6742,
      longitude: 24.8033
    },
    {
      name: "Mănăstirea Curtea de Argeș",
      description: "Mănăstirea Curtea de Argeș este o mănăstire ortodoxă din România, fiind cunoscută pentru legenda Meșterului Manole.",
      location: "Curtea de Argeș, Argeș",
      county: "Argeș",
      region: "Muntenia",
      foundedYear: 1517,
      feast_day: "15 august",
      image_url: "/images/monasteries/curtea-de-arges.jpg",
      latitude: 45.1489,
      longitude: 24.6758
    },
    {
      name: "Mănăstirea Tismana",
      description: "Mănăstirea Tismana este cea mai veche mănăstire din Țara Românească, fondată de Sfântul Nicodim de la Tismana în secolul al XIV-lea.",
      location: "Tismana, Gorj",
      county: "Gorj",
      region: "Oltenia",
      foundedYear: 1378,
      feast_day: "26 decembrie",
      image_url: "/images/monasteries/tismana.jpg",
      latitude: 45.0847,
      longitude: 22.9783
    },
    {
      name: "Mănăstirea Prislop",
      description: "Mănăstirea Prislop este o mănăstire ortodoxă din județul Hunedoara, locul unde a slujit părintele Arsenie Boca.",
      location: "Silvașu de Sus, Hunedoara",
      county: "Hunedoara",
      region: "Transilvania",
      foundedYear: 1400,
      feast_day: "14 septembrie",
      image_url: "/images/monasteries/prislop.jpg",
      latitude: 45.5817,
      longitude: 23.0494
    },
    {
      name: "Mănăstirea Dervent",
      description: "Mănăstirea Dervent este o mănăstire ortodoxă din județul Constanța, cunoscută pentru izvorul său tămăduitor.",
      location: "Dervent, Constanța",
      county: "Constanța",
      region: "Dobrogea",
      foundedYear: 1923,
      feast_day: "24 iunie",
      image_url: "/images/monasteries/dervent.jpg",
      latitude: 44.1089,
      longitude: 27.4053
    },
    {
      name: "Mănăstirea Izbuc",
      description: "Mănăstirea Izbuc este o mănăstire ortodoxă din Bihor, cunoscută pentru izvorul său care țâșnește periodic.",
      location: "Izbuc, Bihor",
      county: "Bihor",
      region: "Crișana",
      foundedYear: 1930,
      feast_day: "15 august",
      image_url: "/images/monasteries/izbuc.jpg",
      latitude: 46.5394,
      longitude: 22.4731
    }
  ];

  // Mai adăugăm și alte mănăstiri
  const additionalMonasteries = [
    // Adăugăm mai multe mănăstiri din toată România
    {
      name: "Mănăstirea Hurezi",
      description: "Mănăstirea Hurezi este un complex monastic din județul Vâlcea, una dintre cele mai importante realizări arhitecturale ale epocii brâncovenești.",
      location: "Horezu, Vâlcea",
      county: "Vâlcea",
      region: "Oltenia",
      foundedYear: 1690,
      feast_day: "21 mai",
      image_url: "/images/monasteries/hurezi.jpg",
      latitude: 45.1683,
      longitude: 24.0042
    },
    {
      name: "Mănăstirea Sucevița",
      description: "Mănăstirea Sucevița, cunoscută pentru zidurile sale fortificate și frescele exterioare, a fost construită la sfârșitul secolului al XVI-lea.",
      location: "Sucevița, Suceava",
      county: "Suceava",
      region: "Moldova",
      foundedYear: 1585,
      feast_day: "15 august",
      image_url: "/images/monasteries/sucevita.jpg",
      latitude: 47.7789,
      longitude: 25.7133
    }
  ];

  // Combinăm listele de mănăstiri
  const allMonasteries = [...monasteriesData, ...additionalMonasteries];

  // Adăugarea fiecărei mănăstiri în baza de date
  for (const monastery of allMonasteries) {
    try {
      // Verificăm dacă mănăstirea există deja (după nume)
      const existingMonastery = await db.query.monasteries.findFirst({
        where: (monasteries, { eq }) => eq(monasteries.name, monastery.name)
      });

      if (existingMonastery) {
        console.log(`Mănăstirea ${monastery.name} există deja. Trecem mai departe.`);
        continue;
      }

      // Inserăm mănăstirea în baza de date
      await db.insert(db.monasteries).values({
        name: monastery.name,
        description: monastery.description,
        location: monastery.location,
        county: monastery.county,
        region: monastery.region,
        foundedYear: monastery.foundedYear,
        feastDay: monastery.feast_day,
        imageUrl: monastery.image_url,
        latitude: monastery.latitude,
        longitude: monastery.longitude
      });

      console.log(`Mănăstirea ${monastery.name} a fost adăugată cu succes.`);
    } catch (error) {
      console.error(`Eroare la adăugarea mănăstirii ${monastery.name}:`, error);
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