import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { z } from "zod";
import { Pilgrimage } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// Definim schema de filtrare
const filterSchema = z.object({
  location: z.string().optional(),
  month: z.string().optional(),
  saint: z.string().optional(),
  transportation: z.string().optional(),
  guide: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

type FilterProps = {
  onFilterChange: (filters: Partial<FilterValues>) => void;
  initialFilters?: Partial<FilterValues>;
  className?: string;
};

// Lista de luni în română
const months = [
  { value: "Ianuarie", label: "Ianuarie" },
  { value: "Februarie", label: "Februarie" },
  { value: "Martie", label: "Martie" },
  { value: "Aprilie", label: "Aprilie" },
  { value: "Mai", label: "Mai" },
  { value: "Iunie", label: "Iunie" },
  { value: "Iulie", label: "Iulie" },
  { value: "August", label: "August" },
  { value: "Septembrie", label: "Septembrie" },
  { value: "Octombrie", label: "Octombrie" },
  { value: "Noiembrie", label: "Noiembrie" },
  { value: "Decembrie", label: "Decembrie" },
];

export default function PilgrimageFilterForm({ onFilterChange, initialFilters = {}, className }: FilterProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Obținem date pentru autocompletare
  const { data: pilgrimages } = useQuery<Pilgrimage[]>({
    queryKey: ["/api/pilgrimages"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Extrage opțiuni unice din pelerinaje
  const uniqueLocations = pilgrimages 
    ? [...new Set(pilgrimages.map(p => p.location))].sort() 
    : [];
    
  const uniqueSaints = pilgrimages 
    ? [...new Set(pilgrimages.map(p => p.saint).filter(Boolean))].sort() 
    : [];
    
  const uniqueTransportation = pilgrimages 
    ? [...new Set(pilgrimages.map(p => p.transportation))].sort() 
    : [];
    
  const uniqueGuides = pilgrimages 
    ? [...new Set(pilgrimages.map(p => p.guide))].sort() 
    : [];
  
  // Inițializăm formularul
  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: initialFilters || {
      location: "",
      month: "",
      saint: "",
      transportation: "",
      guide: "",
      minPrice: "",
      maxPrice: "",
    },
  });
  
  // Când se schimbă un câmp, adăugăm/eliminăm din filtrele active
  const updateActiveFilters = (name: string, value: any) => {
    if (value && value !== "" && value !== null) {
      if (!activeFilters.includes(name)) {
        setActiveFilters([...activeFilters, name]);
      }
    } else {
      setActiveFilters(activeFilters.filter(f => f !== name));
    }
  };
  
  // Resetăm un filtru specific
  const resetFilter = (name: keyof FilterValues) => {
    form.setValue(name, name === 'startDate' || name === 'endDate' ? undefined : "");
    updateActiveFilters(name, "");
    
    // Actualizăm filtrele
    const currentValues = form.getValues();
    const newFilters = { ...currentValues, [name]: undefined };
    onFilterChange(newFilters);
  };
  
  // Resetăm toate filtrele
  const resetAllFilters = () => {
    form.reset({
      location: "",
      month: "",
      saint: "",
      transportation: "",
      guide: "",
      minPrice: "",
      maxPrice: "",
      startDate: undefined,
      endDate: undefined,
    });
    setActiveFilters([]);
    onFilterChange({});
  };
  
  // La submit, trimitem filtrele către componenta părinte
  const onSubmit = (values: FilterValues) => {
    // Eliminăm câmpurile goale pentru a nu include filtre inutile
    const cleanedFilters = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        acc[key as keyof FilterValues] = value;
      }
      return acc;
    }, {} as Partial<FilterValues>);
    
    onFilterChange(cleanedFilters);
  };

  return (
    <div className={cn("border rounded-lg p-4 bg-card", className)}>
      <h3 className="text-lg font-medium mb-4">Filtrează pelerinajele</h3>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary"
              className="pl-2 flex items-center gap-1"
            >
              {filter === "minPrice" ? "Preț minim" :
               filter === "maxPrice" ? "Preț maxim" :
               filter === "startDate" ? "Data început" :
               filter === "endDate" ? "Data sfârșit" :
               filter}
              <Button
                variant="ghost"
                className="h-4 w-4 p-0"
                onClick={() => resetFilter(filter as keyof FilterValues)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetAllFilters}
            className="ml-auto text-xs"
          >
            Resetează toate
          </Button>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Locație */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locație</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateActiveFilters("location", value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege locația" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Toate locațiile</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Luna */}
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luna</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateActiveFilters("month", value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege luna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Toate lunile</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Sfânt */}
            <FormField
              control={form.control}
              name="saint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sfânt/Sărbătoare</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateActiveFilters("saint", value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege sfântul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Toți sfinții</SelectItem>
                      {uniqueSaints.map((saint) => (
                        <SelectItem key={saint} value={saint}>
                          {saint}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Transport */}
            <FormField
              control={form.control}
              name="transportation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transport</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateActiveFilters("transportation", value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege transportul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Toate tipurile</SelectItem>
                      {uniqueTransportation.map((transport) => (
                        <SelectItem key={transport} value={transport}>
                          {transport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Ghid */}
            <FormField
              control={form.control}
              name="guide"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghid spiritual</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateActiveFilters("guide", value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Alege ghidul" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Toți ghizii</SelectItem>
                      {uniqueGuides.map((guide) => (
                        <SelectItem key={guide} value={guide}>
                          {guide}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Interval de preț */}
            <div className="space-y-2">
              <FormLabel>Interval de preț</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="minPrice"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Min"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateActiveFilters("minPrice", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxPrice"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Max"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            updateActiveFilters("maxPrice", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Data început */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data început</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ro })
                          ) : (
                            <span>Alege data început</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          updateActiveFilters("startDate", date);
                        }}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Data sfârșit */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data sfârșit</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ro })
                          ) : (
                            <span>Alege data sfârșit</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          updateActiveFilters("endDate", date);
                        }}
                        disabled={(date) => {
                          const startDate = form.getValues().startDate;
                          return startDate ? date < startDate : date < new Date();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">Filtrează</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}