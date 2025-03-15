import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { PilgrimageFilters } from "@/pages/pilgrimages-page";

export default function SearchBox() {
  const [_, setLocation] = useLocation();
  const [filters, setFilters] = useState<PilgrimageFilters>({
    location: "",
    month: "",
    saint: "",
    transportation: "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string for the pilgrimages page
    const queryParams = Object.entries(filters)
      .filter(([_, value]) => value !== "")
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join("&");
    
    setLocation(`/pilgrimages${queryParams ? `?${queryParams}` : ""}`);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-4xl">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div>
            <label htmlFor="location" className="block text-neutral-700 font-medium mb-1">Destinație</label>
            <div className="relative">
              <select 
                id="location" 
                name="location" 
                value={filters.location}
                onChange={handleInputChange}
                className="block w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          
          <div>
            <label htmlFor="month" className="block text-neutral-700 font-medium mb-1">Luna</label>
            <div className="relative">
              <select 
                id="month" 
                name="month" 
                value={filters.month}
                onChange={handleInputChange}
                className="block w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          
          <div>
            <label htmlFor="saint" className="block text-neutral-700 font-medium mb-1">Sfânt</label>
            <div className="relative">
              <select 
                id="saint" 
                name="saint" 
                value={filters.saint}
                onChange={handleInputChange}
                className="block w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-4">
          <div>
            <label htmlFor="transportation" className="block text-neutral-700 font-medium mb-1">Transport</label>
            <div className="relative">
              <select 
                id="transportation" 
                name="transportation" 
                value={filters.transportation}
                onChange={handleInputChange}
                className="block w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
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
          
          <div>
            <label htmlFor="duration" className="block text-neutral-700 font-medium mb-1">Durată</label>
            <div className="relative">
              <select 
                id="duration" 
                name="duration" 
                className="block w-full bg-neutral-100 border border-neutral-300 rounded py-2 px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Toate duratele</option>
                <option value="1-3">1-3 zile</option>
                <option value="4-7">4-7 zile</option>
                <option value="8-14">8-14 zile</option>
                <option value="15+">15+ zile</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button 
              type="submit" 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Caută Pelerinaje
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
