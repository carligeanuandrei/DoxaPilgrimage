import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
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
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search, Eye, Utensils, Tag, Calendar } from "lucide-react";

// Definirea tipurilor pentru rețete
type RecipeType = "de_post" | "cu_dezlegare_la_ulei" | "cu_dezlegare_la_vin" | "cu_dezlegare_la_peste" | "cu_dezlegare_completa" | "manastireasca";
type RecipeCategory = "supe_si_ciorbe" | "aperitive" | "feluri_principale" | "garnituri" | "salate" | "deserturi" | "conserve" | "bauturi" | "paine_si_panificatie";
type RecipeDifficulty = "incepator" | "mediu" | "avansat";
type RecipeTime = "sub_30_minute" | "30_60_minute" | "peste_60_minute";
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

// Interfețe pentru datele rețetelor
interface FastingRecipe {
  id: number;
  title: string;
  slug: string;
  description: string;
  recipeType: RecipeType;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  preparationTime: RecipeTime;
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  calories?: number;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  isFeatured: boolean;
  monasteryId?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt?: string;
  source?: string;
  recommendedForDays?: DayOfWeek[];
  occasionTags?: string[];
  feastDay?: string;
}

// Interfața pentru formularul de rețetă
interface RecipeFormData {
  title: string;
  description: string;
  recipeType: RecipeType;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  preparationTime: RecipeTime;
  preparationMinutes: number;
  cookingMinutes: number;
  servings: number;
  calories?: number;
  ingredients: string[];
  steps: string[];
  imageUrl?: string;
  isFeatured: boolean;
  monasteryId?: number;
  source?: string;
  recommendedForDays?: DayOfWeek[];
  occasionTags?: string[];
  feastDay?: string;
}

