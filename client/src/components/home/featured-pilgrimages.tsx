import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Pilgrimage } from "@shared/schema";
import PilgrimageCard from "@/components/pilgrimages/pilgrimage-card";
import { Loader2 } from "lucide-react";

interface FeaturedPilgrimagesProps {
  pilgrimages: Pilgrimage[];
}

export default function FeaturedPilgrimages({ pilgrimages }: FeaturedPilgrimagesProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900">Pelerinaje Populare</h2>
          <Link href="/pilgrimages" className="hidden md:inline-flex items-center text-primary hover:text-primary-dark font-medium">
            Vezi toate pelerinajele
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        {pilgrimages.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pilgrimages.map((pilgrimage) => (
              <PilgrimageCard key={pilgrimage.id} pilgrimage={pilgrimage} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Button variant="link" asChild>
            <Link href="/pilgrimages" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
              Vezi toate pelerinajele
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
