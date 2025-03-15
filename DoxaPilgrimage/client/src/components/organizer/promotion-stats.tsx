import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface PromotionStatsProps {
  promotionStats: any;
  loading: boolean;
  error: any;
  pilgrimageId: number;
  onPromote: (pilgrimageId: number) => void;
  onCancelPromotion: (pilgrimageId: number) => void;
  isPilgrimageVerified: boolean;
  formatDate: (date: string) => string;
}

export default function PromotionStats({ 
  promotionStats, 
  loading, 
  error, 
  pilgrimageId, 
  onPromote, 
  onCancelPromotion,
  isPilgrimageVerified,
  formatDate
}: PromotionStatsProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          Statistici promovare
        </CardTitle>
        {promotionStats?.activePromotion ? (
          <CardDescription>
            Promovare activă: nivel <span className="font-medium">{promotionStats.activePromotion.level}</span>, 
            perioada {formatDate(promotionStats.activePromotion.startDate)} - {formatDate(promotionStats.activePromotion.endDate)}
          </CardDescription>
        ) : (
          <CardDescription>
            Nu există promovare activă pentru acest pelerinaj. Activați promovarea pentru a crește vizibilitatea.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            Nu s-au putut încărca statisticile de promovare. Încercați să reîmprospătați pagina.
          </div>
        ) : promotionStats ? (
          <div className="space-y-6">
            {promotionStats.activePromotion ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{promotionStats.impressions.reduce((sum, day) => sum + day.count, 0)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Vizualizări totale</div>
                </div>
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{promotionStats.conversionRate}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Rată de conversie</div>
                </div>
                <div className="bg-muted rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{promotionStats.roi}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Return on Investment</div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p>Nu există date de promovare disponibile pentru acest pelerinaj.</p>
                <Button 
                  onClick={() => onPromote(pilgrimageId)} 
                  className="mt-4"
                  disabled={!isPilgrimageVerified}
                >
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  Începe promovarea
                </Button>
              </div>
            )}
            
            {promotionStats.activePromotion && (
              <>
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Vizualizări zilnice</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={promotionStats.impressions}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => formatDate(value)}
                          formatter={(value) => [`${value} vizualizări`, 'Vizualizări']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Vizualizări"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Conversii și click-uri</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={promotionStats.clicks.map((click, index) => ({
                          date: click.date,
                          clicks: click.count,
                          bookings: promotionStats.bookings[index]?.count || 0
                        }))}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => formatDate(value)}
                        />
                        <Legend />
                        <Bar dataKey="clicks" name="Click-uri" fill="#8884d8" />
                        <Bar dataKey="bookings" name="Rezervări" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => onCancelPromotion(pilgrimageId)}
                    className="text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Anulează promovarea curentă
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center p-4 border rounded-md">
            <p>Nu există statistici de promovare pentru acest pelerinaj.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}