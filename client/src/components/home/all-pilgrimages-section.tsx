import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, MapPinIcon, ChevronRightIcon, UsersIcon } from 'lucide-react';
import { Link } from 'wouter';

export const AllPilgrimagesSection: React.FC = () => {
  const { data: pilgrimages, isLoading, error } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages'],
    staleTime: 1000 * 60 * 5, // 5 minute cache
  });

  // Limităm la 6 pelerinaje
  const displayPilgrimages = pilgrimages?.slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Toate pelerinajele disponibile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-6 bg-muted animate-pulse rounded my-2" />
                  <div className="h-4 bg-muted animate-pulse rounded my-2 w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded my-2 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !displayPilgrimages || displayPilgrimages.length === 0) {
    return null; // Nu afișăm secțiunea dacă nu există pelerinaje
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
        <h2 className="text-3xl font-bold text-center mb-3">Toate pelerinajele disponibile</h2>
        <p className="text-center text-muted-foreground mb-10">
          Descoperă toate destinațiile spirituale și alege călătoria perfectă pentru tine
        </p>
        
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

export default AllPilgrimagesSection;