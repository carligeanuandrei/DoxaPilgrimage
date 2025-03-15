import React, { useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  History,
  Church,
  Clock,
  MapIcon,
  PhoneCall,
  Mail,
  Globe,
  Star,
  Home,
  Landmark,
} from 'lucide-react';
import { Monastery } from '@shared/schema';
import { motion } from 'framer-motion';

interface MonasteryDetailsPageProps {
  slug?: string;
}

export default function MonasteryDetailsPage({ slug: propSlug }: MonasteryDetailsPageProps) {
  // Extragem slug-ul din URL sau folosim prop
  const [match, params] = useRoute<{ slug: string }>("/monasteries/:slug");
  const slug = propSlug || params?.slug;

  // Încărcăm datele mănăstirii
  const { isLoading, data: monastery } = useQuery<Monastery>({
    queryKey: [`/api/monasteries/${slug}`],
    enabled: !!slug,
    retry: 1,
    retryDelay: 1000
  });

  useEffect(() => {
    if (monastery) {
      document.title = `${monastery.name} | Doxa`;
    }
  }, [monastery]);

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!monastery) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Mănăstirea nu a fost găsită</h1>
          <p className="text-muted-foreground mb-6">
            Ne pare rău, dar mănăstirea pe care o căutați nu există sau a fost eliminată.
          </p>
          <Link to="/monasteries">
            <Button variant="outline" className="mt-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi la lista de mănăstiri
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Tipul de așezământ formatat
  const formattedType = monastery.type === 'monastery' 
    ? 'Mănăstire' 
    : monastery.type === 'hermitage' 
      ? 'Schit' 
      : 'Biserică';

  // Formatăm regiunea
  const formatRegionName = (region: string): string => {
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
  };

  return (
    <div className="container py-8 md:py-12">
      <Link to="/monasteries">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-0 hover:bg-transparent">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Înapoi la lista de mănăstiri
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coloana principală cu detalii */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {monastery.region && (
                <Badge>{formatRegionName(monastery.region)}</Badge>
              )}
              <Badge variant="outline">{formattedType}</Badge>
              {monastery.county && (
                <Badge variant="secondary">{monastery.county}</Badge>
              )}
              {monastery.verification === 'verified' && (
                <Badge variant="default" className="bg-green-500">
                  <Star className="h-3 w-3 mr-1 fill-white" /> Verificat
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{monastery.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {monastery.city ? monastery.city : "Localitate nedisponibilă"}
                {monastery.county ? `, ${monastery.county}` : ""}
              </span>
            </div>
          </div>

          {/* Imaginea principală */}
          <div className="relative rounded-lg overflow-hidden h-[300px] md:h-[400px] bg-muted">
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

          {/* Tabs pentru diferite secțiuni de conținut */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="about">Despre</TabsTrigger>
              {monastery.history && (
                <TabsTrigger value="history">Istorie</TabsTrigger>
              )}
              {(monastery.relics && monastery.relics.length > 0) && (
                <TabsTrigger value="relics">Moaște</TabsTrigger>
              )}
              {monastery.access && (
                <TabsTrigger value="access">Acces</TabsTrigger>
              )}
            </TabsList>
            
            {/* Tab Despre */}
            <TabsContent value="about" className="space-y-4">
              <div className="prose max-w-none">
                <p>{monastery.description}</p>
                {monastery.shortDescription && monastery.shortDescription !== monastery.description && (
                  <p>{monastery.shortDescription}</p>
                )}
              </div>
              
              {monastery.patronSaint && (
                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <Church className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Hram</h3>
                    <p>{monastery.patronSaint}</p>
                    {monastery.patronSaintDate && (
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(monastery.patronSaintDate).toLocaleDateString('ro-RO')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {monastery.foundedYear && (
                <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                  <History className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Anul fondării</h3>
                    <p>{monastery.foundedYear}</p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Tab Istorie */}
            {monastery.history && (
              <TabsContent value="history" className="space-y-4">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Istorie</h2>
                  <p>{monastery.history}</p>
                </div>
              </TabsContent>
            )}
            
            {/* Tab Moaște */}
            {(monastery.relics && monastery.relics.length > 0) && (
              <TabsContent value="relics" className="space-y-4">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Moaște și obiecte sacre</h2>
                  <ul>
                    {monastery.relics.map((relic, index) => (
                      <li key={index}>{relic}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            )}
            
            {/* Tab Acces */}
            {monastery.access && (
              <TabsContent value="access" className="space-y-4">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">Cum ajungi</h2>
                  <p>{monastery.access}</p>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Galerie de imagini */}
          {monastery.images && monastery.images.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Galerie foto</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {monastery.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img 
                      src={image || "/images/monastery-placeholder.jpg"} 
                      alt={`${monastery.name} - imagine ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/monastery-placeholder.jpg";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar cu informații suplimentare */}
        <div className="space-y-6">
          {/* Card cu informații de contact */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Informații de contact</h3>
              
              {monastery.address && (
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Adresă</h4>
                    <p className="text-sm text-muted-foreground">{monastery.address}</p>
                  </div>
                </div>
              )}
              
              {monastery.contactPhone && (
                <div className="flex items-start gap-3 mb-4">
                  <PhoneCall className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Telefon</h4>
                    <a 
                      href={`tel:${monastery.contactPhone}`} 
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {monastery.contactPhone}
                    </a>
                  </div>
                </div>
              )}
              
              {monastery.contactEmail && (
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <a 
                      href={`mailto:${monastery.contactEmail}`} 
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {monastery.contactEmail}
                    </a>
                  </div>
                </div>
              )}
              
              {monastery.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Website</h4>
                    <a 
                      href={monastery.website.startsWith('http') ? monastery.website : `https://${monastery.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {monastery.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Localizare pe hartă */}
          {(monastery.latitude && monastery.longitude) && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Localizare</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    style={{border:0}} 
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBNLrJhOMz6idD05pzwk17SQfbi8HCWmpI&q=${monastery.latitude},${monastery.longitude}`} 
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-3">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${monastery.latitude},${monastery.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    Vezi pe Google Maps
                  </a>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Caracteristici speciale */}
          {monastery.specialFeatures && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Caracteristici speciale</h3>
                <p className="text-sm">{monastery.specialFeatures}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Link către pelerinaje asociate */}
          <Button variant="outline" className="w-full" asChild>
            <Link to={`/pilgrimages?region=${monastery.region}`}>
              <Landmark className="mr-2 h-4 w-4" />
              Vezi pelerinaje în {formatRegionName(monastery.region)}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}