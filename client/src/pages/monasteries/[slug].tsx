import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Monastery } from "@shared/schema";
import { formatPatronSaintDate, formatRegionName } from "@/lib/format-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, ChevronLeft, Globe, Phone, Mail, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function MonasteryDetailsPage() {
  // Extragem slug-ul din URL
  const [match, params] = useRoute<{ slug: string }>("/monasteries/:slug");
  const slug = params?.slug;

  // Încărcăm datele mănăstirii
  const { isLoading, data: monastery } = useQuery<Monastery>({
    queryKey: [`/api/monasteries/${slug}`],
    enabled: !!slug
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
          <Link href="/monasteries">
            <a className="inline-flex items-center text-primary hover:underline">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Înapoi la lista de mănăstiri
            </a>
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

  return (
    <div className="container py-8 md:py-12">
      <Link href="/monasteries">
        <a className="inline-flex items-center text-primary hover:underline mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Înapoi la lista de mănăstiri
        </a>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coloana principală cu detalii */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge>{formatRegionName(monastery.region)}</Badge>
              <Badge variant="outline">{formattedType}</Badge>
              <Badge variant="secondary">{monastery.county}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{monastery.name}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{monastery.city}, {monastery.county}</span>
            </div>
          </div>

          {/* Galerie de imagini */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img 
              src={monastery.coverImage || (monastery.images && monastery.images.length > 0 ? monastery.images[0] : '/images/default-monastery.jpg')} 
              alt={monastery.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/default-monastery.jpg';
                e.currentTarget.onerror = null; // Previne recursia
              }}
            />
          </div>

          <Tabs defaultValue="description">
            <TabsList className="mb-4">
              <TabsTrigger value="description">Descriere</TabsTrigger>
              <TabsTrigger value="history">Istoric</TabsTrigger>
              <TabsTrigger value="relics">Moaște și Icoane</TabsTrigger>
              <TabsTrigger value="contact">Contact și Acces</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-6">
              <div>
                <p className="text-lg">{monastery.description}</p>
              </div>
              
              {monastery.specialFeatures && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Particularități</h3>
                  <p>{monastery.specialFeatures}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              {monastery.history ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Istoric</h3>
                  <p>{monastery.history}</p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Nu există informații istorice disponibile pentru această mănăstire.
                </div>
              )}
              
              {monastery.foundedYear && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Anul înființării</h3>
                  <p>{monastery.foundedYear}</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="relics" className="space-y-6">
              {/* Moaște */}
              {monastery.relics && monastery.relics.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Moaște și odoare</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {monastery.relics.map((relic, index) => (
                      <li key={index}>{relic}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Nu există informații despre moaște pentru această mănăstire.
                </div>
              )}
              
              {/* Icoane */}
              {monastery.iconDescriptions && monastery.iconDescriptions.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Icoane făcătoare de minuni</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monastery.iconDescriptions.map((icon, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {icon.image && (
                              <div className="w-24 h-24 flex-shrink-0">
                                <img 
                                  src={icon.image} 
                                  alt={icon.name} 
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold">{icon.name}</h4>
                              <p className="text-sm">{icon.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Adresă și acces</h3>
                <p className="mb-4">{monastery.address}</p>
                <p>{monastery.access}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monastery.contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{monastery.contactPhone}</span>
                  </div>
                )}
                
                {monastery.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{monastery.contactEmail}</span>
                  </div>
                )}
                
                {monastery.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={monastery.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {monastery.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar cu informații suplimentare */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Informații despre hram
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Hram:</span> {monastery.patronSaint}
                  </div>
                  {monastery.patronSaintDate && (
                    <div>
                      <span className="font-medium">Data:</span> {formatPatronSaintDate(monastery.patronSaintDate)}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  Informații generale
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Regiune:</span> {formatRegionName(monastery.region)}
                  </div>
                  <div>
                    <span className="font-medium">Localitate:</span> {monastery.city}, județul {monastery.county}
                  </div>
                  <div>
                    <span className="font-medium">Tip așezământ:</span> {formattedType}
                  </div>
                  {monastery.foundedYear && (
                    <div>
                      <span className="font-medium">Fondat în anul:</span> {monastery.foundedYear}
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Program
                </h3>
                
                <div className="text-sm text-muted-foreground">
                  Programul liturgic nu este disponibil la acest moment.
                  Vă rugăm contactați mănăstirea pentru informații actualizate.
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Galerie de imagini suplimentare */}
          {monastery.images && monastery.images.length > 1 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Galerie de imagini</h3>
              <div className="grid grid-cols-2 gap-2">
                {monastery.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden">
                    <img 
                      src={image} 
                      alt={`${monastery.name} - imagine ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}