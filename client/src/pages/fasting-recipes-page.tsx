import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Loader2, Filter, Search, Utensils, Clock, ChefHat, 
  BookOpen, Coffee, Flame, Award, Calendar, Info, X,
  Archive
} from 'lucide-react';
import { type FastingRecipe } from '../../shared/schema.ts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  PieChartIcon, MixerHorizontalIcon, CookieIcon, 
  RocketIcon, TimerIcon, MagnifyingGlassIcon
} from '@radix-ui/react-icons';

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

// Componenta pentru categoria cu pictogramă
const CategoryIcon = ({ category, onClick, isActive = false }) => {
  // Mapare categorii la pictograme și etichete
  const categoryInfo = {
    'supe_si_ciorbe': { icon: <Coffee className="h-5 w-5" />, label: 'Supe și ciorbe' },
    'aperitive': { icon: <PieChartIcon className="h-5 w-5" />, label: 'Aperitive' },
    'feluri_principale': { icon: <Utensils className="h-5 w-5" />, label: 'Feluri principale' },
    'garnituri': { icon: <MixerHorizontalIcon className="h-5 w-5" />, label: 'Garnituri' },
    'salate': { icon: <BookOpen className="h-5 w-5" />, label: 'Salate' },
    'deserturi': { icon: <CookieIcon className="h-5 w-5" />, label: 'Deserturi' },
    'conserve': { icon: <Archive className="h-5 w-5" />, label: 'Conserve' },
    'bauturi': { icon: <Coffee className="h-5 w-5" />, label: 'Băuturi' },
    'paine_si_panificatie': { icon: <Flame className="h-5 w-5" />, label: 'Pâine' },
    'all': { icon: <MagnifyingGlassIcon className="h-5 w-5" />, label: 'Toate' }
  };

  const info = categoryInfo[category] || { icon: <Utensils className="h-5 w-5" />, label: category };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button 
            variant={isActive ? "default" : "outline"} 
            className={`h-14 w-14 rounded-full p-0 ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => onClick(category === 'all' ? '' : category)}
          >
            {info.icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{info.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Componenta pentru sfaturile rapide de post
const QuickTips = () => {
  const [isVisible, setIsVisible] = useState(true);

  const tips = [
    {
      title: "Substituție pentru ouă",
      content: "În rețetele de post, ouăle pot fi înlocuite cu: 1 lingură de semințe de in + 3 linguri de apă (pt. legare) sau 1/4 cană de piure de mere (pt. umiditate)."
    },
    {
      title: "Înlocuitor pentru lapte",
      content: "Laptele animal poate fi înlocuit cu lapte de migdale, ovăz, cocos sau soia, în aceeași cantitate."
    },
    {
      title: "Gust savuros fără carne",
      content: "Pentru un gust savuros, folosiți ciuperci uscate rehidratate, pastă de roșii sau sos de soia pentru a adăuga umami."
    }
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 relative">
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-1">
          <RocketIcon className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="font-medium text-amber-900">{randomTip.title}</h3>
          <p className="text-sm text-amber-800 mt-1">{randomTip.content}</p>
        </div>
      </div>
      <button 
        className="absolute top-2 right-2 text-amber-400 hover:text-amber-600"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Componenta pentru Rețeta Zilei
const RecipeOfTheDay = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/fasting-recipes/recipe-of-the-day'],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-50 rounded-lg mb-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data || !data.recipe) {
    return null;
  }

  const recipe = data.recipe;
  const sourceBadge = {
    'day': { label: `Recomandată pentru ${data.day === 'wednesday' ? 'miercuri' : data.day === 'friday' ? 'vineri' : 'astăzi'}`, color: 'bg-green-500' },
    'featured': { label: 'Recomandare specială', color: 'bg-amber-500' },
    'all': { label: 'Rețeta zilei', color: 'bg-blue-500' }
  };

  return (
    <div className="mb-8 bg-gray-50 rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
              style={{ maxHeight: '300px' }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center" style={{ minHeight: '200px' }}>
              <Utensils className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex items-center mb-3">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Rețeta zilei</h2>
            <Badge className={`ml-3 ${sourceBadge[data.source].color} text-white`}>
              {sourceBadge[data.source].label}
            </Badge>
          </div>
          
          <h3 className="text-2xl font-bold mb-2">{recipe.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> 
              {recipe.preparationMinutes + recipe.cookingMinutes} min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <ChefHat className="h-3 w-3" /> 
              {recipe.difficulty === 'incepator' ? 'Începător' : 
                recipe.difficulty === 'mediu' ? 'Mediu' : 'Avansat'}
            </Badge>
          </div>
          
          <Link to={`/retete-de-post/${recipe.slug}`}>
            <Button className="mt-2">Vezi rețeta completă</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Componenta pentru căutare cu autocompletare
const AutocompleteSearch = ({ value, onChange, recipes, isLoading }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Filtrez sugestiile de autocompletare pe baza textului introdus
  const suggestions = React.useMemo(() => {
    if (!value || value.length < 2 || !recipes) return [];
    
    return recipes
      .filter(recipe => 
        recipe.title.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 5);  // Limitez la 5 sugestii
  }, [value, recipes]);

  // Gestionarea click-urilor în afara zonei de autocompletare
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        autocompleteRef.current && 
        !autocompleteRef.current.contains(e.target) &&
        inputRef.current && 
        !inputRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Caută rețete..."
          value={value}
          onChange={(e) => onChange(e)}
          onFocus={() => setIsFocused(true)}
          className="pl-10"
        />
        {value && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => onChange({ target: { value: '' } })}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isFocused && suggestions.length > 0 && (
        <div 
          ref={autocompleteRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          {suggestions.map((recipe) => (
            <Link 
              key={recipe.id} 
              to={`/retete-de-post/${recipe.slug}`}
              className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {recipe.imageUrl ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{recipe.title}</p>
                  <p className="text-xs text-gray-500 truncate">{recipe.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Pagina principală pentru rețete de post
export default function FastingRecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('toate');
  const [filters, setFilters] = useState({});
  const [visualCategoryFilter, setVisualCategoryFilter] = useState('');

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

  // Filtrare după query-ul de căutare și categoria vizuală
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    
    let result = recipes;
    
    // Filtrare după căutare
    if (searchQuery) {
      result = result.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtrare după categoria vizuală
    if (visualCategoryFilter) {
      result = result.filter(recipe => recipe.category === visualCategoryFilter);
    }
    
    return result;
  }, [recipes, searchQuery, visualCategoryFilter]);

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
  
  // Gestionarea filtrării vizuale după categorie
  const handleCategoryFilterChange = (category) => {
    setVisualCategoryFilter(category);
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    } else {
      const { category, ...rest } = filters;
      setFilters(rest);
    }
  };

  // Decidem ce rețete să afișăm în funcție de tabul activ
  const recipesToShow = activeTab === 'recomandate' 
    ? featuredRecipes || [] 
    : filteredRecipes;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-2">Rețete de Post</h1>
      <p className="text-gray-600 text-center mb-6">
        Descoperiți rețete delicioase pentru perioadele de post ortodox
      </p>

      {/* Sfaturi rapide */}
      <QuickTips />

      {/* Căutare cu autocompletare */}
      <div className="mb-6">
        <AutocompleteSearch
          value={searchQuery}
          onChange={handleSearchChange}
          recipes={recipes}
          isLoading={isLoading}
        />
      </div>

      {/* Rețeta zilei */}
      {activeTab === 'toate' && <RecipeOfTheDay />}

      {/* Filtrare vizuală după categorii */}
      {activeTab === 'toate' && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <MixerHorizontalIcon className="h-5 w-5" />
            Filtrează după categorie
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <CategoryIcon
              category="all"
              onClick={() => handleCategoryFilterChange('')}
              isActive={visualCategoryFilter === ''}
            />
            <CategoryIcon
              category="supe_si_ciorbe"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'supe_si_ciorbe'}
            />
            <CategoryIcon
              category="feluri_principale"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'feluri_principale'}
            />
            <CategoryIcon
              category="deserturi"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'deserturi'}
            />
            <CategoryIcon
              category="salate"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'salate'}
            />
            <CategoryIcon
              category="aperitive"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'aperitive'}
            />
            <CategoryIcon
              category="paine_si_panificatie"
              onClick={handleCategoryFilterChange}
              isActive={visualCategoryFilter === 'paine_si_panificatie'}
            />
          </div>
          {visualCategoryFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryFilterChange('')}
              className="mt-2 mx-auto block"
            >
              <X className="mr-1 h-4 w-4" /> Resetează filtrul de categorie
            </Button>
          )}
        </div>
      )}

      <Tabs defaultValue="toate" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="toate">Toate rețetele</TabsTrigger>
          <TabsTrigger value="recomandate">Recomandate</TabsTrigger>
          <TabsTrigger value="filtrate">Filtrare avansată</TabsTrigger>
        </TabsList>

        <TabsContent value="toate">
          {/* Filtrele vizuale sunt deja afișate mai sus */}
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
      {activeTab === 'toate' && recipes?.length > 0 && !visualCategoryFilter && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Recomandate pentru zile de post
          </h2>
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
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          {activeTab === 'recomandate' 
            ? <><Award className="h-6 w-6 text-primary" /> Rețete recomandate</>
            : activeTab === 'filtrate' && Object.values(filters).some(v => v)
              ? <><Filter className="h-6 w-6 text-primary" /> Rețete filtrate</>
              : visualCategoryFilter
                ? <><Utensils className="h-6 w-6 text-primary" /> {getCategoryLabel(visualCategoryFilter)}</>
                : <><Utensils className="h-6 w-6 text-primary" /> Toate rețetele de post</>
          }
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipesToShow?.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>

      {/* Secțiunea de informații despre post */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" />
          Despre postul ortodox
        </h2>
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
  
  // Funcție pentru a traduce categoriile în română
  function getCategoryLabel(category: string) {
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
  }
}