import { useState, useEffect } from "react";
import { DirectCmsImage, DirectCmsText } from "@/components/shared/direct-cms";
import { apiRequest } from "@/lib/queryClient";

// Tipul pentru bannere promoționale
interface PromoBanner {
  id: number;
  key: string;
  value: string;
  contentType: string;
  description?: string; // Folosit pentru titlul care va fi afișat pe banner
}

const PromoBannerCard = ({ 
  imageUrl, 
  title, 
  linkUrl = "/pilgrimages" 
}: { 
  imageUrl: string; 
  title?: string;
  linkUrl?: string; 
}) => {
  return (
    <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
      <img
        src={imageUrl}
        alt={title || "Banner promoțional"}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
      {title && (
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-white text-xl font-bold mb-3">{title}</h3>
          <a href={linkUrl} className="text-white flex items-center text-sm">
            Descoperă
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default function PromoBannersSection() {
  // Starea pentru bannere promoționale
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState<string>("Oferte și Evenimente Speciale");

  // Încărcarea bannerelor promoționale și a titlului secțiunii
  useEffect(() => {
    const fetchPromoBanners = async () => {
      try {
        // Obținem bannerele promoționale
        const response = await apiRequest("GET", "/api/cms");
        const data = await response.json();
        
        // Filtrăm bannerele promoționale (cele cu cheia promo_banner_X)
        const banners = data.filter((item: PromoBanner) => 
          item.contentType === 'image' && 
          item.key.startsWith('promo_banner_') && 
          !item.key.includes('section_title')
        );
        
        // Căutăm titlul secțiunii
        const titleItem = data.find((item: PromoBanner) => 
          item.key === 'promo_banner_section_title' && 
          item.contentType === 'text'
        );
        
        if (titleItem) {
          setSectionTitle(titleItem.value);
        }
        
        setPromoBanners(banners);
      } catch (error) {
        console.error("Eroare la încărcarea bannerelor promoționale:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoBanners();
    
    // Polling pentru actualizarea bannerelor la fiecare 5 secunde
    const intervalId = setInterval(fetchPromoBanners, 5000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  // Nu afișăm nimic dacă nu există bannere promoționale
  if (promoBanners.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-12">
          {sectionTitle}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {promoBanners.map(banner => (
            <PromoBannerCard 
              key={banner.id} 
              imageUrl={banner.value}
              title={banner.description || undefined}
              linkUrl="/pilgrimages"
            />
          ))}
        </div>
      </div>
    </section>
  );
}