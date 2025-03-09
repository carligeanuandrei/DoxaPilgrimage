import HeroSection from "@/components/home/hero-section";
import SearchBox from "@/components/home/search-box";
import FeaturedPilgrimages from "@/components/home/featured-pilgrimages";
import DestinationsSection from "@/components/home/destinations-section";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import CTASection from "@/components/home/cta-section";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage } from "@shared/schema";

export default function HomePage() {
  const { data: pilgrimages = [] } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages'],
    select: (pilgrimages) => pilgrimages.filter(p => p.featured).slice(0, 3)
  });

  return (
    <div>
      <HeroSection />
      <FeaturedPilgrimages pilgrimages={pilgrimages} />
      <DestinationsSection />
      <HowItWorks />
      <Testimonials />
      <CTASection />
    </div>
  );
}
