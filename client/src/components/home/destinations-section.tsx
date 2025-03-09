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
  // Starea pentru bannere și secțiunea de destinații fixe
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Încărcarea bannerelor
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await apiRequest("GET", "/api/cms/banners");
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        console.error("Eroare la încărcarea bannerelor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
    
    // Polling pentru actualizarea bannerelor la fiecare 5 secunde
    const intervalId = setInterval(fetchBanners, 5000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  // Bannere prestabilite pentru afișare în cazul în care nu există bannere configurate
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

  // Determinăm ce conținut să afișăm (bannere dinamice sau destinații fixe)
  const showBanners = banners.length > 0;

  return (
    <section className="py-12 md:py-16 bg-spirituality-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-12">Destinații Spirituale</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Afișăm bannere dinamice dacă există în CMS */}
          {showBanners ? (
            banners.map(banner => (
              <div key={banner.id} className="relative rounded-lg overflow-hidden group shadow-md h-64">
                <img
                  src={banner.value}
                  alt={banner.title || `Banner ${banner.id}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white text-xl font-bold mb-1">
                    {/* Titlul din CMS sau unul predefinit */}
                    {banner.title || banner.key.replace('homepage_banner_', 'Banner ')}
                  </h3>
                  <p className="text-white text-sm mb-3">{banner.subtitle || ''}</p>
                  <a href={banner.linkUrl || '/pilgrimages'} className="text-white flex items-center text-sm">
                    Explorează
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            ))
          ) : (
            // Afișăm destinațiile fixe dacă nu există bannere dinamice
            fixedDestinations.map(destination => (
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
