import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Church, Search, Filter, Grid, List } from 'lucide-react';
import { Monastery } from '@shared/schema';

// Componenta pentru card-ul de mănăstire (versiunea Grid)
const MonasteryGridCard: React.FC<{ monastery: Monastery }> = ({ monastery }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="h-40 bg-muted">
        <img 
          src={monastery.coverImage || "/images/monastery-placeholder.jpg"} 
          alt={monastery.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/monastery-placeholder.jpg";
          }}
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold truncate">{monastery.name}</h3>
        <div className="flex items-center text-sm text-muted-foreground mt-1 mb-2">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{monastery.city}, {monastery.county}</span>
        </div>
        
        <div className="flex gap-1 mb-3">
          <Badge variant="outline" className="text-xs capitalize">
            {monastery.type === 'monastery' ? 'Mănăstire' : 
             monastery.type === 'hermitage' ? 'Schit' : 'Biserică'}
          </Badge>
          <Badge className="text-xs">{formatRegionName(monastery.region)}</Badge>
        </div>
        
        <p className="text-sm line-clamp-2 mb-3">
          {monastery.shortDescription || 
           (monastery.description ? 
            monastery.description.substring(0, 100) + '...' : 
            'Informații detaliate curând...')}
        </p>
        
        {monastery.patronSaint && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Church size={14} />
            <span>Hram: {monastery.patronSaint}</span>
          </div>
        )}
        
        <Link to={`/monasteries/${monastery.slug}`} className="text-primary text-sm hover:underline mt-auto block text-right">
          Vezi detalii →
        </Link>
      </CardContent>
    </Card>
  );
};

// Componenta pentru card-ul de mănăstire (versiunea List)
const MonasteryListCard: React.FC<{ monastery: Monastery }> = ({ monastery }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 h-40 md:h-auto bg-muted">
          <img 
            src={monastery.coverImage || "/images/monastery-placeholder.jpg"} 
            alt={monastery.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/monastery-placeholder.jpg";
            }}
          />
        </div>
        <CardContent className="p-4 flex-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h3 className="font-bold">{monastery.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin size={14} className="mr-1" />
                <span>{monastery.city}, {monastery.county}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs capitalize">
                {monastery.type === 'monastery' ? 'Mănăstire' : 
                monastery.type === 'hermitage' ? 'Schit' : 'Biserică'}
              </Badge>
              <Badge className="text-xs">{formatRegionName(monastery.region)}</Badge>
            </div>
          </div>
          
          <p className="text-sm my-3">
            {monastery.shortDescription || 
            (monastery.description ? 
              monastery.description.substring(0, 150) + '...' : 
              'Informații detaliate curând...')}
          </p>
          
          <div className="flex justify-between items-end">
            {monastery.patronSaint && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Church size={14} />
                <span>Hram: {monastery.patronSaint}</span>
              </div>
            )}
            <Link to={`/monasteries/${monastery.slug}`} className="text-primary text-sm hover:underline">
              Vezi detalii →
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

// Funcție pentru formatarea numelui regiunii
function formatRegionName(region: string): string {
  const regionMap: {[key: string]: string} = {
    'moldova': 'Moldova',
    'bucovina': 'Bucovina',
    'muntenia': 'Muntenia',
    'oltenia': 'Oltenia',
    'transilvania': 'Transilvania',
    'maramures': 'Maramureș',
    'banat': 'Banat',
    'dobrogea': 'Dobrogea',
    'crisana': 'Crișana'
  };
  
  return regionMap[region] || region;
}

