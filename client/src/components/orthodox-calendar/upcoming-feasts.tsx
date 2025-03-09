import { OrthodoxFeast, getUpcomingFeasts } from '@shared/orthodox-calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

interface UpcomingFeastsProps {
  count?: number;
}

export default function UpcomingFeasts({ count = 5 }: UpcomingFeastsProps) {
  const upcomingFeasts = getUpcomingFeasts(new Date(), count);
  
  const getFeastTypeColor = (type: OrthodoxFeast['type']) => {
    switch (type) {
      case 'major': return 'bg-blue-100 text-blue-800';
      case 'minor': return 'bg-purple-100 text-purple-700';
      case 'saint': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };
  
  const getFeastTypeLabel = (type: OrthodoxFeast['type']) => {
    switch (type) {
      case 'major': return 'Sărbătoare Mare';
      case 'minor': return 'Sărbătoare Mică';
      case 'saint': return 'Sfânt';
      default: return 'Sărbătoare';
    }
  };
  
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const feastDate = new Date(dateStr);
    feastDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(feastDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Astăzi';
    } else if (diffDays === 1) {
      return 'Mâine';
    } else {
      return `În ${diffDays} zile`;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-bold text-primary">
          <CalendarClock className="h-5 w-5 mr-2" />
          Sărbători apropiate
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingFeasts.length > 0 ? (
          <div className="space-y-4">
            {upcomingFeasts.map(feast => (
              <div key={feast.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{feast.nameRo}</h3>
                    <div className="text-sm text-neutral-500">
                      {new Date(feast.date).toLocaleDateString('ro-RO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    {feast.description && (
                      <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{feast.description}</p>
                    )}
                    {feast.relatedPilgrimages && feast.relatedPilgrimages.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-primary">Locații pentru pelerinaj:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {feast.relatedPilgrimages.map((place, idx) => (
                            <Badge key={idx} variant="outline" className="bg-yellow-50">
                              {place}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getFeastTypeColor(feast.type)}>
                      {getFeastTypeLabel(feast.type)}
                    </Badge>
                    <span className="text-xs font-medium text-neutral-500">
                      {getDaysUntil(feast.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-neutral-500">
            Nu există sărbători apropiate
          </div>
        )}
      </CardContent>
    </Card>
  );
}