import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PilgrimageFilters } from "@/pages/pilgrimages-page";

interface PilgrimageFiltersProps {
  onFilterChange: (filters: PilgrimageFilters) => void;
}

export default function PilgrimageFiltersComponent({ onFilterChange }: PilgrimageFiltersProps) {
  const [filters, setFilters] = useState<PilgrimageFilters>({
    location: "",
    month: "",
    saint: "",
    transportation: "",
    guide: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  const resetFilters = () => {
    setFilters({
      location: "",
      month: "",
      saint: "",
      transportation: "",
      guide: ""
    });
    
    // Trigger the parent component's filter change
    onFilterChange({});
  };
  
  useEffect(() => {
    // If filters are all empty, notify parent
    const allEmpty = Object.values(filters).every(value => value === "");
    if (allEmpty) {
      onFilterChange({});
    }
  }, [filters, onFilterChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtrează Pelerinaje</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Destinație</Label>
            <div className="relative">
              <select 
                id="location" 
                name="location" 
                value={filters.location}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toate locațiile</option>
                <option value="Israel">Israel și Palestina</option>
                <option value="Grecia">Grecia (Muntele Athos)</option>
                <option value="România">România</option>
                <option value="Vatican">Vatican și Italia</option>
                <option value="Franța">Franța (Lourdes)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="month">Luna</Label>
            <div className="relative">
              <select 
                id="month" 
                name="month" 
                value={filters.month}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toate lunile</option>
                <option value="Ianuarie">Ianuarie</option>
                <option value="Februarie">Februarie</option>
                <option value="Martie">Martie</option>
                <option value="Aprilie">Aprilie</option>
                <option value="Mai">Mai</option>
                <option value="Iunie">Iunie</option>
                <option value="Iulie">Iulie</option>
                <option value="August">August</option>
                <option value="Septembrie">Septembrie</option>
                <option value="Octombrie">Octombrie</option>
                <option value="Noiembrie">Noiembrie</option>
                <option value="Decembrie">Decembrie</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="saint">Sfânt</Label>
            <div className="relative">
              <select 
                id="saint" 
                name="saint" 
                value={filters.saint}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toți Sfinții</option>
                <option value="Sf. Maria">Sf. Maria</option>
                <option value="Sf. Nicolae">Sf. Nicolae</option>
                <option value="Sf. Parascheva">Sf. Parascheva</option>
                <option value="Sf. Dimitrie">Sf. Dimitrie</option>
                <option value="Sf. Gheorghe">Sf. Gheorghe</option>
                <option value="Maica Domnului">Maica Domnului</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="transportation">Transport</Label>
            <div className="relative">
              <select 
                id="transportation" 
                name="transportation" 
                value={filters.transportation}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toate tipurile</option>
                <option value="Autocar">Autocar</option>
                <option value="Avion">Avion</option>
                <option value="Tren">Tren</option>
                <option value="Transport mixt">Transport mixt</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="guide">Ghid</Label>
            <div className="relative">
              <select 
                id="guide" 
                name="guide" 
                value={filters.guide}
                onChange={handleInputChange}
                className="w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toți ghizii</option>
                <option value="Pr. Andrei Popescu">Pr. Andrei Popescu</option>
                <option value="Maria Ionescu">Maria Ionescu</option>
                <option value="Pr. Vasile Dumitrescu">Pr. Vasile Dumitrescu</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button type="submit" className="w-full">Aplică Filtre</Button>
            <Button type="button" variant="outline" onClick={resetFilters}>Resetează</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
