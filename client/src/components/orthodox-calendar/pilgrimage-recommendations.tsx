import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { OrthodoxFeast, FastingPeriod, getUpcomingFeasts, recommendPilgrimages } from '@shared/orthodox-calendar';
import { Pilgrimage } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

export default function PilgrimageRecommendations() {
  // Get recommendations based on upcoming feast days
  const recommendedLocations = recommendPilgrimages(90); // Look ahead 90 days
  const upcomingFeasts = getUpcomingFeasts(new Date(), 3);
  
  // Fetch recommended pilgrimages
  const { data: pilgrimages = [], isLoading } = useQuery<Pilgrimage[]>({
    queryKey: ['/api/pilgrimages'],
    select: (data) => {
      // Filter pilgrimages based on recommended locations
      return data.filter(pilgrimage => 
        recommendedLocations.some(location => 
          pilgrimage.location.includes(location)
        )
      ).slice(0, 3); // Limit to 3 recommendations
    }
  });
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl font-bold text-primary">
            <MapPin className="h-5 w-5 mr-2" />
            Pelerinaje recomandate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-bold text-primary">
          <MapPin className="h-5 w-5 mr-2" />
          Pelerinaje recomandate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingFeasts.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              Bazat pe sărbătorile apropiate:
              {upcomingFeasts.map((feast, index) => (
                <span key={feast.id}>
                  {index ? ', ' : ' '}
                  <span className="font-medium">{feast.nameRo}</span>
                </span>
              ))}
            </p>
          </div>
        )}
        
        {pilgrimages.length > 0 ? (
          <div className="space-y-4">
            {pilgrimages.map(pilgrimage => (
              <div key={pilgrimage.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-start">
                  <div className="h-16 w-16 mr-3 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={pilgrimage.images && pilgrimage.images.length > 0 ? pilgrimage.images[0] : undefined}
                      alt={pilgrimage.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-md">{pilgrimage.title}</h3>
                    <div className="flex items-center text-sm text-neutral-500 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{pilgrimage.location}</span>
                      <span className="mx-1">•</span>
                      <span>{pilgrimage.month}</span>
                    </div>
                    <Link href={`/pilgrimages/${pilgrimage.id}`}>
                      <a className="text-primary text-sm font-medium hover:underline">
                        Vezi detalii
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/pilgrimages">
                  Vezi toate pelerinajele
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <p>Nu există pelerinaje recomandate momentan.</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/pilgrimages">
                Explorează toate pelerinajele
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}