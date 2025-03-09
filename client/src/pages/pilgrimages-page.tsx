import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { useState, useEffect } from "react";
import PilgrimageCard from "@/components/pilgrimages/pilgrimage-card";
import PilgrimageFilterForm from "@/components/pilgrimages/pilgrimage-filter-form";
import { Loader2, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";

export type AdvancedFilters = {
  location?: string;
  month?: string;
  saint?: string;
  transportation?: string;
  guide?: string;
  minPrice?: string;
  maxPrice?: string;
  startDate?: Date;
  endDate?: Date;
}

export default function PilgrimagesPage() {
  const isMobile = useIsMobile();
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<AdvancedFilters>(getInitialFiltersFromUrl());
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Obține filtrele inițiale din URL
  function getInitialFiltersFromUrl(): AdvancedFilters {
    const initialFilters: AdvancedFilters = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    
    if (urlSearchParams.has('location')) initialFilters.location = urlSearchParams.get('location') || undefined;
    if (urlSearchParams.has('month')) initialFilters.month = urlSearchParams.get('month') || undefined;
    if (urlSearchParams.has('saint')) initialFilters.saint = urlSearchParams.get('saint') || undefined;
    if (urlSearchParams.has('transportation')) initialFilters.transportation = urlSearchParams.get('transportation') || undefined;
    if (urlSearchParams.has('guide')) initialFilters.guide = urlSearchParams.get('guide') || undefined;
    if (urlSearchParams.has('minPrice')) initialFilters.minPrice = urlSearchParams.get('minPrice') || undefined;
    if (urlSearchParams.has('maxPrice')) initialFilters.maxPrice = urlSearchParams.get('maxPrice') || undefined;
    
    // Pentru date, trebuie să le convertim din string în obiect Date
    if (urlSearchParams.has('startDate')) {
      const startDateStr = urlSearchParams.get('startDate');
      if (startDateStr) initialFilters.startDate = new Date(startDateStr);
    }
    
    if (urlSearchParams.has('endDate')) {
      const endDateStr = urlSearchParams.get('endDate');
      if (endDateStr) initialFilters.endDate = new Date(endDateStr);
    }
    
    return initialFilters;
  }

  // Construiește string-ul de query pentru request API și URL
  const updateQueryParams = (filters: AdvancedFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convertim obiectele Date în string-uri ISO pentru URL
        if (value instanceof Date) {
          params.set(key, value.toISOString());
        } else {
          params.set(key, String(value));
        }
      }
    });
    
    // Actualizăm URL-ul fără a cauza o redirecționare
    const newUrl = params.toString() ? 
      `/pilgrimages?${params.toString()}` : 
      '/pilgrimages';
    
    window.history.pushState(null, '', newUrl);
    
    return params.toString();
  };

  const { data: pilgrimages = [], isLoading, error } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages', filters],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Filtrează local rezultatele deoarece backend-ul nu suportă toate filtrele încă
  const filteredPilgrimages = pilgrimages.filter(pilgrimage => {
    // Filtrare după preț
    if (filters.minPrice && parseFloat(filters.minPrice) > pilgrimage.price) {
      return false;
    }
    
    if (filters.maxPrice && parseFloat(filters.maxPrice) < pilgrimage.price) {
      return false;
    }
    
    // Filtrare după dată de început
    if (filters.startDate && new Date(pilgrimage.startDate) < filters.startDate) {
      return false;
    }
    
    // Filtrare după dată de sfârșit
    if (filters.endDate && new Date(pilgrimage.endDate) > filters.endDate) {
      return false;
    }
    
    return true;
  });

  const handleFilterChange = (newFilters: AdvancedFilters) => {
    setFilters(newFilters);
    updateQueryParams(newFilters);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Pelerinaje ortodoxe</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleFilters}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" /> 
            {showFilters ? "Ascunde filtrele" : "Arată filtrele"}
          </Button>
          
          <div className="border rounded-md flex">
            <Button
              variant={viewMode === 'grid' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters */}
        {showFilters && (
          <div className="lg:col-span-1">
            <PilgrimageFilterForm 
              onFilterChange={handleFilterChange} 
              initialFilters={filters}
              className="sticky top-4"
            />
          </div>
        )}
        
        {/* Main content */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Eroare la încărcarea pelerinajelor</p>
            </div>
          ) : filteredPilgrimages.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-lg">
              <h3 className="text-lg font-medium">Nu am găsit pelerinaje care să corespundă filtrelor selectate</h3>
              <p className="text-muted-foreground mt-2">Încearcă să modifici criteriile de filtrare</p>
              <Button 
                onClick={() => {
                  setFilters({});
                  window.history.pushState(null, '', '/pilgrimages');
                }} 
                variant="outline" 
                className="mt-4"
              >
                Resetează toate filtrele
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">
                S-au găsit {filteredPilgrimages.length} pelerinaje
              </p>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPilgrimages.map((pilgrimage) => (
                    <PilgrimageCard key={pilgrimage.id} pilgrimage={pilgrimage} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPilgrimages.map((pilgrimage) => (
                    <PilgrimageCard key={pilgrimage.id} pilgrimage={pilgrimage} viewType="list" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
