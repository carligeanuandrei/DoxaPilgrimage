import { useState } from 'react';
import { OrthodoxFeast, FastingPeriod, getFeastsForMonth, isWithinFastingPeriod, isFastingDay } from '@shared/orthodox-calendar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarDisplay() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear] = useState(2025); // For the MVP, we'll focus on 2025
  
  const feasts = getFeastsForMonth(currentMonth, currentYear);
  
  const getPreviousMonth = () => {
    setCurrentMonth(prev => prev === 1 ? 12 : prev - 1);
  };
  
  const getNextMonth = () => {
    setCurrentMonth(prev => prev === 12 ? 1 : prev + 1);
  };
  
  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('ro-RO', { month: 'long' });
  };
  
  const getFastingTypeColor = (type: FastingPeriod['type']) => {
    switch (type) {
      case 'strict': return 'bg-red-100 text-red-800';
      case 'relaxed': return 'bg-orange-100 text-orange-800';
      case 'free': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };
  
  const getFeastTypeColor = (type: OrthodoxFeast['type']) => {
    switch (type) {
      case 'major': return 'bg-blue-100 text-blue-800';
      case 'minor': return 'bg-purple-100 text-purple-700';
      case 'saint': return 'bg-green-100 text-green-800';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };
  
  // Generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  
  // Adjust for Sunday as first day of week
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Calendar grid
  const calendarDays = [];
  let dayCounter = 1;
  
  // Create rows for the calendar
  for (let i = 0; i < 6; i++) {
    const week = [];
    
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < adjustedFirstDay) || dayCounter > daysInMonth) {
        // Empty cell
        week.push(null);
      } else {
        const currentDate = new Date(currentYear, currentMonth - 1, dayCounter);
        const isFasting = isFastingDay(currentDate);
        const fastingPeriod = isWithinFastingPeriod(currentDate);
        
        // Check if this day has a feast
        const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
        const dayFeast = feasts.find(feast => feast.date === dateStr);
        
        week.push({
          day: dayCounter,
          isFasting,
          fastingPeriod,
          feast: dayFeast
        });
        
        dayCounter++;
      }
    }
    
    calendarDays.push(week);
    
    // If we've reached the end of the month, break
    if (dayCounter > daysInMonth) {
      break;
    }
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={getPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-xl font-bold text-primary">
            {getMonthName(currentMonth)} {currentYear}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={getNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center">
          <img 
            src="/images/orthodox-calendar/calendar-display-icon.svg" 
            alt="Orthodox Calendar Display" 
            className="h-16 w-16" 
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sb', 'Du'].map((day, index) => (
            <div 
              key={index} 
              className="text-center font-medium text-sm p-1"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.flat().map((day, index) => (
            <div 
              key={index} 
              className={`min-h-12 p-1 border rounded-sm text-center relative ${
                day ? (
                  day.isFasting 
                    ? 'bg-red-50 border-red-200' 
                    : day.feast 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-neutral-200'
                ) : 'bg-neutral-50 border-neutral-100'
              }`}
            >
              {day && (
                <>
                  <div className="font-medium">{day.day}</div>
                  
                  {day.feast && (
                    <div className="absolute bottom-0 left-0 right-0 px-0.5">
                      <div className="truncate text-xs font-medium text-primary overflow-hidden text-ellipsis">
                        <span className="inline-block w-full">{day.feast.nameRo}</span>
                      </div>
                    </div>
                  )}
                  
                  {day.isFasting && (
                    <div className="absolute top-0 right-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Feast legend */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Sărbători în {getMonthName(currentMonth)}</h3>
          
          {feasts.length > 0 ? (
            <div className="space-y-2">
              {feasts.map(feast => (
                <div key={feast.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{feast.nameRo}</div>
                    <div className="text-sm text-neutral-500">
                      {new Date(feast.date).toLocaleDateString('ro-RO', { 
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                  <Badge className={getFeastTypeColor(feast.type)}>
                    {feast.type === 'major' ? 'Sărbătoare Mare' : 
                     feast.type === 'minor' ? 'Sărbătoare Mică' :
                     'Sfânt'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-neutral-500 text-sm">Nu există sărbători importante în această lună.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}