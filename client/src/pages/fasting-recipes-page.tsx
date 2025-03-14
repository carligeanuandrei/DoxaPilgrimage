import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Loader2, Filter, Search } from 'lucide-react';
import { FastingRecipe } from '../../shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Componenta pentru filtrele de rețete
const RecipeFilters = ({ onFilterChange }) => {
  const [recipeType, setRecipeType] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');

  useEffect(() => {
    onFilterChange({
      recipeType,
      category,
      difficulty,
      day: dayOfWeek
    });
  }, [recipeType, category, difficulty, dayOfWeek, onFilterChange]);

  const handleClearFilters = () => {
    setRecipeType('');
    setCategory('');
    setDifficulty('');
    setDayOfWeek('');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtrează rețetele
        </h3>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Resetează filtrele
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tip de post</label>
          <Select value={recipeType} onValueChange={setRecipeType}>
            <SelectTrigger>
              <SelectValue placeholder="Toate rețetele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate rețetele</SelectItem>
              <SelectItem value="de_post">De post complet</SelectItem>
              <SelectItem value="cu_dezlegare_la_ulei">Cu dezlegare la ulei</SelectItem>
              <SelectItem value="cu_dezlegare_la_vin">Cu dezlegare la vin</SelectItem>
              <SelectItem value="cu_dezlegare_la_peste">Cu dezlegare la pește</SelectItem>
              <SelectItem value="cu_dezlegare_completa">Cu dezlegare completă</SelectItem>
              <SelectItem value="manastireasca">Mâncare mănăstirească</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categorie</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toate categoriile" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toate categoriile</SelectItem>
              <SelectItem value="supe_si_ciorbe">Supe și ciorbe</SelectItem>
              <SelectItem value="aperitive">Aperitive</SelectItem>
              <SelectItem value="feluri_principale">Feluri principale</SelectItem>
              <SelectItem value="garnituri">Garnituri</SelectItem>
              <SelectItem value="salate">Salate</SelectItem>
              <SelectItem value="deserturi">Deserturi</SelectItem>
              <SelectItem value="conserve">Conserve</SelectItem>
              <SelectItem value="bauturi">Băuturi</SelectItem>
              <SelectItem value="paine_si_panificatie">Pâine și panificație</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dificultate</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Orice dificultate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Orice dificultate</SelectItem>
              <SelectItem value="incepator">Începător</SelectItem>
              <SelectItem value="mediu">Mediu</SelectItem>
              <SelectItem value="avansat">Avansat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zi recomandată</label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger>
              <SelectValue placeholder="Orice zi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Orice zi</SelectItem>
              <SelectItem value="monday">Luni</SelectItem>
              <SelectItem value="tuesday">Marți</SelectItem>
              <SelectItem value="wednesday">Miercuri</SelectItem>
              <SelectItem value="thursday">Joi</SelectItem>
              <SelectItem value="friday">Vineri</SelectItem>
              <SelectItem value="saturday">Sâmbătă</SelectItem>
              <SelectItem value="sunday">Duminică</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

// Componenta pentru un card individual de rețetă
const RecipeCard = ({ recipe }: { recipe: FastingRecipe }) => {
  // Funcție pentru a traduce tipul de rețetă în română
  const getRecipeTypeLabel = (type: string) => {
    const typeMap = {
      'de_post': 'Post complet',
      'cu_dezlegare_la_ulei': 'Cu dezlegare la ulei',
      'cu_dezlegare_la_vin': 'Cu dezlegare la vin',
      'cu_dezlegare_la_peste': 'Cu dezlegare la pește',
      'cu_dezlegare_completa': 'Cu dezlegare completă',
      'manastireasca': 'Mâncare mănăstirească'
    };
    return typeMap[type] || type;
  };

  // Funcție pentru a traduce categoria în română
  const getCategoryLabel = (category: string) => {
    const categoryMap = {
      'supe_si_ciorbe': 'Supe și ciorbe',
      'aperitive': 'Aperitive',
      'feluri_principale': 'Feluri principale',
      'garnituri': 'Garnituri',
      'salate': 'Salate',
      'deserturi': 'Deserturi',
      'conserve': 'Conserve',
      'bauturi': 'Băuturi',
      'paine_si_panificatie': 'Pâine și panificație'
    };
    return categoryMap[category] || category;
  };

  // Funcție pentru a traduce dificultatea în română
  const getDifficultyLabel = (difficulty: string) => {
    const difficultyMap = {
      'incepator': 'Începător',
      'mediu': 'Mediu',
      'avansat': 'Avansat'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  // Calcularea timpului total de pregătire
  const totalTime = recipe.preparationMinutes + recipe.cookingMinutes;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Fără imagine</p>
          </div>
        )}
        {recipe.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
            Recomandată
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{recipe.title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-2 mt-1">
          <Badge variant="outline">{getRecipeTypeLabel(recipe.recipeType)}</Badge>
          <Badge variant="outline">{getCategoryLabel(recipe.category)}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{recipe.description}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Timp: {totalTime} min</span>
          <span>Porții: {recipe.servings}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Link to={`/retete-de-post/${recipe.slug}`}>
          <Button className="w-full">Vezi rețeta</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Pagina principală pentru rețete de post
export default function FastingRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('toate');
  const [filters, setFilters] = useState({});

  // Obținem toate rețetele de post
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['/api/fasting-recipes', filters],
    enabled: activeTab === 'toate' || activeTab === 'filtrate'
  });

  // Obținem rețetele promovate/recomandate
  const { data: featuredRecipes, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['/api/fasting-recipes/featured'],
    enabled: activeTab === 'recomandate'
  });

  // Filtrare după query-ul de căutare
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipes, searchQuery]);

  // Gestionarea schimbării filtrelor
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (Object.values(newFilters).some(value => value)) {
      setActiveTab('filtrate');
    }
  };

  // Gestionarea schimbării căutării
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Decidem ce rețete să afișăm în funcție de tabul activ
  const recipesToShow = activeTab === 'recomandate' 
    ? featuredRecipes || [] 
    : filteredRecipes;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Rețete de Post</h1>
      <p className="text-gray-600 text-center mb-8">
        Descoperiți rețete delicioase pentru perioadele de post ortodox
      </p>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Caută rețete..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="toate" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="toate">Toate rețetele</TabsTrigger>
          <TabsTrigger value="recomandate">Recomandate</TabsTrigger>
          <TabsTrigger value="filtrate">Filtrare avansată</TabsTrigger>
        </TabsList>

        <TabsContent value="toate">
          {/* Nu afișăm filtrele, doar lista cu toate rețetele */}
        </TabsContent>

        <TabsContent value="recomandate">
          {/* Nu afișăm filtrele, doar lista cu rețetele recomandate */}
        </TabsContent>

        <TabsContent value="filtrate">
          <RecipeFilters onFilterChange={handleFilterChange} />
        </TabsContent>
      </Tabs>

      {(isLoading || isFeaturedLoading) && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Se încarcă rețetele...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 p-8">
          <p>A apărut o eroare la încărcarea rețetelor.</p>
          <p className="text-sm">Vă rugăm încercați din nou mai târziu.</p>
        </div>
      )}

      {!isLoading && !isFeaturedLoading && recipesToShow?.length === 0 && (
        <div className="text-center p-8">
          <p className="text-gray-500">Nu am găsit rețete care să corespundă criteriilor de căutare.</p>
          {activeTab === 'filtrate' && (
            <p className="text-sm text-gray-500 mt-2">Încercați să schimbați filtrele sau să resetați căutarea.</p>
          )}
        </div>
      )}

      {/* Secțiunea pentru rețetele recomandate pentru zilele de miercuri și vineri */}
      {activeTab === 'toate' && recipes?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Recomandate pentru zile de post</h2>
          <p className="text-gray-600 mb-6">
            Rețete speciale pentru zilele de miercuri și vineri
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes
              .filter(recipe => 
                recipe.recommendedForDays?.includes('wednesday') || 
                recipe.recommendedForDays?.includes('friday')
              )
              .slice(0, 3)
              .map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
          </div>
          {recipes.filter(recipe => 
            recipe.recommendedForDays?.includes('wednesday') || 
            recipe.recommendedForDays?.includes('friday')
          ).length === 0 && (
            <p className="text-center text-gray-500 p-4">
              Nu există rețete recomandate pentru zilele de miercuri și vineri.
            </p>
          )}
        </div>
      )}

      {/* Afișarea tuturor rețetelor */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-6">
          {activeTab === 'recomandate' 
            ? 'Rețete recomandate'
            : activeTab === 'filtrate' && Object.values(filters).some(v => v)
              ? 'Rețete filtrate'
              : 'Toate rețetele de post'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipesToShow?.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>

      {/* Secțiunea de informații despre post */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Despre postul ortodox</h2>
        <p className="mb-4">
          În tradiția ortodoxă, postul reprezintă o perioadă de abstinență de la anumite alimente de origine 
          animală și de intensificare a vieții spirituale. Principalele perioade de post sunt:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Postul Paștelui (Postul Mare) - cel mai lung și mai strict</li>
          <li>Postul Nașterii Domnului (Postul Crăciunului)</li>
          <li>Postul Sfinților Apostoli Petru și Pavel</li>
          <li>Postul Adormirii Maicii Domnului</li>
          <li>Miercurea și vinerea de peste an</li>
        </ul>
        <p>
          Rețetele prezentate aici respectă diferitele tipuri de post, de la cel complet (fără produse 
          animale) până la cele cu dezlegare la ulei, vin sau pește.
        </p>
      </div>
    </div>
  );
}