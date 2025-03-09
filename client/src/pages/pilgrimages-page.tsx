import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { useState } from "react";
import PilgrimageCard from "@/components/pilgrimages/pilgrimage-card";
import PilgrimageFilters from "@/components/pilgrimages/pilgrimage-filters";
import { Loader2 } from "lucide-react";

export type PilgrimageFilters = {
  location?: string;
  month?: string;
  saint?: string;
  transportation?: string;
  guide?: string;
}

export default function PilgrimagesPage() {
  const [filters, setFilters] = useState<PilgrimageFilters>({});

  // Build query string from filters
  // Construiește string-ul de query pentru request API
  const getQueryString = (filters: PilgrimageFilters) => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
      .join('&');
  };

  const queryStr = getQueryString(filters);
  const apiUrl = `/api/pilgrimages${queryStr ? `?${queryStr}` : ''}`;

  const { data: pilgrimages = [], isLoading, error } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages', filters],
    queryFn: () => fetch(apiUrl).then(res => res.json())
  });

  const handleFilterChange = (newFilters: PilgrimageFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-8">Pelerinaje</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1">
          <PilgrimageFilters onFilterChange={handleFilterChange} />
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading pilgrimages</p>
            </div>
          ) : pilgrimages.length === 0 ? (
            <div className="text-center py-8 bg-neutral-100 rounded-lg">
              <h3 className="text-lg font-medium text-neutral-700">Nu am găsit pelerinaje care să corespundă filtrelor selectate</h3>
              <p className="text-neutral-500 mt-2">Încearcă să modifici criteriile de filtrare</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {pilgrimages.map((pilgrimage) => (
                <PilgrimageCard key={pilgrimage.id} pilgrimage={pilgrimage} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
