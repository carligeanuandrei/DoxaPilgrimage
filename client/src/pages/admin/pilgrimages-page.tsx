import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  StarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  InfoIcon, 
  FilterIcon,
  ClockIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { Pilgrimage } from "@shared/schema";

export default function AdminPilgrimagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPilgrimage, setSelectedPilgrimage] = useState<Pilgrimage | null>(null);

  // Query pentru a obține toate pelerinajele
  const {
    data: pilgrimages,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/pilgrimages"],
    queryFn: () => apiRequest("GET", "/api/pilgrimages").then((res) => res.json()),
  });

  // Mutație pentru a verifica un pelerinaj
  const verifyPilgrimageMutation = useMutation({
    mutationFn: (pilgrimageId: number) =>
      apiRequest("PUT", `/api/pilgrimages/${pilgrimageId}/verify`, {}),
    onSuccess: () => {
      toast({
        title: "Pelerinaj verificat",
        description: "Pelerinajul a fost verificat cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pilgrimages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut verifica pelerinajul: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutație pentru a marca un pelerinaj ca recomandat (feature)
  const featurePilgrimageMutation = useMutation({
    mutationFn: ({ pilgrimageId, featured }: { pilgrimageId: number; featured: boolean }) =>
      apiRequest("PUT", `/api/pilgrimages/${pilgrimageId}/feature`, { featured }),
    onSuccess: () => {
      toast({
        title: "Pelerinaj actualizat",
        description: "Statusul de recomandat a fost actualizat cu succes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pilgrimages"] });
    },
    onError: (error: any) => {
      toast({
        title: "Eroare",
        description: `Nu s-a putut actualiza statusul pelerinajului: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleVerifyPilgrimage = (pilgrimageId: number) => {
    verifyPilgrimageMutation.mutate(pilgrimageId);
  };

  const handleFeaturePilgrimage = (pilgrimageId: number, featured: boolean) => {
    featurePilgrimageMutation.mutate({ pilgrimageId, featured });
  };

  const handleShowDetails = (pilgrimage: Pilgrimage) => {
    setSelectedPilgrimage(pilgrimage);
    setDetailsOpen(true);
  };

  const filteredPilgrimages = filter
    ? pilgrimages?.filter(
        (pilgrimage: Pilgrimage) =>
          pilgrimage.title.toLowerCase().includes(filter.toLowerCase()) ||
          pilgrimage.location.toLowerCase().includes(filter.toLowerCase()) ||
          pilgrimage.guide.toLowerCase().includes(filter.toLowerCase()) ||
          pilgrimage.saint?.toLowerCase().includes(filter.toLowerCase())
      )
    : pilgrimages;

  // Verificare dacă utilizatorul este admin
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Gestionare Pelerinaje</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            placeholder="Caută pelerinaje..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={() => setFilter("")} size="icon">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toate pelerinajele</TabsTrigger>
          <TabsTrigger value="unverified">Neverificate</TabsTrigger>
          <TabsTrigger value="featured">Recomandate</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            Eroare la încărcarea datelor. Vă rugăm să încercați din nou mai
            târziu.
          </div>
        ) : (
          <>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Toate pelerinajele</CardTitle>
                  <CardDescription>
                    Gestionați toate pelerinajele din platformă
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PilgrimageTable
                    pilgrimages={filteredPilgrimages}
                    handleVerifyPilgrimage={handleVerifyPilgrimage}
                    handleFeaturePilgrimage={handleFeaturePilgrimage}
                    handleShowDetails={handleShowDetails}
                    formatDate={formatDate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unverified">
              <Card>
                <CardHeader>
                  <CardTitle>Pelerinaje neverificate</CardTitle>
                  <CardDescription>
                    Pelerinaje care necesită verificare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PilgrimageTable
                    pilgrimages={filteredPilgrimages?.filter((pilgrimage: Pilgrimage) => !pilgrimage.verified)}
                    handleVerifyPilgrimage={handleVerifyPilgrimage}
                    handleFeaturePilgrimage={handleFeaturePilgrimage}
                    handleShowDetails={handleShowDetails}
                    formatDate={formatDate}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="featured">
              <Card>
                <CardHeader>
                  <CardTitle>Pelerinaje recomandate</CardTitle>
                  <CardDescription>
                    Pelerinaje marcate ca fiind recomandate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PilgrimageTable
                    pilgrimages={filteredPilgrimages?.filter((pilgrimage: Pilgrimage) => pilgrimage.featured)}
                    handleVerifyPilgrimage={handleVerifyPilgrimage}
                    handleFeaturePilgrimage={handleFeaturePilgrimage}
                    handleShowDetails={handleShowDetails}
                    formatDate={formatDate}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {selectedPilgrimage && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Detalii pelerinaj</DialogTitle>
              <DialogDescription>
                Informații complete despre pelerinaj
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold flex items-center">
                  {selectedPilgrimage.title}
                  {selectedPilgrimage.featured && (
                    <Badge variant="default" className="ml-2">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Recomandat
                    </Badge>
                  )}
                </h2>
                
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPilgrimage.verified ? (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                      Verificat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50">
                      <XCircleIcon className="h-3 w-3 mr-1 text-amber-500" />
                      Neverificat
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <MapPinIcon className="h-3 w-3 mr-1" />
                    {selectedPilgrimage.location}
                  </Badge>
                  <Badge variant="secondary">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {selectedPilgrimage.month}
                  </Badge>
                  <Badge variant="secondary">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    {selectedPilgrimage.availableSpots} locuri disponibile
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Data început
                  </h4>
                  <p>{formatDate(selectedPilgrimage.startDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Data sfârșit
                  </h4>
                  <p>{formatDate(selectedPilgrimage.endDate)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Ghid spiritual
                  </h4>
                  <p>{selectedPilgrimage.guide}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Transport
                  </h4>
                  <p>{selectedPilgrimage.transportation}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Sfânt/Sărbătoare
                  </h4>
                  <p>{selectedPilgrimage.saint || "Nu este specificat"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Preț
                  </h4>
                  <p className="font-semibold">{selectedPilgrimage.price} {selectedPilgrimage.currency}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Descriere
                </h4>
                <p className="text-sm whitespace-pre-line">{selectedPilgrimage.description}</p>
              </div>

              {selectedPilgrimage.includedServices && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Servicii incluse
                  </h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {selectedPilgrimage.includedServices.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPilgrimage.images && selectedPilgrimage.images.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Imagini
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedPilgrimage.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Imagine pelerinaj ${index + 1}`}
                        className="rounded-md h-24 w-full object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {!selectedPilgrimage.verified && (
                <Button
                  onClick={() => handleVerifyPilgrimage(selectedPilgrimage.id)}
                  disabled={verifyPilgrimageMutation.isPending}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Verifică pelerinajul
                </Button>
              )}
              {selectedPilgrimage.featured ? (
                <Button
                  variant="outline"
                  onClick={() => handleFeaturePilgrimage(selectedPilgrimage.id, false)}
                  disabled={featurePilgrimageMutation.isPending}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Elimină din recomandate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleFeaturePilgrimage(selectedPilgrimage.id, true)}
                  disabled={featurePilgrimageMutation.isPending}
                >
                  <StarIcon className="h-4 w-4 mr-2" />
                  Marchează ca recomandat
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componenta tabel pelerinaje
function PilgrimageTable({
  pilgrimages,
  handleVerifyPilgrimage,
  handleFeaturePilgrimage,
  handleShowDetails,
  formatDate,
}: {
  pilgrimages: Pilgrimage[];
  handleVerifyPilgrimage: (pilgrimageId: number) => void;
  handleFeaturePilgrimage: (pilgrimageId: number, featured: boolean) => void;
  handleShowDetails: (pilgrimage: Pilgrimage) => void;
  formatDate: (dateString: string | Date) => string;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pelerinaj</TableHead>
            <TableHead>Perioada</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pilgrimages && pilgrimages.length > 0 ? (
            pilgrimages.map((pilgrimage: Pilgrimage) => (
              <TableRow key={pilgrimage.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="font-medium flex items-center">
                      {pilgrimage.title}
                      {pilgrimage.featured && (
                        <Badge variant="default" className="ml-2">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Recomandat
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {pilgrimage.location}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(pilgrimage.startDate)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {pilgrimage.duration} zile
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {pilgrimage.verified ? (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                      Verificat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50">
                      <XCircleIcon className="h-3 w-3 mr-1 text-amber-500" />
                      Neverificat
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowDetails(pilgrimage)}
                    >
                      <InfoIcon className="h-4 w-4 mr-1" />
                      Detalii
                    </Button>
                    {!pilgrimage.verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyPilgrimage(pilgrimage.id)}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Verifică
                      </Button>
                    )}
                    {pilgrimage.verified && !pilgrimage.featured && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeaturePilgrimage(pilgrimage.id, true)}
                      >
                        <StarIcon className="h-4 w-4 mr-1" />
                        Recomandă
                      </Button>
                    )}
                    {pilgrimage.featured && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeaturePilgrimage(pilgrimage.id, false)}
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Nerecomandă
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Nu există pelerinaje care să corespundă criteriilor selectate.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}