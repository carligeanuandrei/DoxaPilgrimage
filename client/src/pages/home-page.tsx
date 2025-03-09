import HeroSection from "@/components/home/hero-section";
import SearchBox from "@/components/home/search-box";
import FeaturedPilgrimages from "@/components/home/featured-pilgrimages";
import DestinationsSection from "@/components/home/destinations-section";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  // Obținem pelerinajele promovate (featured)
  const { data: featuredPilgrimages = [] } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages', 'featured'],
    select: (pilgrimages) => pilgrimages.filter(p => p.featured).slice(0, 3)
  });

  return (
    <div>
      <HeroSection />
      
      {featuredPilgrimages.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="bg-amber-50 py-2">
            <FeaturedPilgrimages pilgrimages={featuredPilgrimages} />
          </div>
          <Separator className="my-4" />
        </>
      )}
      
      <DestinationsSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}
