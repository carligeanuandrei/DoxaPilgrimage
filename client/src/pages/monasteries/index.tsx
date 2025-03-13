import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Monastery } from "@shared/schema";
import { MonasteriesList } from "@/components/monastery/MonasteriesList";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { formatRegionName } from "@/lib/format-utils";

export default function MonasteriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const { isLoading, data: monasteries = [] } = useQuery<Monastery[]>({
    queryKey: ["/api/monasteries"],
  });

  useEffect(() => {
    document.title = "Mănăstiri și Schituri | Doxa";
  }, []);

  // Filtrăm mănăstirile în funcție de termenii de căutare
  const filteredMonasteries = monasteries.filter((monastery) => {
    const matchesSearch =
      searchTerm === "" ||
      monastery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monastery.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monastery.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monastery.county.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion = selectedRegion === "" || monastery.region === selectedRegion;
    const matchesType = selectedType === "" || monastery.type === selectedType;

    return matchesSearch && matchesRegion && matchesType;
  });

  // Lista tuturor regiunilor disponibile
  const regions = [
    { value: "moldova", label: "Moldova" },
    { value: "bucovina", label: "Bucovina" },
    { value: "maramures", label: "Maramureș" },
    { value: "transilvania", label: "Transilvania" },
    { value: "banat", label: "Banat" },
    { value: "crisana", label: "Crișana" },
    { value: "oltenia", label: "Oltenia" },
    { value: "muntenia", label: "Muntenia" },
    { value: "dobrogea", label: "Dobrogea" },
  ];

  // Lista tipurilor de așezăminte
  const types = [
    { value: "monastery", label: "Mănăstire" },
    { value: "hermitage", label: "Schit" },
    { value: "church", label: "Biserică" }
  ];

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-center">
          Mănăstiri și Schituri Ortodoxe
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
          Descoperă comori spirituale, informații despre hramuri, accesibilitate și facilități din cele mai importante lăcașuri de cult
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Caută după nume, locație, hram..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Toate regiunile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate regiunile</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Toate tipurile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toate tipurile</SelectItem>
            {types.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="region" className="w-full">
        <TabsList className="mb-6 mx-auto">
          <TabsTrigger value="region">Regiuni</TabsTrigger>
          <TabsTrigger value="all">Toate</TabsTrigger>
        </TabsList>
        <TabsContent value="region">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <MonasteriesList monasteries={filteredMonasteries} groupByRegion={true} />
          )}
        </TabsContent>
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <MonasteriesList monasteries={filteredMonasteries} groupByRegion={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}