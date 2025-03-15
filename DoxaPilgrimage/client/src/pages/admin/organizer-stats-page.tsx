import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Redirect } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchIcon, TrendingUpIcon, TrendingDownIcon, FilterIcon, BarChart3Icon } from "lucide-react";
import { User } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Definim tipul pentru statisticile organizatorilor
type OrganizerStat = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  pilgrimagesCount: number;
  promotedPilgrimagesCount: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  lastActivity: string;
  profileImage?: string;
};

// Culorile pentru grafice
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d"];

export default function OrganizerStatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerStat | null>(null);

  // Query pentru a obține statisticile organizatorilor
  const {
    data: organizerStats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/admin/organizer-stats"],
    queryFn: () => apiRequest("GET", "/api/admin/organizer-stats").then((res) => res.json()),
    refetchInterval: 30000, // Reîmprospătează la fiecare 30 secunde
  });

  // Filtram rezultatele dupa cautare
  const filteredStats = organizerStats?.filter((stat: OrganizerStat) => {
    return (
      stat.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${stat.firstName} ${stat.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Date pentru grafic comparativ
  const getComparisonChartData = () => {
    if (!organizerStats) return [];

    // Sortăm după numărul total de rezervări
    return [...organizerStats]
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 10) // Luăm top 10 organizatori
      .map((stat) => ({
        name: stat.username,
        Rezervări: stat.totalBookings,
        Venituri: stat.totalRevenue / 100, // Convertim din cenți în euro/lei
        Pelerinaje: stat.pilgrimagesCount,
        PelerinajePremium: stat.promotedPilgrimagesCount
      }));
  };

  // Date pentru graficul de tip pie cu distribuția pelerinajelor promovate
  const getPromotedPilgrimagesData = () => {
    if (!organizerStats) return [];

    const total = organizerStats.reduce(
      (sum, stat) => sum + stat.promotedPilgrimagesCount, 
      0
    );

    if (total === 0) return [];

    return organizerStats
      .filter(stat => stat.promotedPilgrimagesCount > 0)
      .map(stat => ({
        name: stat.username,
        value: stat.promotedPilgrimagesCount,
        percentage: (stat.promotedPilgrimagesCount / total) * 100
      }));
  };

  // Randăm pagina de statistici
  if (!user || user.role !== "admin") {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Statistici Organizatori</h1>
        <p className="text-gray-500">
          Vizualizați și analizați performanța organizatorilor de pelerinaje
        </p>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <div className="relative w-full max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Căutați după nume, email sau username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="table" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="table">Tabel</TabsTrigger>
          <TabsTrigger value="charts">Grafice</TabsTrigger>
          <TabsTrigger value="comparison">Comparație</TabsTrigger>
        </TabsList>

        {/* Tab-ul cu tabel */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Lista Organizatorilor</CardTitle>
              <CardDescription>
                Lista completă a organizatorilor cu statistici importante
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : isError ? (
                <div className="text-center py-8 text-red-500">
                  Nu s-au putut încărca statisticile organizatorilor.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organizator</TableHead>
                        <TableHead>Pelerinaje</TableHead>
                        <TableHead>Pelerinaje Promovate</TableHead>
                        <TableHead>Rezervări</TableHead>
                        <TableHead>Venituri</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Ultima Activitate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStats?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            Nu s-au găsit organizatori care să corespundă căutării
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStats?.map((stat: OrganizerStat) => (
                          <TableRow 
                            key={stat.id}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedOrganizer(stat)}
                          >
                            <TableCell className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={stat.profileImage} />
                                <AvatarFallback>{stat.firstName[0] + stat.lastName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{stat.firstName} {stat.lastName}</div>
                                <div className="text-sm text-gray-500">{stat.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{stat.pilgrimagesCount}</TableCell>
                            <TableCell>
                              {stat.promotedPilgrimagesCount > 0 ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  {stat.promotedPilgrimagesCount}
                                </Badge>
                              ) : (
                                stat.promotedPilgrimagesCount
                              )}
                            </TableCell>
                            <TableCell>{stat.totalBookings}</TableCell>
                            <TableCell>{(stat.totalRevenue / 100).toFixed(2)} €</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className={`font-medium ${stat.averageRating >= 4.5 ? "text-green-700" : stat.averageRating >= 3.5 ? "text-yellow-600" : "text-red-600"}`}>
                                  {stat.averageRating.toFixed(1)}
                                </span>
                                <span className="text-yellow-400 ml-1">★</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(stat.lastActivity).toLocaleDateString("ro-RO", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab-ul cu grafice */}
        <TabsContent value="charts">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuția Pelerinajelor Promovate</CardTitle>
                <CardDescription>
                  Procentul de pelerinaje promovate per organizator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPromotedPilgrimagesData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      >
                        {getPromotedPilgrimagesData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => [
                          `${value} pelerinaje promovate`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rezervări per Organizator</CardTitle>
                <CardDescription>
                  Numărul total de rezervări pentru fiecare organizator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getComparisonChartData()}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Rezervări" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab-ul de comparație */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparație Organizatori</CardTitle>
              <CardDescription>
                Comparație între rezervări, venituri și numărul de pelerinaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getComparisonChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Rezervări" fill="#8884d8" />
                    <Bar dataKey="Venituri" fill="#82ca9d" />
                    <Bar dataKey="Pelerinaje" fill="#ffc658" />
                    <Bar dataKey="PelerinajePremium" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detalii organizator selectat */}
      {selectedOrganizer && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedOrganizer.profileImage} />
                <AvatarFallback>{selectedOrganizer.firstName[0] + selectedOrganizer.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedOrganizer.firstName} {selectedOrganizer.lastName}</div>
                <div className="text-sm text-gray-500">@{selectedOrganizer.username}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium mb-1">Pelerinaje Active</div>
                <div className="text-3xl font-bold">{selectedOrganizer.pilgrimagesCount}</div>
                <div className="text-sm text-gray-500">
                  {selectedOrganizer.promotedPilgrimagesCount} promovate
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium mb-1">Venituri Totale</div>
                <div className="text-3xl font-bold">{(selectedOrganizer.totalRevenue / 100).toFixed(2)} €</div>
                <div className="text-sm text-gray-500">
                  {selectedOrganizer.totalBookings} rezervări
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-sm font-medium mb-1">Rating Mediu</div>
                <div className="text-3xl font-bold flex items-center">
                  {selectedOrganizer.averageRating.toFixed(1)}
                  <span className="text-yellow-400 ml-1">★</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}