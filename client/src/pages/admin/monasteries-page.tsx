import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Monastery } from "@shared/schema";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Landmark, 
  Pencil, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Info, 
  ChevronRight, 
  Search,
  X
} from "lucide-react";
import { formatRegionName } from "@/lib/format-utils";

// Creează un client de interogare pentru a putea invalida interogările
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function MonasteriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [monasteryToDelete, setMonasteryToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Interogare pentru a obține mănăstirile
  const { data: monasteries, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/monasteries'],
    queryFn: () => apiRequest('GET', '/api/admin/monasteries')
  });

  // Mutație pentru ștergerea unei mănăstiri
  const deleteMonasteryMutation = useMutation({
    mutationFn: (monasteryId: number) => apiRequest('DELETE', `/api/admin/monasteries/${monasteryId}`),
    onSuccess: () => {
      toast({
        title: "Mănăstirea a fost ștearsă cu succes",
        variant: "default",
      });
      refetch(); // Reîncarcă lista de mănăstiri
      setMonasteryToDelete(null);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la ștergerea mănăstirii",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutație pentru actualizarea unei mănăstiri
  const updateMonasteryMutation = useMutation({
    mutationFn: (data: Partial<Monastery> & { id: number }) => {
      const { id, ...updateData } = data;
      return apiRequest('PUT', `/api/admin/monasteries/${id}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Mănăstirea a fost actualizată cu succes",
        variant: "default",
      });
      refetch(); // Reîncarcă lista de mănăstiri
      setEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare la actualizarea mănăstirii",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Form schema pentru editarea unei mănăstiri
  const editMonasterySchema = z.object({
    id: z.number(),
    name: z.string().min(1, { message: "Numele mănăstirii este obligatoriu" }),
    region: z.enum(["moldova", "bucovina", "muntenia", "oltenia", "transilvania", "maramures", "banat", "dobrogea", "crisana"]),
    type: z.enum(["monastery", "hermitage", "church"]),
    city: z.string().min(1, { message: "Localitatea este obligatorie" }),
    county: z.string().min(1, { message: "Județul este obligatoriu" }),
    description: z.string().min(1, { message: "Descrierea este obligatorie" }),
    shortDescription: z.string().nullable().optional(),
    foundedYear: z.number().int().positive().nullable().optional(),
    patronSaint: z.string().nullable().optional(),
    patronSaintDate: z.string().nullable().optional(),
    contactEmail: z.string().email().nullable().optional(),
    contactPhone: z.string().nullable().optional(),
    website: z.string().url().nullable().optional(),
    verification: z.boolean().default(true)
  });

  type MonasteryFormValues = z.infer<typeof editMonasterySchema>;

  // Form state pentru editarea mănăstirii
  const form = useForm<MonasteryFormValues>({
    resolver: zodResolver(editMonasterySchema),
    defaultValues: {
      id: 0,
      name: "",
      region: "moldova",
      type: "monastery",
      city: "",
      county: "",
      description: "",
      shortDescription: "",
      foundedYear: null,
      patronSaint: "",
      patronSaintDate: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      verification: true
    }
  });

  // Verificare dacă utilizatorul este admin
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  // Filtrare și sortare mănăstiri
  const filteredMonasteries = monasteries?.filter((monastery: Monastery) => {
    // Filtrare după cuvinte cheie
    const matchesSearchQuery = searchQuery === "" || 
      monastery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monastery.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monastery.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monastery.county.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtrare după regiune
    const matchesRegion = regionFilter === "all" || monastery.region === regionFilter;

    // Filtrare după tip
    const matchesType = typeFilter === "all" || monastery.type === typeFilter;

    return matchesSearchQuery && matchesRegion && matchesType;
  }) || [];

  // Funcție pentru a deschide panoul lateral cu detalii despre mănăstire
  const handleShowDetails = (monastery: Monastery) => {
    setSelectedMonastery(monastery);
    setSidebarOpen(true);
  };

  // Funcție pentru confirmarea ștergerii unei mănăstiri
  const handleDeleteMonastery = (monasteryId: number) => {
    setMonasteryToDelete(monasteryId);
    setConfirmDialogOpen(true);
  };

  // Funcție pentru a deschide dialogul de editare al unei mănăstiri
  const handleEditMonastery = (monastery: Monastery) => {
    form.reset({
      id: monastery.id,
      name: monastery.name,
      region: monastery.region,
      type: monastery.type,
      city: monastery.city,
      county: monastery.county,
      description: monastery.description,
      shortDescription: monastery.shortDescription || "",
      foundedYear: monastery.foundedYear,
      patronSaint: monastery.patronSaint || "",
      patronSaintDate: monastery.patronSaintDate || "",
      contactEmail: monastery.contactEmail || "",
      contactPhone: monastery.contactPhone || "",
      website: monastery.website || "",
      verification: !!monastery.verification
    });
    setEditDialogOpen(true);
  };

  // Funcție pentru a trimite datele de editare a mănăstirii
  const onSubmitEdit = (data: MonasteryFormValues) => {
    updateMonasteryMutation.mutate(data);
  };

  // Obține numele regiunii formatat
  const getRegionName = (region: string) => {
    return formatRegionName(region);
  };

  // Obține numele tipului de mănăstire formatat
  const getTypeName = (type: string) => {
    switch (type) {
      case "monastery":
        return "Mănăstire";
      case "hermitage":
        return "Schit";
      case "church":
        return "Biserică";
      default:
        return type;
    }
  };

  // Funcție pentru a afișa badge-ul de verificare
  const getVerificationBadge = (verified: boolean | null) => {
    if (verified) {
      return (
        <Badge variant="default" className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verificat
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="ml-2">
          <Info className="h-3 w-3 mr-1" />
          Neverificat
        </Badge>
      );
    }
  };

  // Funcție pentru a reseta filtrele
  const resetFilters = () => {
    setSearchQuery("");
    setRegionFilter("");
    setTypeFilter("");
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestiune Mănăstiri</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adaugă Mănăstire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adaugă Mănăstire Nouă</DialogTitle>
                <DialogDescription>
                  Această funcționalitate va fi implementată în viitor.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Anulează
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtrare Mănăstiri</CardTitle>
            <CardDescription>
              Folosește opțiunile de mai jos pentru a filtra lista de mănăstiri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume, descriere, localitate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-3 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate regiunile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate regiunile</SelectItem>
                    <SelectItem value="moldova">Moldova</SelectItem>
                    <SelectItem value="bucovina">Bucovina</SelectItem>
                    <SelectItem value="muntenia">Muntenia</SelectItem>
                    <SelectItem value="oltenia">Oltenia</SelectItem>
                    <SelectItem value="transilvania">Transilvania</SelectItem>
                    <SelectItem value="maramures">Maramureș</SelectItem>
                    <SelectItem value="banat">Banat</SelectItem>
                    <SelectItem value="dobrogea">Dobrogea</SelectItem>
                    <SelectItem value="crisana">Crișana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate tipurile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate tipurile</SelectItem>
                    <SelectItem value="monastery">Mănăstiri</SelectItem>
                    <SelectItem value="hermitage">Schituri</SelectItem>
                    <SelectItem value="church">Biserici</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full md:w-auto"
              >
                Resetează filtre
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista Mănăstirilor</CardTitle>
            <CardDescription>
              {filteredMonasteries.length} mănăstiri găsite
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                A apărut o eroare la încărcarea mănăstirilor.
              </div>
            ) : filteredMonasteries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nu a fost găsită nicio mănăstire care să corespundă criteriilor de filtrare.
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nume</TableHead>
                      <TableHead>Regiune</TableHead>
                      <TableHead>Localitate</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMonasteries.map((monastery: Monastery) => (
                      <TableRow key={monastery.id}>
                        <TableCell className="font-medium">
                          {monastery.name}
                          {monastery.verification && (
                            <Badge variant="outline" className="ml-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificat
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getRegionName(monastery.region)}</TableCell>
                        <TableCell>{monastery.city}, {monastery.county}</TableCell>
                        <TableCell>{getTypeName(monastery.type)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleShowDetails(monastery)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Detalii
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditMonastery(monastery)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editează
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteMonastery(monastery.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Șterge
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmare pentru ștergere */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmă ștergerea</DialogTitle>
            <DialogDescription>
              Ești sigur că dorești să ștergi această mănăstire? Această acțiune nu poate fi anulată.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => monasteryToDelete && deleteMonasteryMutation.mutate(monasteryToDelete)}
              disabled={deleteMonasteryMutation.isPending}
            >
              {deleteMonasteryMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se șterge...
                </>
              ) : (
                <>Șterge</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru editarea mănăstirii */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editează Mănăstirea</DialogTitle>
            <DialogDescription>
              Modifică informațiile despre mănăstire folosind formularul de mai jos.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nume</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Numele mănăstirii" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tip</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează tipul" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monastery">Mănăstire</SelectItem>
                          <SelectItem value="hermitage">Schit</SelectItem>
                          <SelectItem value="church">Biserică</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regiune</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează regiunea" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="moldova">Moldova</SelectItem>
                          <SelectItem value="bucovina">Bucovina</SelectItem>
                          <SelectItem value="muntenia">Muntenia</SelectItem>
                          <SelectItem value="oltenia">Oltenia</SelectItem>
                          <SelectItem value="transilvania">Transilvania</SelectItem>
                          <SelectItem value="maramures">Maramureș</SelectItem>
                          <SelectItem value="banat">Banat</SelectItem>
                          <SelectItem value="dobrogea">Dobrogea</SelectItem>
                          <SelectItem value="crisana">Crișana</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localitate</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Localitatea" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Județ</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Județul" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patronSaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hram</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Hramul mănăstirii" 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patronSaintDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data hramului</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          placeholder="Data hramului" 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foundedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anul înființării</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Anul înființării" 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contact</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Email" 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon de contact</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Telefon" 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Website" 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="verification"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Verificat</FormLabel>
                        <FormDescription>
                          Marchează mănăstirea ca fiind verificată
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descriere</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descrierea mănăstirii" 
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descriere scurtă</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descriere scurtă (afișată în listări)" 
                          rows={2}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} type="button">
                  Anulează
                </Button>
                <Button type="submit" disabled={updateMonasteryMutation.isPending}>
                  {updateMonasteryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Se salvează...
                    </>
                  ) : (
                    <>Salvează</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Panou lateral pentru detalii mănăstire */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              {selectedMonastery?.name}
              {selectedMonastery?.verification && (
                <Badge variant="outline" className="ml-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verificat
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              {getTypeName(selectedMonastery?.type || "monastery")} • {getRegionName(selectedMonastery?.region || "moldova")}
            </SheetDescription>
          </SheetHeader>
          
          {selectedMonastery && (
            <div className="mt-6 space-y-6">
              {selectedMonastery.coverImage && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedMonastery.coverImage} 
                    alt={selectedMonastery.name} 
                    className="w-full h-48 object-cover" 
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium">Descriere</h3>
                <p className="mt-2 text-sm text-gray-600">{selectedMonastery.description}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium">Informații generale</h3>
                <dl className="mt-2 divide-y">
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Localitate</dt>
                    <dd className="text-sm text-right">{selectedMonastery.city}</dd>
                  </div>
                  <div className="py-2 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Județ</dt>
                    <dd className="text-sm text-right">{selectedMonastery.county}</dd>
                  </div>
                  {selectedMonastery.patronSaint && (
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Hram</dt>
                      <dd className="text-sm text-right">{selectedMonastery.patronSaint}</dd>
                    </div>
                  )}
                  {selectedMonastery.patronSaintDate && (
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Data hramului</dt>
                      <dd className="text-sm text-right">
                        {new Date(selectedMonastery.patronSaintDate).toLocaleDateString('ro-RO')}
                      </dd>
                    </div>
                  )}
                  {selectedMonastery.foundedYear && (
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Anul înființării</dt>
                      <dd className="text-sm text-right">{selectedMonastery.foundedYear}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {(selectedMonastery.contactEmail || selectedMonastery.contactPhone || selectedMonastery.website) && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium">Contact</h3>
                  <dl className="mt-2 divide-y">
                    {selectedMonastery.contactEmail && (
                      <div className="py-2 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-right">
                          <a 
                            href={`mailto:${selectedMonastery.contactEmail}`} 
                            className="text-primary hover:underline"
                          >
                            {selectedMonastery.contactEmail}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selectedMonastery.contactPhone && (
                      <div className="py-2 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                        <dd className="text-sm text-right">
                          <a 
                            href={`tel:${selectedMonastery.contactPhone}`} 
                            className="text-primary hover:underline"
                          >
                            {selectedMonastery.contactPhone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selectedMonastery.website && (
                      <div className="py-2 flex justify-between">
                        <dt className="text-sm font-medium text-gray-500">Website</dt>
                        <dd className="text-sm text-right">
                          <a 
                            href={selectedMonastery.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            {selectedMonastery.website}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {selectedMonastery.images && selectedMonastery.images.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-2">Galerie</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMonastery.images.map((image, index) => (
                      <div key={index} className="rounded-lg overflow-hidden h-32">
                        <img 
                          src={image} 
                          alt={`${selectedMonastery.name} - ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => handleEditMonastery(selectedMonastery)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editează
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteMonastery(selectedMonastery.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Șterge
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}