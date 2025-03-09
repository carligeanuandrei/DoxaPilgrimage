import SearchBox from "@/components/home/search-box";

export default function HeroSection() {
  return (
    <section className="relative bg-primary h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-primary/70"></div>
      
      {/* Hero background image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/images/demo/hero-monastery.svg" 
          alt="Mănăstiri ortodoxe în peisaj montan" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-white font-heading text-4xl md:text-5xl lg:text-6xl font-bold max-w-2xl drop-shadow-md">
          Descoperă Călătoria Ta Spirituală
        </h1>
        <p className="text-white mt-4 text-lg md:text-xl max-w-xl drop-shadow-md">
          Conectăm pelerini cu ghizi și organizatori de încredere pentru experiențe spirituale autentice.
        </p>
        
        {/* Search box */}
        <div className="mt-8">
          <SearchBox />
        </div>
      </div>
    </section>
  );
}
