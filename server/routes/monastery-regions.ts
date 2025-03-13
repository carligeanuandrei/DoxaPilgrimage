import { Express, Request, Response } from "express";
import { db } from "../db";
import { monasteries } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

// Grupare pentru regiune
type RegionGroup = {
  name: string;
  nameRo: string;
  count: number;
};

// Grup pentru țară
type CountryGroup = {
  name: string;
  nameRo: string;
  regions: RegionGroup[];
  count: number;
};

/**
 * Înregistrează rutele API pentru regiunile de mănăstiri
 */
export function registerMonasteryRegionsRoutes(app: Express) {
  /**
   * GET /api/monasteries/regions
   * Returnează toate regiunile grupate pe țări, cu numărul de mănăstiri din fiecare
   */
  app.get("/api/monasteries/regions", async (req: Request, res: Response) => {
    try {
      // Obține toate mănăstirile din baza de date
      const allMonasteries = await db.query.monasteries.findMany({
        orderBy: [desc(monasteries.name)]
      });
      
      // Organizează datele pe țări și regiuni
      const countriesMap = new Map<string, CountryGroup>();
      
      // Adaugă România ca țară implicită
      countriesMap.set("România", {
        name: "Romania",
        nameRo: "România",
        regions: [],
        count: 0
      });
      
      // Regiunile din România (cu nume în engleză și română)
      const romanianRegions = [
        { code: "moldova", name: "Moldova", nameRo: "Moldova" },
        { code: "bucovina", name: "Bucovina", nameRo: "Bucovina" },
        { code: "muntenia", name: "Wallachia", nameRo: "Muntenia" },
        { code: "oltenia", name: "Oltenia", nameRo: "Oltenia" },
        { code: "transilvania", name: "Transylvania", nameRo: "Transilvania" },
        { code: "maramures", name: "Maramures", nameRo: "Maramureș" },
        { code: "banat", name: "Banat", nameRo: "Banat" },
        { code: "dobrogea", name: "Dobrogea", nameRo: "Dobrogea" }
      ];
      
      // Inițializează regiunile pentru România
      const romaniaGroup = countriesMap.get("România")!;
      for (const region of romanianRegions) {
        romaniaGroup.regions.push({
          name: region.name,
          nameRo: region.nameRo,
          count: 0
        });
      }
      
      // Grupează mănăstirile pe regiuni
      for (const monastery of allMonasteries) {
        const country = monastery.country || "România";
        
        // Verifică dacă țara există în mapare, dacă nu, o adaugă
        if (!countriesMap.has(country)) {
          countriesMap.set(country, {
            name: country === "România" ? "Romania" : country,
            nameRo: country,
            regions: [],
            count: 0
          });
        }
        
        const countryGroup = countriesMap.get(country)!;
        countryGroup.count++;
        
        // Verifică regiunea
        const region = monastery.region;
        if (region) {
          // Găsește regiunea în lista regiunilor țării
          let regionGroup = countryGroup.regions.find(r => {
            if (country === "România") {
              const regionInfo = romanianRegions.find(rr => rr.code === region);
              return regionInfo && r.nameRo === regionInfo.nameRo;
            }
            return r.name.toLowerCase() === region.toLowerCase();
          });
          
          // Dacă regiunea nu există, o adaugă
          if (!regionGroup) {
            if (country === "România") {
              const regionInfo = romanianRegions.find(r => r.code === region) || 
                { name: region, nameRo: region };
              
              regionGroup = {
                name: regionInfo.name,
                nameRo: regionInfo.nameRo,
                count: 0
              };
            } else {
              regionGroup = {
                name: region,
                nameRo: region,
                count: 0
              };
            }
            
            countryGroup.regions.push(regionGroup);
          }
          
          regionGroup.count++;
        }
      }
      
      // Sortează regiunile după nume
      for (const country of countriesMap.values()) {
        country.regions.sort((a, b) => a.nameRo.localeCompare(b.nameRo));
      }
      
      // Convertește Map la array și sortează țările
      const result = Array.from(countriesMap.values())
        .sort((a, b) => a.nameRo.localeCompare(b.nameRo));
      
      res.json(result);
    } catch (error) {
      console.error("Eroare la obținerea regiunilor de mănăstiri:", error);
      res.status(500).json({ error: "Eroare la obținerea regiunilor de mănăstiri" });
    }
  });

  /**
   * GET /api/monasteries/by-region
   * Returnează toate mănăstirile dintr-o regiune specifică
   * Query params: country, region
   */
  app.get("/api/monasteries/by-region", async (req: Request, res: Response) => {
    try {
      const { country, region } = req.query;
      
      if (!region) {
        return res.status(400).json({ error: "Parametrul 'region' este obligatoriu" });
      }
      
      // Map region name to region code for Romanian regions
      let regionCode = region;
      if (country === "Romania" || country === "România") {
        const romanianRegions = {
          "Moldova": "moldova",
          "Bucovina": "bucovina",
          "Muntenia": "muntenia",
          "Oltenia": "oltenia",
          "Transilvania": "transilvania",
          "Maramureș": "maramures",
          "Banat": "banat",
          "Dobrogea": "dobrogea"
        };
        
        regionCode = romanianRegions[region as string] || region;
      }
      
      // Caută mănăstirile din regiunea specificată
      const monasteryList = await db.query.monasteries.findMany({
        where: (monasteries, { eq, and }) => and(
          country ? eq(monasteries.country || "România", country as string) : undefined,
          eq(monasteries.region, regionCode as string)
        ),
        orderBy: [desc(monasteries.name)],
        columns: {
          id: true,
          name: true,
          slug: true,
          region: true,
          city: true,
          county: true,
          country: true,
          type: true
        }
      });
      
      res.json(monasteryList);
    } catch (error) {
      console.error("Eroare la obținerea mănăstirilor din regiune:", error);
      res.status(500).json({ error: "Eroare la obținerea mănăstirilor din regiune" });
    }
  });
}