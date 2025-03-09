import { fastingPeriods, FastingPeriod } from '@shared/orthodox-calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";

export default function FastingPeriods() {
  const currentDate = new Date();
  const sortedFastingPeriods = [...fastingPeriods].sort((a, b) => {
    // Sort by start date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Check if we are currently in a fasting period
  const currentFastingPeriod = fastingPeriods.find(period => {
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    return currentDate >= startDate && currentDate <= endDate;
  });
  
  // Get the next fasting period if not in one
  const getNextFastingPeriod = (): FastingPeriod | null => {
    if (currentFastingPeriod) return null;
    
    return sortedFastingPeriods.find(period => {
      const startDate = new Date(period.startDate);
      return currentDate < startDate;
    }) || null;
  };
  
  const nextFastingPeriod = getNextFastingPeriod();
  
  const getFastingTypeColor = (type: FastingPeriod['type']) => {
    switch (type) {
      case 'strict': return 'bg-red-100 text-red-800';
      case 'relaxed': return 'bg-orange-100 text-orange-800';
      case 'free': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };
  
  const getFastingTypeLabel = (type: FastingPeriod['type']) => {
    switch (type) {
      case 'strict': return 'Post aspru';
      case 'relaxed': return 'Post cu dezlegare';
      case 'free': return 'Fără restricții';
      default: return 'Post';
    }
  };
  
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long'
    })} - ${end.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long'
    })}`;
  };
  
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  const getDaysUntil = (startDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(start.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl font-bold text-primary">
          <Utensils className="h-5 w-5 mr-2" />
          Perioade de Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentFastingPeriod ? (
          <div className="border border-orange-200 rounded-md p-4 bg-orange-50 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{currentFastingPeriod.nameRo}</h3>
                <p className="text-sm text-neutral-600">
                  {formatDateRange(currentFastingPeriod.startDate, currentFastingPeriod.endDate)}
                </p>
                {currentFastingPeriod.description && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {currentFastingPeriod.description}
                  </p>
                )}
                <p className="mt-2 text-sm font-medium text-orange-800">
                  Mai sunt {getDaysRemaining(currentFastingPeriod.endDate)} zile până la sfârșitul postului
                </p>
              </div>
              <Badge className={getFastingTypeColor(currentFastingPeriod.type)}>
                {getFastingTypeLabel(currentFastingPeriod.type)}
              </Badge>
            </div>
          </div>
        ) : nextFastingPeriod ? (
          <div className="border border-blue-200 rounded-md p-4 bg-blue-50 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">Urmează: {nextFastingPeriod.nameRo}</h3>
                <p className="text-sm text-neutral-600">
                  {formatDateRange(nextFastingPeriod.startDate, nextFastingPeriod.endDate)}
                </p>
                {nextFastingPeriod.description && (
                  <p className="mt-1 text-sm text-neutral-600">
                    {nextFastingPeriod.description}
                  </p>
                )}
                <p className="mt-2 text-sm font-medium text-blue-800">
                  Începe în {getDaysUntil(nextFastingPeriod.startDate)} zile
                </p>
              </div>
              <Badge className={getFastingTypeColor(nextFastingPeriod.type)}>
                {getFastingTypeLabel(nextFastingPeriod.type)}
              </Badge>
            </div>
          </div>
        ) : null}
        
        <h3 className="font-medium mb-2">Toate posturile din {currentDate.getFullYear()}</h3>
        
        <div className="space-y-3">
          {sortedFastingPeriods.map(period => (
            <div key={period.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{period.nameRo}</div>
                <div className="text-sm text-neutral-500">
                  {formatDateRange(period.startDate, period.endDate)}
                </div>
              </div>
              <Badge className={getFastingTypeColor(period.type)}>
                {getFastingTypeLabel(period.type)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}