import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, MapPinIcon, ChurchIcon, StarIcon, TrendingUpIcon, CompassIcon } from 'lucide-react';
import { formatRegionName } from '@/lib/format-utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

// Tipurile de date pentru recomandări
type Monastery = {
  id: number;
  name: string;
  region: string;
  city?: string;
  county?: string;
  slug: string;
  description: string;
  shortDescription?: string;
  patronSaint?: string;
  patronSaintDate?: string;
  images: string[];
  type: 'monastery' | 'hermitage' | 'church';
  verification: boolean;
};

type OrthodoxFeast = {
  id: number;
  date: string;
  name: string;
  nameRo: string;
  type: 'major' | 'minor' | 'saint';
};

type MonasteryWithFeast = Monastery & {
  feast?: OrthodoxFeast;
};

type RecommendationResponse = {
  type: string;
  recommendations: MonasteryWithFeast[];
  feasts?: OrthodoxFeast[];
};

/**
 * Componenta pentru afișarea recomandărilor de mănăstiri
 */
export default function MonasteryRecommendations() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('popular');
  
  // Query pentru obținerea recomandărilor populare
  const popularQuery = useQuery({
    queryKey: ['/api/monasteries/recommendations', { type: 'popular' }],
    queryFn: async () => {
      const response = await fetch(`/api/monasteries/recommendations?type=popular&limit=6`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor');
      }
      return response.json() as Promise<RecommendationResponse>;
    }
  });
  
  // Query pentru obținerea recomandărilor bazate pe sărbători
  const feastQuery = useQuery({
    queryKey: ['/api/monasteries/recommendations/feasts'],
    queryFn: async () => {
      const response = await fetch('/api/monasteries/recommendations/feasts?limit=6');
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor pentru sărbători');
      }
      return response.json() as Promise<RecommendationResponse>;
    },
    enabled: activeTab === 'feasts'
  });
  
  // Query pentru obținerea recomandărilor bazate pe regiune
  const regionQuery = useQuery({
    queryKey: ['/api/monasteries/recommendations', { type: 'by_region' }],
    queryFn: async () => {
      const response = await fetch(`/api/monasteries/recommendations?type=by_region&limit=6`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor pe regiuni');
      }
      return response.json() as Promise<RecommendationResponse>;
    },
    enabled: activeTab === 'regions'
  });
  
  // Query pentru obținerea recomandărilor ascunse
  const hiddenGemsQuery = useQuery({
    queryKey: ['/api/monasteries/recommendations', { type: 'hidden_gems' }],
    queryFn: async () => {
      const response = await fetch(`/api/monasteries/recommendations?type=hidden_gems&limit=6`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor pentru comori ascunse');
      }
      return response.json() as Promise<RecommendationResponse>;
    },
    enabled: activeTab === 'hidden_gems'
  });
  
  // Funcție pentru afișarea unei imagini de mănăstire cu fallback
  const getMonasteryImage = (monastery: Monastery) => {
    if (monastery.images && monastery.images.length > 0) {
      return `/static/${monastery.images[0]}`;
    }
    return `/static/images/default-monastery.jpg`;
  };

  // Convertim data în format lizibil
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long' }).format(date);
  };

  // Randăm carduri pentru mănăstiri
  const renderMonasteryCards = (monasteries: MonasteryWithFeast[] = [], isLoading: boolean, error: Error | null) => {
    if (isLoading) {
      return Array(6).fill(0).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden h-[350px]">
          <Skeleton className="h-40 w-full" />
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    if (error) {
      return (
        <div className="col-span-full">
          <Alert variant="destructive">
            <AlertTitle>Eroare!</AlertTitle>
            <AlertDescription>Nu am putut încărca recomandările de mănăstiri. Încercați din nou mai târziu.</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (monasteries.length === 0) {
      return (
        <div className="col-span-full">
          <Alert>
            <AlertTitle>Nicio recomandare disponibilă</AlertTitle>
            <AlertDescription>Nu am găsit recomandări pentru criteriile selectate.</AlertDescription>
          </Alert>
        </div>
      );
    }

    return monasteries.map((monastery) => (
      <Card key={monastery.id} className="overflow-hidden flex flex-col">
        <div className="relative h-40 overflow-hidden">
          <img 
            src={getMonasteryImage(monastery)} 
            alt={monastery.name} 
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 p-1">
            <Badge variant="secondary" className="bg-white/80 text-primary">
              {formatRegionName(monastery.region)}
            </Badge>
          </div>
          {monastery.feast && (
            <div className="absolute top-0 right-0 p-1">
              <Badge variant="default" className="bg-primary/80">
                {formatDate(monastery.feast.date)}
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">{monastery.name}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPinIcon size={14} />
            {monastery.city}{monastery.county ? `, ${monastery.county}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-grow">
          <p className="text-sm line-clamp-3">
            {monastery.shortDescription || monastery.description.substring(0, 150) + '...'}
          </p>
          {monastery.patronSaint && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <ChurchIcon size={14} />
              <span>Hram: {monastery.patronSaint}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button variant="outline" asChild className="w-full">
            <Link to={`/monasteries/${monastery.slug}`}>
              Vezi detalii
            </Link>
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recomandări de Mănăstiri</h2>
        </div>
        
        <Tabs defaultValue="popular" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <StarIcon size={isMobile ? 16 : 20} />
              <span className={isMobile ? "hidden" : "inline"}>Populare</span>
            </TabsTrigger>
            <TabsTrigger value="feasts" className="flex items-center gap-2">
              <CalendarIcon size={isMobile ? 16 : 20} />
              <span className={isMobile ? "hidden" : "inline"}>După Hram</span>
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <MapPinIcon size={isMobile ? 16 : 20} />
              <span className={isMobile ? "hidden" : "inline"}>După Regiune</span>
            </TabsTrigger>
            <TabsTrigger value="hidden_gems" className="flex items-center gap-2">
              <CompassIcon size={isMobile ? 16 : 20} />
              <span className={isMobile ? "hidden" : "inline"}>Comori Ascunse</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMonasteryCards(
                popularQuery.data?.recommendations, 
                popularQuery.isLoading, 
                popularQuery.error as Error
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="feasts" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMonasteryCards(
                feastQuery.data?.recommendations, 
                feastQuery.isLoading, 
                feastQuery.error as Error
              )}
            </div>
            {feastQuery.data?.feasts && feastQuery.data.feasts.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="text-sm font-medium mb-2">Sărbători apropiate:</h3>
                <div className="flex flex-wrap gap-2">
                  {feastQuery.data.feasts.slice(0, 5).map(feast => (
                    <Badge key={feast.id} variant="outline" className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {feast.nameRo} ({formatDate(feast.date)})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="regions" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMonasteryCards(
                regionQuery.data?.recommendations, 
                regionQuery.isLoading, 
                regionQuery.error as Error
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="hidden_gems" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMonasteryCards(
                hiddenGemsQuery.data?.recommendations, 
                hiddenGemsQuery.isLoading, 
                hiddenGemsQuery.error as Error
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href="/monasteries">
              Vezi toate mănăstirile
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}