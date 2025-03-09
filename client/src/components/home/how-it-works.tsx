export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 text-center mb-12">Cum Funcționează Doxa</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="w-20 h-20 mb-4">
              <img 
                src="/images/home/calendar-icon.svg" 
                alt="Calendarul Ortodox" 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Descoperă</h3>
            <p className="text-neutral-600">Găsește pelerinaje autentice verificate de echipa noastră, filtrează după destinație, sfinți, lună sau tip de transport.</p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="w-20 h-20 mb-4">
              <img 
                src="/images/home/pilgrimage-icon.svg" 
                alt="Planificare Pelerinaj" 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Rezervă</h3>
            <p className="text-neutral-600">Completează formularul de înscriere și efectuează plata în siguranță prin metodele noastre securizate.</p>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-sm">
            <div className="w-20 h-20 mb-4">
              <img 
                src="/images/home/guides-icon.svg" 
                alt="Ghizi Spirituali" 
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">Trăiește</h3>
            <p className="text-neutral-600">Experimentează călătoria spirituală alături de ghizi profesioniști și un grup de pelerini cu aceleași aspirații.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
