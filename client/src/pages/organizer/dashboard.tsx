import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Pilgrimage, Booking } from "@shared/schema";
import { Link } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileText, User, DollarSign, Calendar, Edit, Eye, MapPin, Clock, Users } from "lucide-react";

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPilgrimageId, setSelectedPilgrimageId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("pilgrimages");

  // Verificăm dacă utilizatorul este organizator sau admin
  const isOrganizer = user && (user.role === "operator" || user.role === "monastery" || user.role === "admin");

  // Obținem toate pelerinajele organizatorului
  const {
    data: pilgrimages,
    isLoading: pilgrimagesLoading,
    error: pilgrimagesError,
  } = useQuery<Pilgrimage[]>({
    queryKey: ["/api/organizer/pilgrimages"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!isOrganizer,
  });

  // Obținem rezervările pentru un pelerinaj selectat
  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery<any[]>({
    queryKey: ["/api/organizer/pilgrimages", selectedPilgrimageId, "bookings"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedPilgrimageId && !!isOrganizer,
  });

  // Obținem raportul financiar pentru un pelerinaj selectat
  const {
    data: financialReport,
    isLoading: financialReportLoading,
    error: financialReportError,
  } = useQuery<any>({
    queryKey: ["/api/organizer/pilgrimages", selectedPilgrimageId, "financial-report"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!selectedPilgrimageId && !!isOrganizer,
  });

  // Funcție pentru publicarea unui pelerinaj
  const publishPilgrimage = async (pilgrimageId: number) => {
    try {
      await apiRequest("POST", `/api/organizer/pilgrimages/${pilgrimageId}/publish`);
      
      // Actualizăm lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/pilgrimages"] });
      
      toast({
        title: "Pelerinaj publicat",
        description: "Pelerinajul a fost publicat cu succes",
        variant: "default",
      });
    } catch (error) {
      console.error("Error publishing pilgrimage:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut publica pelerinajul. Încercați din nou.",
        variant: "destructive",
      });
    }
  };
  
  // Funcție pentru depublicarea unui pelerinaj
  const unpublishPilgrimage = async (pilgrimageId: number) => {
    try {
      await apiRequest("POST", `/api/organizer/pilgrimages/${pilgrimageId}/unpublish`);
      
      // Actualizăm lista de pelerinaje
      queryClient.invalidateQueries({ queryKey: ["/api/organizer/pilgrimages"] });
      
      toast({
        title: "Pelerinaj depublicat",
        description: "Pelerinajul a fost depublicat cu succes",
        variant: "default",
      });
    } catch (error) {
      console.error("Error unpublishing pilgrimage:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut depublica pelerinajul. Încercați din nou.",
        variant: "destructive",
      });
    }
  };

  // Funcție pentru formatarea datelor
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Acces restricționat</CardTitle>
            <CardDescription>
              Această pagină este destinată doar organizatorilor de pelerinaje.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Trebuie să fiți autentificat ca organizator pentru a accesa acest panou.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">Înapoi la pagina principală</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panou de administrare - Organizator de pelerinaje</h1>
      
      <Tabs defaultValue="pilgrimages" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pilgrimages">Pelerinajele mele</TabsTrigger>
          <TabsTrigger value="bookings" disabled={!selectedPilgrimageId}>
            Rezervări
          </TabsTrigger>
          <TabsTrigger value="financial" disabled={!selectedPilgrimageId}>
            Raport financiar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pilgrimages">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Pelerinajele mele</span>
                <Button asChild>
                  <Link href="/organizer/create-pilgrimage">Adaugă pelerinaj nou</Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Gestionează, publică și vizualizează rezervările pentru pelerinajele tale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pilgrimagesLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : pilgrimagesError ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                  Nu s-au putut încărca pelerinajele. Încercați să reîmprospătați pagina.
                </div>
              ) : pilgrimages && pilgrimages.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Lista de pelerinaje organizate de dumneavoastră</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titlu</TableHead>
                        <TableHead>Locație</TableHead>
                        <TableHead>Perioada</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Preț</TableHead>
                        <TableHead>Acțiuni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pilgrimages.map((pilgrimage) => (
                        <TableRow key={pilgrimage.id}>
                          <TableCell className="font-medium">{pilgrimage.title}</TableCell>
                          <TableCell>{pilgrimage.location}</TableCell>
                          <TableCell>
                            {formatDate(pilgrimage.startDate.toString())} - {formatDate(pilgrimage.endDate.toString())}
                          </TableCell>
                          <TableCell>
                            {pilgrimage.verified ? (
                              <Badge className="bg-green-500">Publicat</Badge>
                            ) : (
                              <Badge variant="outline">Nepublicat</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {pilgrimage.price} {pilgrimage.currency}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPilgrimageId(pilgrimage.id);
                                  setActiveTab("bookings");
                                }}
                              >
                                <User className="h-4 w-4 mr-1" /> Rezervări
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPilgrimageId(pilgrimage.id);
                                  setActiveTab("financial");
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-1" /> Financiar
                              </Button>

                              {pilgrimage.verified ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">Depublică</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Depublică pelerinajul</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Sunteți sigur că doriți să depublicați acest pelerinaj? 
                                        Nu va mai fi vizibil pentru utilizatori.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Anulare</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => unpublishPilgrimage(pilgrimage.id)}>
                                        Depublică
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              ) : (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => publishPilgrimage(pilgrimage.id)}
                                >
                                  Publică
                                </Button>
                              )}
                              
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/pilgrimages/${pilgrimage.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/pilgrimages/${pilgrimage.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p className="mb-4">Nu aveți niciun pelerinaj adăugat.</p>
                  <Button asChild>
                    <Link href="/organizer/create-pilgrimage">Adaugă primul tău pelerinaj</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Rezervări pentru pelerinajul selectat</span>
                <Button variant="outline" onClick={() => setActiveTab("pilgrimages")}>
                  Înapoi la pelerinaje
                </Button>
              </CardTitle>
              <CardDescription>
                {selectedPilgrimageId && pilgrimages ? (
                  <p>
                    Pelerinaj: {
                      pilgrimages.find(p => p.id === selectedPilgrimageId)?.title || "Necunoscut"
                    }
                  </p>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : bookingsError ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                  Nu s-au putut încărca rezervările. Încercați să reîmprospătați pagina.
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>Lista de rezervări pentru pelerinajul selectat</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilizator</TableHead>
                        <TableHead>Persoane</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data rezervării</TableHead>
                        <TableHead>Informații contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.user?.firstName} {booking.user?.lastName}</TableCell>
                          <TableCell>{booking.persons} persoane</TableCell>
                          <TableCell>{booking.totalPrice} {pilgrimages?.find(p => p.id === selectedPilgrimageId)?.currency}</TableCell>
                          <TableCell>
                            {booking.status === "confirmed" ? (
                              <Badge className="bg-green-500">Confirmată</Badge>
                            ) : booking.status === "cancelled" ? (
                              <Badge variant="destructive">Anulată</Badge>
                            ) : (
                              <Badge variant="outline">În așteptare</Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(booking.createdAt)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Vezi detalii</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detalii contact</DialogTitle>
                                  <DialogDescription>
                                    Informații despre persoana care a făcut rezervarea
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                  <div className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span className="font-semibold">Nume:</span>
                                    <span className="ml-2">{booking.user?.firstName} {booking.user?.lastName}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                    <span className="font-semibold">Telefon:</span>
                                    <span className="ml-2">{booking.user?.phone || "Nespecificat"}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                      <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <span className="font-semibold">Email:</span>
                                    <span className="ml-2">{booking.user?.email}</span>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="button" onClick={() => {
                                    // Aici se poate implementa logica pentru a trimite un email sau un mesaj utilizatorului
                                    toast({
                                      title: "Notificare trimisă",
                                      description: "Un email a fost trimis către utilizator",
                                    });
                                  }}>
                                    Contactează
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p>Nu există rezervări pentru acest pelerinaj.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Raport financiar</span>
                <Button variant="outline" onClick={() => setActiveTab("pilgrimages")}>
                  Înapoi la pelerinaje
                </Button>
              </CardTitle>
              <CardDescription>
                {selectedPilgrimageId && pilgrimages ? (
                  <p>
                    Pelerinaj: {
                      pilgrimages.find(p => p.id === selectedPilgrimageId)?.title || "Necunoscut"
                    }
                  </p>
                ) : null}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialReportLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : financialReportError ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                  Nu s-a putut încărca raportul financiar. Încercați să reîmprospătați pagina.
                </div>
              ) : financialReport ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Sumar financiar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt>Total încasări:</dt>
                          <dd className="font-bold">
                            {financialReport.financial.totalAmount} {financialReport.financial.currency}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Încasări confirmate:</dt>
                          <dd className="text-green-600 font-semibold">
                            {financialReport.financial.confirmedAmount} {financialReport.financial.currency}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Încasări în așteptare:</dt>
                          <dd className="text-yellow-600">
                            {financialReport.financial.pendingAmount} {financialReport.financial.currency}
                          </dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <dt>Preț per persoană:</dt>
                          <dd>
                            {financialReport.pilgrimage.price} {financialReport.financial.currency}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Statistici pelerini
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt>Total persoane înscrise:</dt>
                          <dd className="font-bold">{financialReport.persons.total}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Locuri confirmate:</dt>
                          <dd className="text-green-600 font-semibold">{financialReport.persons.confirmed}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Locuri rămase:</dt>
                          <dd>{financialReport.persons.spotsRemaining}</dd>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <dt>Capacitate totală:</dt>
                          <dd>{financialReport.pilgrimage.availableSpots}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>Grad de ocupare:</dt>
                          <dd>
                            {Math.round((financialReport.persons.spotsFilled / financialReport.pilgrimage.availableSpots) * 100)}%
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Statistici rezervări
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="border rounded-lg p-3 text-center">
                          <dt className="text-sm text-muted-foreground">Total rezervări</dt>
                          <dd className="text-2xl font-bold">{financialReport.bookings.total}</dd>
                        </div>
                        <div className="border rounded-lg p-3 text-center">
                          <dt className="text-sm text-muted-foreground">Confirmate</dt>
                          <dd className="text-2xl font-bold text-green-600">{financialReport.bookings.confirmed}</dd>
                        </div>
                        <div className="border rounded-lg p-3 text-center">
                          <dt className="text-sm text-muted-foreground">În așteptare</dt>
                          <dd className="text-2xl font-bold text-yellow-600">{financialReport.bookings.pending}</dd>
                        </div>
                        <div className="border rounded-lg p-3 text-center">
                          <dt className="text-sm text-muted-foreground">Anulate</dt>
                          <dd className="text-2xl font-bold text-red-600">{financialReport.bookings.cancelled}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p>Nu există date financiare pentru acest pelerinaj.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}