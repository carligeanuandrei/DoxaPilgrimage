import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, MapPin, Church, Calendar, Heart } from "lucide-react";
import { Link } from "wouter";
import { getUpcomingFeasts, OrthodoxFeast } from '@shared/orthodox-calendar';

// Tipul pentru datele de mănăstire
type Monastery = {
  id: number;
  name: string;
  slug: string;
  region: string;
  city?: string;
  county?: string;
  patronSaint?: string;
  patronSaintDate?: string;
  images: string[];
  description: string;
  shortDescription?: string;
};

/**
 * Componentă pentru afișarea recomandărilor zilnice de mănăstiri pentru rugăciune
 */
export default function MonasteryDailyRecommendations() {
  // Data curentă și sărbătoarea zilei (dacă există)
  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayFormatted);
  
  // Obținem sărbătorile zilei
  const feasts = getUpcomingFeasts(today, 1);
  const todayFeast = feasts.length > 0 ? feasts[0] : null;
  
  // Query pentru recomandările bazate pe ziua curentă
  const { data: feastRecommendations, isLoading: isLoadingFeastRecs } = useQuery({
    queryKey: ['/api/monasteries/recommendations/feasts', { date: selectedDate }],
    queryFn: async () => {
      const response = await fetch(`/api/monasteries/recommendations/feasts?date=${selectedDate}&limit=3`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor de mănăstiri pentru sărbătoare');
      }
      return response.json();
    }
  });
  
  // Query pentru recomandările aleatorii pentru rugăciune
  const { data: randomRecommendations, isLoading: isLoadingRandomRecs, refetch: refetchRandom } = useQuery({
    queryKey: ['/api/monasteries/recommendations', { type: 'hidden_gems' }],
    queryFn: async () => {
      const response = await fetch(`/api/monasteries/recommendations?type=hidden_gems&limit=2`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea recomandărilor de mănăstiri aleatorii');
      }
      return response.json();
    }
  });
  
  // Formatarea datei pentru afișare
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Obține path-ul pentru imaginea unei mănăstiri
  const getMonasteryImage = (monastery: Monastery) => {
    if (monastery.images && monastery.images.length > 0) {
      return `/static/${monastery.images[0]}`;
    }
    return '/static/images/default-monastery.jpg';
  };
  
  const isToday = (dateString: string) => {
    return dateString === todayFormatted;
  };
  
  // Randarea unei cărți pentru o mănăstire recomandată
  const renderMonasteryCard = (monastery: Monastery, reason?: string) => (
    <div key={monastery.id} className="border-b pb-3 last:border-b-0 last:pb-0 mb-3">
      <div className="flex items-start">
        <div className="h-16 w-16 mr-3 rounded overflow-hidden flex-shrink-0">
          <img 
            src={getMonasteryImage(monastery)} 
            alt={monastery.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-md">{monastery.name}</h3>
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{monastery.city || ''}{monastery.county ? `, ${monastery.county}` : ''}</span>
          </div>
          {monastery.patronSaint && (
            <div className="flex items-center text-sm text-neutral-500 mb-2">
              <Church className="h-3 w-3 mr-1" />
              <span>{monastery.patronSaint}</span>
            </div>
          )}
          {reason && (
            <div className="text-xs italic text-neutral-600 mb-2">
              {reason}
            </div>
          )}
          <Link href={`/monasteries/${monastery.slug}`}>
            <a className="text-primary text-sm font-medium hover:underline">
              Vezi detalii
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
  
  // Secțiunea pentru recomandări bazate pe sărbătoarea zilei
  const renderFeastRecommendations = () => {
    if (isLoadingFeastRecs) {
      return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    }
    
    const recommendations = feastRecommendations?.recommendations || [];
    
    if (recommendations.length === 0) {
      return (
        <div className="text-center py-3 text-neutral-500">
          <p className="text-sm">Nu există mănăstiri recomandate pentru această zi.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {recommendations.map((monastery: Monastery) => renderMonasteryCard(
          monastery, 
          monastery.patronSaint ? 
            `Legătură cu sărbătoarea zilei: ${monastery.patronSaint}` : 
            "Recomandată pentru această sărbătoare"
        ))}
      </div>
    );
  };
  
  // Secțiunea pentru recomandări aleatorii pentru rugăciune
  const renderPrayerRecommendations = () => {
    if (isLoadingRandomRecs) {
      return <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    }
    
    const recommendations = randomRecommendations?.recommendations || [];
    
    if (recommendations.length === 0) {
      return (
        <div className="text-center py-3 text-neutral-500">
          <p className="text-sm">Nu există mănăstiri aleatorii recomandate pentru rugăciune astăzi.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {recommendations.map((monastery: Monastery) => renderMonasteryCard(
          monastery, 
          "Recomandare zilnică pentru rugăciune și meditație"
        ))}
        
        <div className="mt-3 text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchRandom()}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Reîmprospătează
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl font-bold text-primary">
            <Calendar className="h-5 w-5 mr-2" />
            Mănăstiri recomandate
          </CardTitle>
          <img 
            src="/images/orthodox-calendar/monastery-icon.svg" 
            alt="Monastery Recommendation" 
            className="h-12 w-12"
            onError={(e) => {
              e.currentTarget.src = "/images/orthodox-calendar/pilgrimage-icon.svg";
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Secțiunea pentru sărbătoarea zilei */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-1">
            <Church className="h-4 w-4" />
            Sărbătoarea zilei
          </h3>
          
          {todayFeast ? (
            <div className="mb-3 bg-blue-50 p-2 rounded-md">
              <p className="font-medium text-blue-800">{todayFeast.nameRo}</p>
              <p className="text-sm text-blue-600">{formatDate(todayFeast.date)}</p>
              {todayFeast.description && (
                <p className="text-xs text-neutral-700 mt-1">{todayFeast.description}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 mb-2">Nu există o sărbătoare importantă astăzi.</p>
          )}
          
          <h3 className="font-medium text-primary mb-2">Mănăstiri recomandate pentru sărbătoare:</h3>
          {renderFeastRecommendations()}
        </div>
        
        {/* Separator */}
        <div className="my-4 border-t border-neutral-200"></div>
        
        {/* Secțiunea pentru recomandări de rugăciune */}
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-1 mb-2">
            <Heart className="h-4 w-4" />
            Recomandări pentru rugăciune
          </h3>
          
          <p className="text-sm text-neutral-600 mb-3">
            Mănăstiri recomandate pentru vizite de rugăciune și meditație spirituală, 
            selectate aleatoriu în fiecare zi.
          </p>
          
          {renderPrayerRecommendations()}
        </div>
        
        <div className="text-center mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/monasteries">
              Explorează toate mănăstirile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}