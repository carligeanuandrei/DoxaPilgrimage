import { useQuery } from "@tanstack/react-query";
import { Pilgrimage, Review } from "@shared/schema";
import { useParams } from "wouter";
import { Loader2, Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BookingForm from "@/components/pilgrimages/booking-form";
import ReviewsSection from "@/components/pilgrimages/reviews-section";
import { useState } from "react";

export default function PilgrimageDetailsPage() {
  const { id } = useParams();
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  const { data: pilgrimage, isLoading: pilgrimageLoading, error: pilgrimageError } = useQuery<Pilgrimage>({
    queryKey: [`/api/pilgrimages/${id}`],
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/pilgrimages/${id}/reviews`],
    enabled: !!id,
  });

  if (pilgrimageLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pilgrimageError || !pilgrimage) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Pelerinajul nu a fost găsit</h1>
        <p className="mt-2 text-gray-600">Acest pelerinaj nu există sau a fost șters.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>Înapoi</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-primary">Acasă</a>
        <ChevronRight className="h-4 w-4 mx-1" />
        <a href="/pilgrimages" className="hover:text-primary">Pelerinaje</a>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-700">{pilgrimage.title}</span>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image gallery */}
          <div className="rounded-lg overflow-hidden mb-6">
            {pilgrimage.images && pilgrimage.images.length > 0 ? (
              <img 
                src={pilgrimage.images[0]} 
                alt={pilgrimage.title} 
                className="w-full h-[400px] object-cover"
              />
            ) : (
              <img
                src={`/images/demo/placeholder-${(pilgrimage.id % 5) + 1}.svg`}
                alt={pilgrimage.title}
                className="w-full h-[400px] object-cover"
              />
            )}
          </div>
          
          {/* Title and basic info */}
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-4">{pilgrimage.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-1 text-primary" />
              <span>{pilgrimage.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-1 text-primary" />
              <span>{pilgrimage.month}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-1 text-primary" />
              <span>{pilgrimage.duration} zile</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-1 text-primary" />
              <span>{pilgrimage.availableSpots} locuri disponibile</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {pilgrimage.saint && (
              <span className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
                <i className="fas fa-church mr-1"></i> {pilgrimage.saint}
              </span>
            )}
            <span className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
              <i className="fas fa-plane mr-1"></i> {pilgrimage.transportation}
            </span>
            <span className="bg-gray-100 text-primary-dark text-xs px-2 py-1 rounded-md">
              <i className="fas fa-user-tie mr-1"></i> {pilgrimage.guide}
            </span>
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Descriere</h2>
            <p className="text-gray-700 whitespace-pre-line">{pilgrimage.description}</p>
          </div>
          
          {/* Services included */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Servicii incluse</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pilgrimage.includedServices && pilgrimage.includedServices.map((service, index) => (
                <li key={index} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{service}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <Separator className="my-8" />
          
          {/* Reviews */}
          <ReviewsSection pilgrimageId={pilgrimage.id} reviews={reviews} isLoading={reviewsLoading} />
        </div>
        
        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="mb-4">
              <span className="text-gray-500 text-sm">Preț începând de la</span>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-primary">{pilgrimage.price}</span>
                <span className="text-gray-500 ml-1">{pilgrimage.currency}/persoană</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Data de plecare:</span>
                <span className="font-medium">{new Date(pilgrimage.startDate).toLocaleDateString('ro-RO')}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Data de întoarcere:</span>
                <span className="font-medium">{new Date(pilgrimage.endDate).toLocaleDateString('ro-RO')}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Ghid:</span>
                <span className="font-medium">{pilgrimage.guide}</span>
              </div>
            </div>
            
            {!showBookingForm ? (
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => setShowBookingForm(true)}
                disabled={pilgrimage.availableSpots === 0}
              >
                {pilgrimage.availableSpots > 0 ? "Rezervă acum" : "Nu mai sunt locuri disponibile"}
              </Button>
            ) : (
              <BookingForm pilgrimage={pilgrimage} onCancel={() => setShowBookingForm(false)} />
            )}
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Pentru întrebări sau asistență, contactați-ne:</p>
              <p className="font-medium mt-1">contact@doxa-pelerinaje.ro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
