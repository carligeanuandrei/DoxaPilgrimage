import { Calendar, Church } from "lucide-react";
import CalendarDisplay from "@/components/orthodox-calendar/calendar-display";
import UpcomingFeasts from "@/components/orthodox-calendar/upcoming-feasts";
import FastingPeriods from "@/components/orthodox-calendar/fasting-periods";
import PilgrimageRecommendations from "@/components/orthodox-calendar/pilgrimage-recommendations";

export default function OrthodoxCalendarPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary flex items-center">
            <Church className="h-8 w-8 mr-3" />
            Calendar Ortodox
          </h1>
          <p className="text-neutral-600 mt-2">
            Sărbători, zile de post și recomandări de pelerinaje pentru anul 2025
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarDisplay />
          
          <div className="mt-6">
            <FastingPeriods />
          </div>
        </div>
        
        <div className="space-y-6">
          <UpcomingFeasts count={5} />
          <PilgrimageRecommendations />
        </div>
      </div>
      
      <div className="mt-10 bg-neutral-50 rounded-lg p-6">
        <h2 className="text-2xl font-heading font-bold text-primary mb-4">
          Despre Calendarul Ortodox
        </h2>
        <div className="prose max-w-none">
          <p>
            Calendarul ortodox este o componentă esențială a vieții spirituale pentru credincioșii ortodocși, ghidând rugăciunea, 
            postul și participarea la slujbele religioase de-a lungul anului. Acesta include sărbătorile importante dedicate 
            Mântuitorului, Maicii Domnului și sfinților, precum și perioadele de post și pregătire spirituală.
          </p>
          <p>
            În România și în alte țări cu tradiție ortodoxă, calendarul bisericesc este un reper important pentru organizarea 
            pelerinajelor la locuri sfinte, mănăstiri și biserici cu o semnificație deosebită pentru anumite sărbători.
          </p>
          <p>
            Pentru fiecare sărbătoare majoră, Doxa vă recomandă pelerinaje relevante, permițându-vă să trăiți experiența 
            spirituală a sărbătorii în locuri cu semnificație specială pentru aceasta.
          </p>
        </div>
      </div>
    </div>
  );
}