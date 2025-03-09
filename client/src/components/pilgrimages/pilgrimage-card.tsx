import { Pilgrimage } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Clock, User } from "lucide-react";

interface PilgrimageCardProps {
  pilgrimage: Pilgrimage;
}

export default function PilgrimageCard({ pilgrimage }: PilgrimageCardProps) {
  const startDate = new Date(pilgrimage.startDate);
  const formattedDate = formatDistanceToNow(startDate, { addSuffix: true, locale: ro });
  
  return (
    <Card className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 md:h-56">
        <img 
          src={pilgrimage.images && pilgrimage.images.length > 0 ? pilgrimage.images[0] : 'https://images.unsplash.com/photo-1577128777568-a159e463dde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'} 
          alt={pilgrimage.title} 
          className="w-full h-full object-cover" 
        />
        {pilgrimage.featured && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm font-bold py-1 px-3 rounded">
            Popular
          </div>
        )}
      </div>
      
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center text-neutral-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{pilgrimage.location}</span>
          <span className="mx-2">•</span>
          <Calendar className="w-4 h-4 mr-1" />
          <span>{pilgrimage.month}</span>
        </div>
        
        <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-2">{pilgrimage.title}</h3>
        
        <div className="flex items-center mb-3 text-sm">
          <User className="w-4 h-4 text-primary mr-1" />
          <span className="text-neutral-700">Ghid: {pilgrimage.guide}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {pilgrimage.saint && (
            <Badge variant="outline" className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {pilgrimage.saint}
            </Badge>
          )}
          <Badge variant="outline" className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {pilgrimage.transportation}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
            <Clock className="h-3 w-3 mr-1" />
            {pilgrimage.duration} zile
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-neutral-500">de la</span>
            <span className="text-xl font-bold text-primary ml-1">{pilgrimage.price}</span>
            <span className="text-sm text-neutral-500">/{pilgrimage.currency}</span>
          </div>
          
          <Link href={`/pilgrimages/${pilgrimage.id}`}>
            <a className="bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 px-4 rounded transition duration-300">
              Detalii
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
