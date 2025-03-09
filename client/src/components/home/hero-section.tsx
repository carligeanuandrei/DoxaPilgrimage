import SearchBox from "@/components/home/search-box";

export default function HeroSection() {
  return (
    <section className="relative bg-primary h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
      
      {/* Hero background image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="https://images.unsplash.com/photo-1577128777568-a159e463dde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
          alt="Mănăstire în munți" 
          className="w-full h-full object-cover" 
        />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-white font-heading text-4xl md:text-5xl lg:text-6xl font-bold max-w-2xl">
          Descoperă Călătoria Ta Spirituală
        </h1>
        <p className="text-white mt-4 text-lg md:text-xl max-w-xl">
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
