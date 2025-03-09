import { useState, useEffect } from "react";
import { DirectCmsImage } from "@/components/shared/direct-cms";
import { apiRequest } from "@/lib/queryClient";

// Tipul pentru bannere
interface Banner {
  id: number;
  key: string;
  value: string;
  contentType: string;
}

// Componenta pentru afișarea unui banner
const BannerCard = ({ imageUrl, title, subtitle, linkUrl }: { 
  imageUrl: string; 
  title: string; 
  subtitle: string; 
  linkUrl: string; 
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 p-6">
        <h3 className="text-white text-xl font-bold mb-1">{title}</h3>
        <p className="text-white text-sm mb-3">{subtitle}</p>
        <a href={linkUrl} className="text-white flex items-center text-sm">
          Explorează
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default function DestinationsSection() {
  // Destinațiile fixe - mereu afișate pentru cele 4 țări principale
  const fixedDestinations = [
    {
      key: "israel",
      imageKey: "destination_image_israel",
      title: "Terra Sfântă",
      subtitle: "Israel, Palestina, Iordania",
      linkUrl: "/pilgrimages?location=Israel"
    },
    {
      key: "greece",
      imageKey: "destination_image_greece",
      title: "Grecia Ortodoxă",
      subtitle: "Muntele Athos, Meteora, Corfu",
      linkUrl: "/pilgrimages?location=Grecia"
    },
    {
      key: "romania",
      imageKey: "destination_image_romania",
      title: "România Creștină",
      subtitle: "Moldova, Maramureș, Transilvania",
      linkUrl: "/pilgrimages?location=România"
    },
    {
      key: "italy",
      imageKey: "destination_image_italy",
      title: "Italia Catolică",
      subtitle: "Vatican, Roma, Assisi, Padova",
      linkUrl: "/pilgrimages?location=Vatican"
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-spirituality-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-12">Destinații Spirituale</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Afișăm destinațiile fixe - cele 4 țări principale */}
          {fixedDestinations.map(destination => (
            <div key={destination.key} className="relative rounded-lg overflow-hidden group shadow-md h-64">
              <DirectCmsImage 
                contentKey={destination.imageKey}
                fallbackSrc={`/images/demo/destination-card-${destination.key}.svg`}
                alt={destination.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-white text-xl font-bold mb-1">{destination.title}</h3>
                <p className="text-white text-sm mb-3">{destination.subtitle}</p>
                <a href={destination.linkUrl} className="text-white flex items-center text-sm">
                  Explorează
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
