import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Component pentru cardul unui pelerinaj promovat
const PromotedPilgrimageCard = ({ pilgrimage }: { pilgrimage: Pilgrimage }) => {
  // Verifică dacă URL-ul imaginii este o cale relativă și adaugă prefixul dacă este necesar
  const thumbnailImage = pilgrimage.images && pilgrimage.images.length > 0 
    ? pilgrimage.images[0] 
    : "/assets/placeholder-pilgrimage.jpg";
    
  const fullImageUrl = thumbnailImage.startsWith('http') || thumbnailImage.startsWith('/') 
    ? thumbnailImage 
    : `/${thumbnailImage}`;
    
  return (
    <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
      <img
        src={fullImageUrl}
        alt={pilgrimage.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-semibold">
        PROMOVAT
      </div>
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-white text-xl font-bold mb-2">{pilgrimage.title}</h3>
        <p className="text-white opacity-90 mb-3 text-sm">
          {pilgrimage.location} • {formatCurrency(pilgrimage.price, pilgrimage.currency)}
        </p>
        <Link href={`/pilgrimages/${pilgrimage.id}`} className="text-white flex items-center text-sm">
          Detalii
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default function PromotedPilgrimagesSection() {
  // Obținem pelerinajele promovate din API
  const { data: pilgrimages = [], isLoading } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages', 'promoted'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/pilgrimages/promoted");
        return await response.json();
      } catch (error) {
        console.error("Eroare la încărcarea pelerinajelor promovate:", error);
        return [];
      }
    }
  });

  // Nu afișăm nimic dacă nu există pelerinaje promovate
  if (pilgrimages.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <section className="py-12 md:py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-4">
          Pelerinaje Promovate
        </h2>
        <p className="text-center text-neutral-600 mb-12 max-w-2xl mx-auto">
          Descoperă cele mai populare destinații spirituale recomandate de noi
        </p>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {pilgrimages.map(pilgrimage => (
              <PromotedPilgrimageCard 
                key={pilgrimage.id} 
                pilgrimage={pilgrimage} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}