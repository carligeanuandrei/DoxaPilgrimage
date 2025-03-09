export default function DestinationsSection() {
  return (
    <section className="py-12 md:py-16 bg-spirituality-light">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-12">Destinații Spirituale</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Terra Sfântă */}
          <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
            <img 
              src="/images/demo/placeholder-4.svg" 
              alt="Terra Sfântă" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-white text-xl font-bold mb-1">Terra Sfântă</h3>
              <p className="text-white text-sm mb-3">Israel, Palestina, Iordania</p>
              <a href="/pilgrimages?location=Israel" className="text-white flex items-center text-sm">
                Explorează
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Grecia Ortodoxă */}
          <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
            <img 
              src="/images/demo/placeholder-3.svg" 
              alt="Grecia Ortodoxă" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-white text-xl font-bold mb-1">Grecia Ortodoxă</h3>
              <p className="text-white text-sm mb-3">Muntele Athos, Meteora, Corfu</p>
              <a href="/pilgrimages?location=Grecia" className="text-white flex items-center text-sm">
                Explorează
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* România Creștină */}
          <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
            <img 
              src="/images/demo/placeholder-2.svg" 
              alt="România Creștină" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-white text-xl font-bold mb-1">România Creștină</h3>
              <p className="text-white text-sm mb-3">Moldova, Maramureș, Transilvania</p>
              <a href="/pilgrimages?location=România" className="text-white flex items-center text-sm">
                Explorează
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Italia Catolică */}
          <div className="relative rounded-lg overflow-hidden group shadow-md h-64">
            <img 
              src="/images/demo/placeholder-5.svg" 
              alt="Italia Catolică" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-80"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-white text-xl font-bold mb-1">Italia Catolică</h3>
              <p className="text-white text-sm mb-3">Vatican, Roma, Assisi, Padova</p>
              <a href="/pilgrimages?location=Vatican" className="text-white flex items-center text-sm">
                Explorează
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