export default function FastingRecipesAdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State pentru căutare și filtrare
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  
  // State pentru editare/adăugare
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<FastingRecipe | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State pentru formularul de rețetă
  const [formData, setFormData] = useState<RecipeFormData>({
    title: "",
    description: "",
    recipeType: "de_post",
    category: "feluri_principale",
    difficulty: "mediu",
    preparationTime: "30_60_minute",
    preparationMinutes: 15,
    cookingMinutes: 30,
    servings: 4,
    ingredients: [""],
    steps: [""],
    isFeatured: false,
    recommendedForDays: []
  });
  
  // Fetch pentru toate rețetele
  const { data: recipes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/fasting-recipes'],
    queryFn: async () => {
      const response = await fetch('/api/fasting-recipes');
      if (!response.ok) {
        throw new Error('Eroare la încărcarea rețetelor');
      }
      return response.json();
    }
  });
  
  // Mutație pentru adăugarea unei rețete
  const createRecipeMutation = useMutation({
    mutationFn: async (data: RecipeFormData) => {
      const response = await fetch('/api/fasting-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la crearea rețetei');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({
        title: "Succes!",
        description: "Rețeta a fost adăugată cu succes.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutație pentru actualizarea unei rețete
  const updateRecipeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<RecipeFormData> }) => {
      const response = await fetch(`/api/fasting-recipes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la actualizarea rețetei');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      toast({
        title: "Succes!",
        description: "Rețeta a fost actualizată cu succes.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutație pentru ștergerea unei rețete
  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/fasting-recipes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la ștergerea rețetei');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      toast({
        title: "Succes!",
        description: "Rețeta a fost ștearsă cu succes.",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handler pentru deschiderea dialogului de adăugare
  const handleAddRecipe = () => {
    setCurrentRecipe(null);
    setIsEditMode(false);
    setFormData({
      title: "",
      description: "",
      recipeType: "de_post",
      category: "feluri_principale",
      difficulty: "mediu",
      preparationTime: "30_60_minute",
      preparationMinutes: 15,
      cookingMinutes: 30,
      servings: 4,
      ingredients: [""],
      steps: [""],
      isFeatured: false,
      recommendedForDays: []
    });
    setIsDialogOpen(true);
  };
  
  // Handler pentru deschiderea dialogului de editare
  const handleEditRecipe = (recipe: FastingRecipe) => {
    setCurrentRecipe(recipe);
    setIsEditMode(true);
    setFormData({
      title: recipe.title,
      description: recipe.description,
      recipeType: recipe.recipeType,
      category: recipe.category,
      difficulty: recipe.difficulty,
      preparationTime: recipe.preparationTime,
      preparationMinutes: recipe.preparationMinutes,
      cookingMinutes: recipe.cookingMinutes,
      servings: recipe.servings,
      calories: recipe.calories,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      imageUrl: recipe.imageUrl,
      isFeatured: recipe.isFeatured,
      monasteryId: recipe.monasteryId,
      source: recipe.source,
      recommendedForDays: recipe.recommendedForDays,
      occasionTags: recipe.occasionTags,
      feastDay: recipe.feastDay
    });
    setIsDialogOpen(true);
  };
  
  // Handler pentru deschiderea dialogului de ștergere
  const handleDeleteConfirm = (recipe: FastingRecipe) => {
    setCurrentRecipe(recipe);
    setIsDeleteDialogOpen(true);
  };
  
  // Handler pentru submiterea formularului
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validare simplă
    if (!formData.title || !formData.description) {
      toast({
        title: "Eroare",
        description: "Titlul și descrierea sunt obligatorii",
        variant: "destructive",
      });
      return;
    }
    
    // Crearea unui slug din titlu
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    // Trimite datele în funcție de mod (edit/add)
    if (isEditMode && currentRecipe) {
      updateRecipeMutation.mutate({ 
        id: currentRecipe.id, 
        data: { ...formData, slug } 
      });
    } else {
      createRecipeMutation.mutate({ ...formData, slug });
    }
  };
  
  // Handler pentru input de tip array (ingrediente, pași)
  const handleArrayInput = (field: 'ingredients' | 'steps', idx: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[idx] = value;
    setFormData({ ...formData, [field]: newArray });
  };
  
  // Handler pentru adăugarea unui element în array
  const addArrayItem = (field: 'ingredients' | 'steps') => {
    setFormData({ 
      ...formData, 
      [field]: [...formData[field], ""] 
    });
  };
  
  // Handler pentru ștergerea unui element din array
  const removeArrayItem = (field: 'ingredients' | 'steps', idx: number) => {
    if (formData[field].length <= 1) return;
    const newArray = formData[field].filter((_, i) => i !== idx);
    setFormData({ ...formData, [field]: newArray });
  };
  
  // Handler pentru toggle day of week
  const toggleDayOfWeek = (day: DayOfWeek) => {
    const days = formData.recommendedForDays || [];
    if (days.includes(day)) {
      setFormData({
        ...formData,
        recommendedForDays: days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        recommendedForDays: [...days, day]
      });
    }
  };
  
  // Verificare dacă utilizatorul este admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Nu aveți permisiunile necesare pentru a accesa această pagină.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);
  
  // Filtrarea rețetelor în funcție de criteriile de căutare
  const filteredRecipes = recipes ? recipes.filter((recipe: FastingRecipe) => {
    const matchesSearch = searchTerm === "" || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "" || recipe.recipeType === filterType;
    const matchesCategory = filterCategory === "" || recipe.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  }) : [];
  
  // Traduceri pentru tipurile de rețete
  const recipeTypeTranslations = {
    de_post: "De post",
    cu_dezlegare_la_ulei: "Cu dezlegare la ulei",
    cu_dezlegare_la_vin: "Cu dezlegare la vin", 
    cu_dezlegare_la_peste: "Cu dezlegare la pește",
    cu_dezlegare_completa: "Cu dezlegare completă",
    manastireasca: "Mânăstirească"
  };
  
  // Traduceri pentru categorii
  const recipeCategoryTranslations = {
    supe_si_ciorbe: "Supe și ciorbe",
    aperitive: "Aperitive",
    feluri_principale: "Feluri principale",
    garnituri: "Garnituri",
    salate: "Salate",
    deserturi: "Deserturi",
    conserve: "Conserve",
    bauturi: "Băuturi",
    paine_si_panificatie: "Pâine și panificație"
  };
  
  // Traduceri pentru nivelul de dificultate
  const recipeDifficultyTranslations = {
    incepator: "Începător",
    mediu: "Mediu",
    avansat: "Avansat"
  };
  
  // Traduceri pentru timpul de preparare
  const recipeTimeTranslations = {
    sub_30_minute: "Sub 30 minute",
    "30_60_minute": "30-60 minute",
    peste_60_minute: "Peste 60 minute"
  };
  
  // Traduceri pentru zilele săptămânii
  const daysOfWeekTranslations = {
    monday: "Luni",
    tuesday: "Marți",
    wednesday: "Miercuri",
    thursday: "Joi",
    friday: "Vineri",
    saturday: "Sâmbătă",
    sunday: "Duminică"
  };
  
  // Verificăm dacă user-ul este autentificat și este admin
  if (!user || user.role !== 'admin') {
    return <div className="container mx-auto p-4 text-center">Verificare autentificare...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestiune Rețete de Post</h1>
      
      {/* Filtre și căutare */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Caută rețete..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Tip rețetă" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate tipurile</SelectItem>
              {Object.entries(recipeTypeTranslations).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate categoriile</SelectItem>
              {Object.entries(recipeCategoryTranslations).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleAddRecipe} className="w-full md:w-auto whitespace-nowrap">
          <Plus className="mr-2 h-4 w-4" /> Adaugă rețetă
        </Button>
      </div>
      
      {/* Tabela de rețete */}
      <div className="bg-white rounded-md shadow">
        {isLoading ? (
          <div className="p-8 text-center">Încărcare rețete...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">
            {error instanceof Error ? error.message : "Eroare la încărcarea rețetelor"}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-8 text-center">Nu există rețete care să corespundă criteriilor de căutare.</div>
        ) : (
          <Table>
            <TableCaption>Lista rețetelor de post disponibile</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Titlu</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Promovat</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((recipe: FastingRecipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.title}</TableCell>
                  <TableCell>
                    {recipeTypeTranslations[recipe.recipeType as keyof typeof recipeTypeTranslations]}
                  </TableCell>
                  <TableCell>
                    {recipeCategoryTranslations[recipe.category as keyof typeof recipeCategoryTranslations]}
                  </TableCell>
                  <TableCell>
                    {recipe.isFeatured ? (
                      <Badge variant="default">Da</Badge>
                    ) : (
                      <Badge variant="outline">Nu</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`/fasting-recipes/${recipe.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteConfirm(recipe)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      {/* Dialog pentru adăugare/editare */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Editare rețetă: ${currentRecipe?.title}` : "Adăugare rețetă nouă"}
            </DialogTitle>
            <DialogDescription>
              Completați toate câmpurile necesare pentru {isEditMode ? "actualizarea" : "crearea"} rețetei.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Informații de bază</TabsTrigger>
                <TabsTrigger value="ingredients">Ingrediente și pași</TabsTrigger>
                <TabsTrigger value="advanced">Opțiuni avansate</TabsTrigger>
              </TabsList>
              
              {/* Tab pentru informații de bază */}
              <TabsContent value="basic">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="title">Titlu rețetă *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Introduceți titlul rețetei"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descriere *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Introduceți o scurtă descriere a rețetei"
                        required
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipeType">Tip de rețetă</Label>
                      <Select 
                        value={formData.recipeType} 
                        onValueChange={(value) => setFormData({ ...formData, recipeType: value as RecipeType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați tipul" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(recipeTypeTranslations).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Categorie</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value as RecipeCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(recipeCategoryTranslations).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="difficulty">Nivel de dificultate</Label>
                      <Select 
                        value={formData.difficulty} 
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value as RecipeDifficulty })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați dificultatea" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(recipeDifficultyTranslations).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="preparationTime">Timp de preparare</Label>
                      <Select 
                        value={formData.preparationTime} 
                        onValueChange={(value) => setFormData({ ...formData, preparationTime: value as RecipeTime })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selectați timpul" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(recipeTimeTranslations).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="preparationMinutes">Minute preparare</Label>
                      <Input
                        id="preparationMinutes"
                        type="number"
                        min="0"
                        value={formData.preparationMinutes}
                        onChange={(e) => setFormData({ ...formData, preparationMinutes: Number(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cookingMinutes">Minute gătire</Label>
                      <Input
                        id="cookingMinutes"
                        type="number"
                        min="0"
                        value={formData.cookingMinutes}
                        onChange={(e) => setFormData({ ...formData, cookingMinutes: Number(e.target.value) })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="servings">Porții</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">Calorii (per porție)</Label>
                      <Input
                        id="calories"
                        type="number"
                        min="0"
                        value={formData.calories || ""}
                        onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) || undefined })}
                        placeholder="Opțional"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="imageUrl">URL Imagine</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl || ""}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="URL imagine rețetă (opțional)"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isFeatured" 
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, isFeatured: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="isFeatured"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Rețetă promovată/recomandată
                    </label>
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab pentru ingrediente și pași */}
              <TabsContent value="ingredients">
                <div className="grid gap-4 py-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Ingrediente</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('ingredients')}>
                        <Plus className="h-4 w-4 mr-1" /> Adaugă ingredient
                      </Button>
                    </div>
                    
                    {formData.ingredients.map((ingredient, idx) => (
                      <div key={`ingredient-${idx}`} className="flex items-center space-x-2 mb-2">
                        <Input
                          value={ingredient}
                          onChange={(e) => handleArrayInput('ingredients', idx, e.target.value)}
                          placeholder={`Ingredient ${idx + 1}`}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeArrayItem('ingredients', idx)}
                          disabled={formData.ingredients.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label>Pași de preparare</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('steps')}>
                        <Plus className="h-4 w-4 mr-1" /> Adaugă pas
                      </Button>
                    </div>
                    
                    {formData.steps.map((step, idx) => (
                      <div key={`step-${idx}`} className="flex items-start space-x-2 mb-2">
                        <div className="pt-2 font-bold">{idx + 1}.</div>
                        <Textarea
                          value={step}
                          onChange={(e) => handleArrayInput('steps', idx, e.target.value)}
                          placeholder={`Descriere pas ${idx + 1}`}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeArrayItem('steps', idx)}
                          disabled={formData.steps.length <= 1}
                          className="mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Tab pentru opțiuni avansate */}
              <TabsContent value="advanced">
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="source">Sursa rețetei</Label>
                    <Input
                      id="source"
                      value={formData.source || ""}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Nume autor/carte/website (opțional)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="monasteryId">ID Mănăstire asociată</Label>
                    <Input
                      id="monasteryId"
                      type="number"
                      min="0"
                      value={formData.monasteryId || ""}
                      onChange={(e) => setFormData({ ...formData, monasteryId: Number(e.target.value) || undefined })}
                      placeholder="ID mănăstire (opțional)"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="feastDay">Zi de sărbătoare asociată</Label>
                    <Input
                      id="feastDay"
                      type="date"
                      value={formData.feastDay || ""}
                      onChange={(e) => setFormData({ ...formData, feastDay: e.target.value || undefined })}
                      placeholder="Data sărbătorii (opțional)"
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Zile recomandate</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(daysOfWeekTranslations).map(([day, label]) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day}`} 
                            checked={(formData.recommendedForDays || []).includes(day as DayOfWeek)}
                            onCheckedChange={() => toggleDayOfWeek(day as DayOfWeek)}
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="occasionTags">Etichete pentru ocazii speciale</Label>
                    <Input
                      id="occasionTags"
                      value={(formData.occasionTags || []).join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        setFormData({ ...formData, occasionTags: tags });
                      }}
                      placeholder="Separă etichetele prin virgule (ex: Paște, Crăciun, Post Mare)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separă etichetele prin virgule. Exemple: Paște, Crăciun, Post Mare
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={createRecipeMutation.isPending || updateRecipeMutation.isPending}
              >
                {(createRecipeMutation.isPending || updateRecipeMutation.isPending) ? (
                  <>Procesare...</>
                ) : (
                  <>{isEditMode ? "Actualizează" : "Adaugă"} rețeta</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pentru confirmare ștergere */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmați ștergerea?</AlertDialogTitle>
            <AlertDialogDescription>
              Sunteți sigur că doriți să ștergeți rețeta "{currentRecipe?.title}"? 
              Această acțiune este permanentă și nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentRecipe && deleteRecipeMutation.mutate(currentRecipe.id)}
              disabled={deleteRecipeMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteRecipeMutation.isPending ? "Ștergere..." : "Șterge definitiv"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}