// Pagina principală pentru mănăstiri
export default function MonasteriesPage() {
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredMonasteries, setFilteredMonasteries] = useState<Monastery[]>([]);
  
  // Obținem datele despre mănăstiri
  const { isLoading, data: monasteries, error } = useQuery<Monastery[]>({
    queryKey: ['/api/monasteries'],
    staleTime: 1000 * 60 * 5, // 5 minute
    retry: 1
  });
  
  // Efect pentru filtrarea mănăstirilor
  useEffect(() => {
    if (!monasteries) return;
    
    let result = monasteries;
    
    // Filtrare după căutare
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(monastery => 
        monastery.name.toLowerCase().includes(query) || 
        monastery.city?.toLowerCase().includes(query) || 
        monastery.county?.toLowerCase().includes(query) ||
        monastery.patronSaint?.toLowerCase().includes(query)
      );
    }
    
    // Filtrare după regiune
    if (regionFilter !== 'all') {
      result = result.filter(monastery => monastery.region === regionFilter);
    }
    
    // Filtrare după tip
    if (typeFilter !== 'all') {
      result = result.filter(monastery => monastery.type === typeFilter);
    }
    
    setFilteredMonasteries(result);
  }, [monasteries, searchQuery, regionFilter, typeFilter]);
  
  // Afișăm starea de încărcare
  if (isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Mănăstiri Ortodoxe</h1>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Afișăm mesaj de eroare
  if (error || !monasteries) {
    console.error("Eroare la încărcarea mănăstirilor:", error);
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Mănăstiri Ortodoxe</h1>
        <div className="py-8 text-center">
          <p className="text-red-500 mb-4">
            A apărut o eroare la încărcarea listei de mănăstiri. 
          </p>
          <Button onClick={() => window.location.reload()}>
            Reîncarcă pagina
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Mănăstiri Ortodoxe</h1>
      <p className="text-muted-foreground mb-8">
        Descoperă patrimoniul monahal ortodox din România
      </p>
      
      {/* Filtre și căutare */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume, locație sau hram..."
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Regiune" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Toate regiunile</SelectItem>
                <SelectItem value="moldova">Moldova</SelectItem>
                <SelectItem value="bucovina">Bucovina</SelectItem>
                <SelectItem value="muntenia">Muntenia</SelectItem>
                <SelectItem value="oltenia">Oltenia</SelectItem>
                <SelectItem value="transilvania">Transilvania</SelectItem>
                <SelectItem value="maramures">Maramureș</SelectItem>
                <SelectItem value="banat">Banat</SelectItem>
                <SelectItem value="dobrogea">Dobrogea</SelectItem>
                <SelectItem value="crisana">Crișana</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Church className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Toate tipurile</SelectItem>
                <SelectItem value="monastery">Mănăstiri</SelectItem>
                <SelectItem value="hermitage">Schituri</SelectItem>
                <SelectItem value="church">Biserici</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <div className="flex rounded-md border">
            <Button
              variant={layout === 'grid' ? 'default' : 'ghost'}
              className="rounded-r-none px-3"
              onClick={() => setLayout('grid')}
              size="icon"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-auto" />
            <Button
              variant={layout === 'list' ? 'default' : 'ghost'}
              className="rounded-l-none px-3"
              onClick={() => setLayout('list')}
              size="icon"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Rezultatele filtrării */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredMonasteries.length} 
          {filteredMonasteries.length === 1 ? ' rezultat' : ' rezultate'} găsite
        </p>
        
        {(searchQuery || regionFilter !== 'all' || typeFilter !== 'all') && (
          <Button 
            variant="ghost" 
            className="text-sm h-8 px-2"
            onClick={() => {
              setSearchQuery('');
              setRegionFilter('all');
              setTypeFilter('all');
            }}
          >
            Resetează filtrele
          </Button>
        )}
      </div>
      
      {/* Listarea mănăstirilor */}
      {filteredMonasteries.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Nu a fost găsită nicio mănăstire care să corespundă criteriilor de filtrare.
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setRegionFilter('all');
              setTypeFilter('all');
            }}
          >
            Resetează filtrele
          </Button>
        </div>
      ) : (
        <div className={
          layout === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }>
          {filteredMonasteries.map((monastery) => (
            layout === 'grid' ? (
              <MonasteryGridCard key={monastery.id} monastery={monastery} />
            ) : (
              <MonasteryListCard key={monastery.id} monastery={monastery} />
            )
          ))}
        </div>
      )}
    </div>
  );
}