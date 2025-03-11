import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, MapPinIcon, ChevronRightIcon, UsersIcon, Loader2 } from 'lucide-react';
import { Link } from 'wouter';

interface PilgrimagesRendererProps {
  title?: string;
  subtitle?: string;
  count?: number;
  featured?: boolean;
  showPromoted?: boolean;
}

export const PilgrimagesRenderer: React.FC<PilgrimagesRendererProps> = ({ 
  title = "Pelerinaje disponibile",
  subtitle = "Descoperă destinațiile spirituale și alege călătoria perfectă pentru tine",
  count = 6,
  featured = false,
  showPromoted = false
}) => {
  // Obținem pelerinajele din backend
  const { data: pilgrimages, isLoading, error } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages'],
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  // Filtrăm în funcție de opțiunile configurate
  const getFilteredPilgrimages = () => {
    if (!pilgrimages) return [];
    
    let filteredPilgrimages = [...pilgrimages];
    
    // Filtrăm pilgrimage-urile după featured dacă este cazul
    if (featured) {
      filteredPilgrimages = filteredPilgrimages.filter(p => p.featured);
    }
    
    // Filtrăm după promovat dacă este cazul
    if (showPromoted) {
      filteredPilgrimages = filteredPilgrimages.filter(p => p.promoted);
    }
    
    // Limităm la numărul specificat
    return filteredPilgrimages.slice(0, count);
  };

  const displayPilgrimages = getFilteredPilgrimages();

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">{title}</h2>
          <p className="text-center text-muted-foreground mb-10">{subtitle}</p>
          
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !displayPilgrimages || displayPilgrimages.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">{title}</h2>
          <p className="text-center text-muted-foreground mb-10">{subtitle}</p>
          
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="mb-4">Nu există pelerinaje disponibile care să corespundă criteriilor selectate.</p>
            <p>Încercați să modificați criteriile de filtrare sau să adăugați noi pelerinaje.</p>
          </div>
        </div>
      </section>
    );
  }

  // Formatează data pentru afișare
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">{title}</h2>
        <p className="text-center text-muted-foreground mb-10">{subtitle}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPilgrimages.map((pilgrimage: Pilgrimage) => (
            <Link key={pilgrimage.id} href={`/pilgrimages/${pilgrimage.id}`}>
              <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col border-2 ${pilgrimage.featured ? 'border-amber-400' : 'border-transparent'}`}>
                <div className="relative aspect-video bg-muted">
                  {pilgrimage.images && pilgrimage.images.length > 0 ? (
                    <img 
                      src={pilgrimage.images[0]} 
                      alt={pilgrimage.title} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-muted">
                      <span className="text-muted-foreground">Fără imagine</span>
                    </div>
                  )}
                  {pilgrimage.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 hover:bg-amber-600">Promovat</Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {pilgrimage.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      <span>{pilgrimage.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>
                        {formatDate(pilgrimage.startDate)} - {formatDate(pilgrimage.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UsersIcon className="w-4 h-4 mr-2" />
                      <span>{pilgrimage.availableSpots} locuri disponibile</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-muted">
                    <div className="font-bold text-lg">
                      {formatCurrency(pilgrimage.price, pilgrimage.currency)}
                    </div>
                    <div className="flex items-center text-primary hover:text-primary/80">
                      <span className="mr-1">Detalii</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link href="/pilgrimages">
            <Button className="px-8">Vezi toate pelerinajele</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PilgrimagesRenderer;