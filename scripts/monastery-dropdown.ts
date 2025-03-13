import { db } from "../server/db";
import { monasteries } from "../shared/schema";
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

// Funcție pentru a obține toate mănăstirile grupate pe regiuni și țări
async function getMonasteriesByRegionAndCountry() {
  console.log("Obținem toate mănăstirile din baza de date, grupate pe regiuni și țări...");
  
  // Obține toate mănăstirile din baza de date
  const allMonasteries = await db.query.monasteries.findMany({
    orderBy: [desc(monasteries.name)]
  });
  
  console.log(`Am găsit ${allMonasteries.length} mănăstiri în total.`);
  
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
  
  return result;
}

// Funcție pentru a genera structura pentru dropdown
async function generateDropdownStructure() {
  const groupedMonasteries = await getMonasteriesByRegionAndCountry();
  
  console.log("\nStructură pentru dropdown-uri:");
  console.log(JSON.stringify(groupedMonasteries, null, 2));
  
  console.log("\nExemplu de cod pentru dropdown de mănăstiri:");
  console.log(`
// Componenta React pentru dropdown-ul mănăstirilor
import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

// Structura de date pentru dropdown
const monasteryRegions = ${JSON.stringify(groupedMonasteries, null, 2)};

export function MonasteryRegionDropdown({ onChange }: { onChange: (selectedMonasteries: string[]) => void }) {
  const [selectedMonasteries, setSelectedMonasteries] = useState<string[]>([]);
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  
  // Toggle pentru o țară
  const toggleCountry = (countryName: string) => {
    setExpandedCountries(prev => 
      prev.includes(countryName) 
        ? prev.filter(c => c !== countryName) 
        : [...prev, countryName]
    );
  };
  
  // Toggle pentru o regiune
  const toggleRegion = (regionKey: string) => {
    setExpandedRegions(prev => 
      prev.includes(regionKey) 
        ? prev.filter(r => r !== regionKey) 
        : [...prev, regionKey]
    );
  };
  
  return (
    <div className="monastery-regions-dropdown space-y-2">
      {monasteryRegions.map(country => (
        <Collapsible 
          key={country.name}
          open={expandedCountries.includes(country.name)}
          className="border rounded-md p-2"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center justify-between w-full"
                onClick={() => toggleCountry(country.name)}
              >
                <span>{country.nameRo} ({country.count})</span>
                {expandedCountries.includes(country.name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="pl-4 space-y-2 mt-2">
              {country.regions.map(region => (
                <div key={region.name} className="space-y-1">
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center justify-between w-full"
                      onClick={() => toggleRegion(\`\${country.name}-\${region.name}\`)}
                    >
                      <span>{region.nameRo} ({region.count})</span>
                      {expandedRegions.includes(\`\${country.name}-\${region.name}\`) ? 
                        <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                  </div>
                  
                  {expandedRegions.includes(\`\${country.name}-\${region.name}\`) && (
                    <div className="pl-4 mt-1 space-y-1">
                      {/* Aici vom adăuga mănăstirile din această regiune */}
                      {/* Aceasta va fi o interogare API separată când utilizatorul extinde o regiune */}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="monastery-example"
                          onCheckedChange={(checked) => {
                            // Logică pentru selectarea/deselectarea unei mănăstiri
                          }}
                        />
                        <label htmlFor="monastery-example" className="text-sm cursor-pointer">
                          Exemplu Mănăstire
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
  `);
}

// Rulează funcțiile
async function main() {
  try {
    await generateDropdownStructure();
    console.log("\nScript finalizat cu succes!");
    process.exit(0);
  } catch (error) {
    console.error("Eroare la rularea scriptului:", error);
    process.exit(1);
  }
}

main();