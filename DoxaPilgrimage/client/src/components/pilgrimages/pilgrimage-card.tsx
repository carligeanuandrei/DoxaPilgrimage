import { Pilgrimage } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, User, DollarSign, Info, Activity } from "lucide-react";

interface PilgrimageCardProps {
  pilgrimage: Pilgrimage;
  viewType?: 'grid' | 'list';
}

export default function PilgrimageCard({ pilgrimage, viewType = 'grid' }: PilgrimageCardProps) {
  // Verificăm dacă pelerinajul este promovat pentru a aplica stiluri speciale
  const isPromoted = pilgrimage.featured === true;
  const startDate = new Date(pilgrimage.startDate);
  const endDate = new Date(pilgrimage.endDate);
  const formattedDate = formatDistanceToNow(startDate, { addSuffix: true, locale: ro });
  
  // Funcție pentru a obține culoarea badge-ului de status
  const getStatusBadgeClass = () => {
    switch(pilgrimage.status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'unpublished': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  
  // Funcție pentru a obține textul statusului tradus în română
  const getStatusText = () => {
    switch(pilgrimage.status) {
      case 'published': return 'Publicat';
      case 'draft': return 'Ciornă';
      case 'unpublished': return 'Nepublicat';
      case 'cancelled': return 'Anulat';
      default: return 'Ciornă';
    }
  };
  
  // Generate a pilgrimage-specific image based on location
  const getPilgrimageImage = () => {
    if (pilgrimage.images && pilgrimage.images.length > 0) {
      return pilgrimage.images[0];
    }
    
    if (pilgrimage.location.toLowerCase().includes('putna')) {
      return '/images/demo/card-1.svg';
    }
    
    if (pilgrimage.location.toLowerCase().includes('athos')) {
      return '/images/demo/card-2.svg';
    }
    
    // Use one of the 5 demo card images based on pilgrimage ID
    return `/images/demo/card-${(pilgrimage.id % 5) + 1}.svg`;
  };
  
  // Pentru formatul de listă
  if (viewType === 'list') {
    return (
      <Card className={`rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-md ${isPromoted ? 'bg-amber-50 border-amber-200 border-2' : 'bg-card'}`}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-1/4 max-w-[300px]">
            <img 
              src={getPilgrimageImage()} 
              alt={pilgrimage.title} 
              className="w-full h-full object-cover"
              style={{ maxHeight: '200px' }}
            />
            {isPromoted && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold py-1 px-2 rounded shadow-sm">
                Promovat
              </div>
            )}
          </div>
          
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2">{pilgrimage.title}</h3>
            
            <div className="flex flex-wrap gap-y-2 mb-3">
              <div className="flex items-center w-full sm:w-1/2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1 text-primary" />
                <span>{pilgrimage.location}</span>
              </div>
              
              <div className="flex items-center w-full sm:w-1/2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1 text-primary" />
                <span>
                  {format(startDate, 'dd MMMM', { locale: ro })} - {format(endDate, 'dd MMMM yyyy', { locale: ro })}
                </span>
              </div>
              
              <div className="flex items-center w-full sm:w-1/2 text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-1 text-primary" />
                <span>Ghid: {pilgrimage.guide}</span>
              </div>
              
              <div className="flex items-center w-full sm:w-1/2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1 text-primary" />
                <span>{pilgrimage.duration} zile</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={getStatusBadgeClass()}>
                <Activity className="h-3 w-3 mr-1" />
                {getStatusText()}
              </Badge>
              
              {pilgrimage.saint && (
                <Badge variant="outline" className="bg-background">
                  <div className="w-3 h-3 mr-1">
                    <img src="/images/orthodox-calendar/saint-icon.svg" alt="Saint" className="w-full h-full object-contain" />
                  </div>
                  {pilgrimage.saint}
                </Badge>
              )}
              <Badge variant="outline" className="bg-background">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {pilgrimage.transportation}
              </Badge>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {pilgrimage.description?.substring(0, 150)}...
            </p>
            
            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-sm text-muted-foreground">de la</span>
                <span className="text-xl font-bold text-primary ml-1">{pilgrimage.price} {pilgrimage.currency}</span>
              </div>
              
              <Button asChild>
                <Link href={`/pilgrimages/${pilgrimage.id}`}>
                  <Info className="mr-2 h-4 w-4" /> Detalii
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
  
  // Pentru formatul de grid (implicit)
  return (
    <Card className={`rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${isPromoted ? 'bg-amber-50 border-amber-200 border-2' : 'bg-card'}`}>
      <div className="relative h-48 md:h-56">
        <img 
          src={getPilgrimageImage()} 
          alt={pilgrimage.title} 
          className="w-full h-full object-cover" 
        />
        {isPromoted && (
          <div className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-bold py-1 px-3 rounded shadow-sm">
            Promovat
          </div>
        )}
      </div>
      
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          <span>{pilgrimage.location}</span>
          <span className="mx-2">•</span>
          <Calendar className="w-4 h-4 mr-1 text-primary" />
          <span>{pilgrimage.month}</span>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{pilgrimage.title}</h3>
        
        <div className="flex items-center mb-3 text-sm">
          <User className="w-4 h-4 text-primary mr-1" />
          <span className="text-muted-foreground">Ghid: {pilgrimage.guide}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getStatusBadgeClass()}>
            <Activity className="h-3 w-3 mr-1" />
            {getStatusText()}
          </Badge>
        
          {pilgrimage.saint && (
            <Badge variant="outline" className="bg-background">
              <div className="w-3 h-3 mr-1">
                <img src="/images/orthodox-calendar/saint-icon.svg" alt="Saint" className="w-full h-full object-contain" />
              </div>
              {pilgrimage.saint}
            </Badge>
          )}
          <Badge variant="outline" className="bg-background">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {pilgrimage.transportation}
          </Badge>
          <Badge variant="outline" className="bg-background">
            <Clock className="h-3 w-3 mr-1" />
            {pilgrimage.duration} zile
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">de la</span>
            <span className="text-xl font-bold text-primary ml-1">{pilgrimage.price}</span>
            <span className="text-sm text-muted-foreground">/{pilgrimage.currency}</span>
          </div>
          
          <Button asChild>
            <Link href={`/pilgrimages/${pilgrimage.id}`}>
              Detalii
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
