import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

// Harta lumii în format TopoJSON
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface MapDataPoint {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  accesses: number;
  reservations: number;
  value: number;
  completedReservations: number;
  incompleteReservations: number;
  type: 'user' | 'organizer';
  aiInteractions?: number;
}

interface MapData {
  mapData: MapDataPoint[];
  statistics: {
    totalAccesses: number;
    totalReservations: number;
    totalCompletedReservations: number;
    totalIncompleteReservations: number;
    totalAiInteractions: number;
    interactionRatio: string;
    completionRate: string;
    date: string;
  };
  recommendations: {
    type: string;
    message: string;
    importance: 'high' | 'medium' | 'low';
  }[];
}

interface DailyReport {
  date: string;
  userStats: {
    activeUsers: number;
    newReservations: number;
    incompleteReservations: number;
  };
  userFeedback: {
    issue: string;
    count: number;
    suggestion: string;
  }[];
  organizerFeedback: {
    issue: string;
    count: number;
    suggestion: string;
  }[];
  recommendations: string[];
}

export function InteractiveMap() {
  const [period, setPeriod] = useState('all');
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState<[number, number]>([25, 46]);
  const [activeTab, setActiveTab] = useState('map');
  
  // Interogare pentru datele hărții
  const { data: mapData, isLoading: isMapLoading, error: mapError } = useQuery<MapData>({
    queryKey: ['/api/admin/interactive-map', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/interactive-map?period=${period}`);
      if (!response.ok) {
        throw new Error('Eroare la încărcarea datelor pentru hartă');
      }
      return response.json();
    },
    enabled: activeTab === 'map',
  });
  
  // Interogare pentru raportul zilnic
  const { data: dailyReport, isLoading: isReportLoading, error: reportError } = useQuery<DailyReport>({
    queryKey: ['/api/admin/daily-report'],
    queryFn: async () => {
      const response = await fetch('/api/admin/daily-report');
      if (!response.ok) {
        throw new Error('Eroare la încărcarea raportului zilnic');
      }
      return response.json();
    },
    enabled: activeTab === 'report',
  });
  
  const handleZoomIn = () => {
    if (zoom >= 16) return;
    setZoom(zoom + 1);
  };
  
  const handleZoomOut = () => {
    if (zoom <= 1) return;
    setZoom(zoom - 1);
  };
  
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DOXA Insights - Hartă Interactivă și Rapoarte</CardTitle>
        <CardDescription>
          Monitorizare în timp real a activității platformei. Vizualizare interactivă bazată pe locații și interacțiuni.
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Hartă Interactivă</TabsTrigger>
          <TabsTrigger value="report">Raport Zilnic</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selectează perioada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate timpurile</SelectItem>
                    <SelectItem value="today">Astăzi</SelectItem>
                    <SelectItem value="week">Ultima săptămână</SelectItem>
                    <SelectItem value="month">Ultima lună</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isMapLoading ? (
                <div className="flex justify-center items-center h-[500px]">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
                    <div className="mt-2">Se încarcă datele...</div>
                  </div>
                </div>
              ) : mapError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Eroare</AlertTitle>
                  <AlertDescription>
                    Nu s-au putut încărca datele pentru hartă. Vă rugăm încercați din nou.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div style={{ height: '500px', width: '100%' }} className="border rounded-md">
                    <ComposableMap projection="geoMercator">
                      <ZoomableGroup zoom={zoom} center={center}>
                        <Geographies geography={geoUrl}>
                          {({ geographies }) =>
                            geographies.map((geo) => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#DDD"
                                stroke="#FFF"
                                style={{
                                  default: { outline: 'none' },
                                  hover: { fill: '#F5F4F6', outline: 'none' },
                                  pressed: { outline: 'none' },
                                }}
                              />
                            ))
                          }
                        </Geographies>
                        
                        {mapData?.mapData.map((point, index) => (
                          <Marker key={index} coordinates={[point.longitude, point.latitude]}>
                            <circle
                              r={Math.sqrt(point.value) / 3}
                              fill={point.incompleteReservations > 0 ? "#ff7c43" : "#4263eb"}
                              stroke="#fff"
                              strokeWidth={0.5}
                              style={{
                                cursor: 'pointer',
                                opacity: 0.8,
                              }}
                            />
                            <text
                              textAnchor="middle"
                              y={Math.sqrt(point.value) / 3 + 10}
                              style={{
                                fontFamily: "system-ui",
                                fill: "#333",
                                fontSize: "10px",
                                fontWeight: "bold",
                                pointerEvents: "none",
                              }}
                            >
                              {point.city}
                            </text>
                          </Marker>
                        ))}
                      </ZoomableGroup>
                    </ComposableMap>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Total accesări</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{mapData?.statistics.totalAccesses}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Rezervări</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{mapData?.statistics.totalReservations}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Interacțiuni AI</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{mapData?.statistics.totalAiInteractions}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Rată finalizare</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{mapData?.statistics.completionRate}%</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableCaption>Date actualizate {formatDate(mapData?.statistics.date || '')}</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Locație</TableHead>
                          <TableHead className="text-right">Accesări</TableHead>
                          <TableHead className="text-right">Rezervări</TableHead>
                          <TableHead className="text-right">Incomplete</TableHead>
                          <TableHead className="text-right">Interacțiuni AI</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mapData?.mapData.map((point, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {point.city}, {point.country}
                            </TableCell>
                            <TableCell className="text-right">{point.accesses}</TableCell>
                            <TableCell className="text-right">{point.reservations}</TableCell>
                            <TableCell className="text-right">{point.incompleteReservations}</TableCell>
                            <TableCell className="text-right">{point.aiInteractions || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Recomandări:</h3>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      {mapData?.recommendations.map((recommendation, index) => (
                        <Alert key={index} className="mb-3">
                          <Badge 
                            variant={
                              recommendation.importance === 'high' 
                                ? 'destructive' 
                                : recommendation.importance === 'medium' 
                                  ? 'outline' 
                                  : 'secondary'
                            }
                            className="mb-1"
                          >
                            {recommendation.importance === 'high' ? 'Urgent' : (recommendation.importance === 'medium' ? 'Important' : 'Info')}
                          </Badge>
                          <AlertTitle className="mt-2">{recommendation.type.replace(/_/g, ' ').toUpperCase()}</AlertTitle>
                          <AlertDescription>{recommendation.message}</AlertDescription>
                        </Alert>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="report">
          <CardContent>
            {isReportLoading ? (
              <div className="flex justify-center items-center h-[500px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent"></div>
                  <div className="mt-2">Se încarcă raportul...</div>
                </div>
              </div>
            ) : reportError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Eroare</AlertTitle>
                <AlertDescription>
                  Nu s-a putut încărca raportul zilnic. Vă rugăm încercați din nou.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5" /> Raport zilnic - {formatDate(dailyReport?.date || '')}
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Utilizatori activi</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{dailyReport?.userStats.activeUsers}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Rezervări noi</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{dailyReport?.userStats.newReservations}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm font-medium">Rezervări incomplete</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-2xl font-bold">{dailyReport?.userStats.incompleteReservations}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Feedback Utilizatori
                    </h4>
                    <ScrollArea className="h-[300px] rounded-md border">
                      <div className="p-4 space-y-4">
                        {dailyReport?.userFeedback.map((feedback, index) => (
                          <Alert key={index}>
                            <AlertTitle className="flex items-center justify-between">
                              <span>{feedback.issue}</span>
                              <Badge variant="outline">{feedback.count} utilizatori</Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                              <span className="font-semibold">Sugestie:</span> {feedback.suggestion}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Feedback Organizatori
                    </h4>
                    <ScrollArea className="h-[300px] rounded-md border">
                      <div className="p-4 space-y-4">
                        {dailyReport?.organizerFeedback.map((feedback, index) => (
                          <Alert key={index}>
                            <AlertTitle className="flex items-center justify-between">
                              <span>{feedback.issue}</span>
                              <Badge variant="outline">{feedback.count} organizatori</Badge>
                            </AlertTitle>
                            <AlertDescription className="mt-2">
                              <span className="font-semibold">Sugestie:</span> {feedback.suggestion}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Recomandări de îmbunătățire
                  </h4>
                  <div className="space-y-3">
                    {dailyReport?.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <p>{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Powered by DOXA AI - Analiză avansată și recomandări personalizate
        </div>
      </CardFooter>
    </Card>
  );
}