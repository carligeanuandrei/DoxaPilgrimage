import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pilgrimage } from '@shared/schema';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { CalendarDays, Clock, MapPin, Tag, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PilgrimagesRendererProps {
  isEditing: boolean;
  showPromoted: boolean;
  limit?: number;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
  cardClassName?: string;
}

export default function PilgrimagesRenderer({
  isEditing,
  showPromoted = false,
  limit = 6,
  backgroundColor,
  textColor,
  className = '',
  cardClassName = '',
}: PilgrimagesRendererProps) {
  const { data: pilgrimages, isLoading } = useQuery<Pilgrimage[]>({
    queryKey: [showPromoted ? '/api/pilgrimages/promoted' : '/api/pilgrimages'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Limiting the number of pilgrimages to show
  const limitedPilgrimages = pilgrimages?.slice(0, limit);
  
  const containerStyle = {
    backgroundColor: backgroundColor || 'transparent',
    color: textColor || 'inherit',
  };

  if (isLoading) {
    return (
      <div className={`grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 ${className}`} style={containerStyle}>
        {[...Array(limit)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative h-48 bg-muted">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!pilgrimages?.length && isEditing) {
    return (
      <div className="p-6 bg-muted/30 rounded-lg text-center">
        <p className="text-muted-foreground">
          {showPromoted 
            ? "Nu există pelerinaje promovate disponibile. Promovează pelerinaje din panoul de administrare."
            : "Nu există pelerinaje disponibile."}
        </p>
      </div>
    );
  }

  if (!limitedPilgrimages?.length) {
    return null;
  }

  return (
    <div 
      className={`grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      style={containerStyle}
    >
      {limitedPilgrimages.map((pilgrimage) => (
        <Card 
          key={pilgrimage.id} 
          className={`overflow-hidden transition-all relative ${
            pilgrimage.featured ? 'ring-2 ring-yellow-400' : ''
          } ${cardClassName}`}
        >
          {pilgrimage.promoted && (
            <Badge 
              className="absolute top-2 right-2 z-10 bg-yellow-500 hover:bg-yellow-600"
            >
              Promovat
            </Badge>
          )}
          
          {pilgrimage.featured && (
            <Badge 
              variant="outline" 
              className="absolute top-2 left-2 z-10 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
            >
              Recomandat
            </Badge>
          )}
          
          <div className="relative h-48 bg-muted">
            {pilgrimage.images && pilgrimage.images.length > 0 ? (
              <img 
                src={pilgrimage.images[0]} 
                alt={pilgrimage.title} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                <p className="text-muted-foreground">Fără imagine</p>
              </div>
            )}
          </div>
          
          <CardHeader>
            <CardTitle className="line-clamp-2">{pilgrimage.title}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin size={16} className="mr-1" />
              {pilgrimage.location}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {pilgrimage.description}
            </p>
            
            <div className="flex flex-wrap gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center w-1/2">
                <CalendarDays size={16} className="mr-1" />
                {format(new Date(pilgrimage.startDate), 'dd.MM.yyyy')}
              </div>
              
              <div className="flex items-center w-1/2">
                <Clock size={16} className="mr-1" />
                {pilgrimage.duration} zile
              </div>
              
              <div className="flex items-center w-1/2">
                <Tag size={16} className="mr-1" />
                {formatCurrency(pilgrimage.price, pilgrimage.currency)}
              </div>
              
              {pilgrimage.guide && (
                <div className="flex items-center w-1/2">
                  <User size={16} className="mr-1" />
                  {pilgrimage.guide}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Link href={`/pilgrimages/${pilgrimage.id}`}>
              <Button className="w-full">Vezi detalii</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}