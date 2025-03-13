import { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Tipurile de date
type RegionGroup = {
  name: string;
  nameRo: string;
  count: number;
};

type CountryGroup = {
  name: string;
  nameRo: string;
  regions: RegionGroup[];
  count: number;
};

type Monastery = {
  id: number;
  name: string;
  slug: string;
  region: string;
  city: string;
  county: string;
  type: 'monastery' | 'hermitage' | 'church';
};

export function MonasteryRegionDropdown({ 
  onChange, 
  selectedMonasteries = [] 
}: { 
  onChange: (selectedMonasteries: number[]) => void,
  selectedMonasteries?: number[]
}) {
  const { toast } = useToast();
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [regionMonasteries, setRegionMonasteries] = useState<{[key: string]: Monastery[]}>({});
  const [selected, setSelected] = useState<number[]>(selectedMonasteries);
  
  // Obține structura de regiuni
  const { data: monasteryRegions, isLoading, error } = useQuery<CountryGroup[]>({
    queryKey: ['/api/monasteries/regions'],
  });
  
  useEffect(() => {
    // Actualizăm selecția când se schimbă prop-ul
    if (selectedMonasteries.length > 0) {
      setSelected(selectedMonasteries);
    }
  }, [selectedMonasteries]);
  
  // Toggle pentru o țară
  const toggleCountry = (countryName: string) => {
    setExpandedCountries(prev => 
      prev.includes(countryName) 
        ? prev.filter(c => c !== countryName) 
        : [...prev, countryName]
    );
  };
  
  // Toggle pentru o regiune și încarcă mănăstirile din acea regiune
  const toggleRegion = async (countryName: string, regionName: string) => {
    const regionKey = `${countryName}-${regionName}`;
    
    // Expandăm/colapsăm regiunea
    if (expandedRegions.includes(regionKey)) {
      setExpandedRegions(prev => prev.filter(r => r !== regionKey));
      return;
    }
    
    setExpandedRegions(prev => [...prev, regionKey]);
    
    // Dacă mănăstirile din această regiune nu au fost încărcate încă, le încărcăm
    if (!regionMonasteries[regionKey]) {
      try {
        // Utilizăm doar parametrul region, deoarece în backend avem doar mănăstiri din România
        const response = await fetch(`/api/monasteries/by-region?region=${regionName}`);
        if (!response.ok) {
          throw new Error('Eroare la încărcarea mănăstirilor');
        }
        
        const data = await response.json();
        setRegionMonasteries(prev => ({
          ...prev,
          [regionKey]: data
        }));
      } catch (error) {
        toast({
          title: "Eroare",
          description: "Nu s-au putut încărca mănăstirile din această regiune",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handler pentru selecția mănăstirilor
  const handleMonasterySelection = (monasteryId: number, checked: boolean) => {
    const updatedSelection = checked
      ? [...selected, monasteryId]
      : selected.filter(id => id !== monasteryId);
    
    setSelected(updatedSelection);
    onChange(updatedSelection);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !monasteryRegions) {
    return (
      <div className="text-destructive p-4 border border-destructive rounded-md">
        Nu s-a putut încărca lista de regiuni. Încercați să reîmprospătați pagina.
      </div>
    );
  }
  
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
                {expandedCountries.includes(country.name) ? 
                  <ChevronDown size={16} /> : 
                  <ChevronRight size={16} />
                }
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
                      onClick={() => toggleRegion(country.name, region.name)}
                    >
                      <span>{region.nameRo} ({region.count})</span>
                      {expandedRegions.includes(`${country.name}-${region.name}`) ? 
                        <ChevronDown size={16} /> : 
                        <ChevronRight size={16} />
                      }
                    </Button>
                  </div>
                  
                  {expandedRegions.includes(`${country.name}-${region.name}`) && (
                    <div className="pl-4 mt-1 space-y-1">
                      {!regionMonasteries[`${country.name}-${region.name}`] ? (
                        <div className="flex items-center space-x-2 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm">Se încarcă...</span>
                        </div>
                      ) : regionMonasteries[`${country.name}-${region.name}`].length === 0 ? (
                        <div className="text-sm text-muted-foreground py-2">
                          Nu există mănăstiri în această regiune.
                        </div>
                      ) : (
                        regionMonasteries[`${country.name}-${region.name}`].map(monastery => (
                          <div key={monastery.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`monastery-${monastery.id}`}
                              checked={selected.includes(monastery.id)}
                              onCheckedChange={(checked) => 
                                handleMonasterySelection(monastery.id, !!checked)
                              }
                            />
                            <label 
                              htmlFor={`monastery-${monastery.id}`} 
                              className="text-sm cursor-pointer"
                            >
                              {monastery.name}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({monastery.city}, {monastery.county})
                              </span>
                            </label>
                          </div>
                        ))
                      )}
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