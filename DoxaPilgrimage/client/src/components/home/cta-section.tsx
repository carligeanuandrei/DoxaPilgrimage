import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gray-100 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-900 mb-4">Planifică-ți Călătoria Spirituală</h2>
          <p className="text-neutral-700 text-lg mb-8 max-w-3xl mx-auto">
            Fie că ești un pelegrin individual sau un organizator de pelerinaje, Doxa te ajută să găsești sau să oferi experiențe spirituale autentice.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded transition duration-300">
              <Link href="/pilgrimages">
                Descoperă Pelerinaje
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white hover:bg-neutral-100 text-primary border border-primary font-medium px-6 py-3 rounded transition duration-300">
              <Link href="/auth?tab=register&role=operator">
                Devino Organizator
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
