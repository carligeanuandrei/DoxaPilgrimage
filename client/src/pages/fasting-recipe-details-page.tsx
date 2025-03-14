import React from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Flame,
  Calendar, 
  Bookmark, 
  Share2,
  ThumbsUp,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { FastingRecipe, RecipeComment } from '../../shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function FastingRecipeDetailsPage() {
  const [_, params] = useRoute('/retete-de-post/:slug');
  const slug = params?.slug;
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = React.useState('');
  const [rating, setRating] = React.useState(5);

  // Obținem detaliile rețetei din API
  const { data: recipe, isLoading, error } = useQuery({
    queryKey: [`/api/fasting-recipes/slug/${slug}`],
    enabled: !!slug
  });

  // Obținem comentariile pentru această rețetă
  const { 
    data: comments, 
    isLoading: isCommentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: [`/api/fasting-recipes/${recipe?.id}/comments`],
    enabled: !!recipe?.id
  });

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

  // Funcție pentru a traduce timpul de preparare în română
  const getTimeLabel = (time: string) => {
    const timeMap = {
      'sub_30_minute': 'Sub 30 minute',
      '30_60_minute': '30-60 minute',
      'peste_60_minute': 'Peste 60 minute'
    };
    return timeMap[time] || time;
  };

  // Funcție pentru a traduce zilele recomandate în română
  const getDayLabel = (day: string) => {
    const dayMap = {
      'monday': 'Luni',
      'tuesday': 'Marți',
      'wednesday': 'Miercuri',
      'thursday': 'Joi',
      'friday': 'Vineri',
      'saturday': 'Sâmbătă',
      'sunday': 'Duminică'
    };
    return dayMap[day] || day;
  };

  // Funcție pentru a formata data
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Funcție pentru a adăuga un comentariu
  const addComment = async () => {
    if (!user) {
      toast({
        title: "Trebuie să fiți autentificat",
        description: "Pentru a adăuga un comentariu trebuie să vă autentificați.",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comentariu gol",
        description: "Vă rugăm să introduceți un comentariu.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/fasting-recipes/${recipe.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: comment,
          rating
        })
      });

      if (!response.ok) {
        throw new Error('Eroare la adăugarea comentariului');
      }

      toast({
        title: "Comentariu adăugat",
        description: "Comentariul a fost adăugat cu succes.",
        variant: "default"
      });

      setComment('');
      setRating(5);
      refetchComments();
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la adăugarea comentariului.",
        variant: "destructive"
      });
    }
  };

  // Funcție pentru partajare
  const shareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast({
            title: "Link copiat",
            description: "Link-ul către rețetă a fost copiat în clipboard.",
            variant: "default"
          });
        })
        .catch(err => {
          toast({
            title: "Eroare",
            description: "Nu s-a putut copia link-ul în clipboard.",
            variant: "destructive"
          });
        });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Se încarcă rețeta...</span>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Rețeta nu a fost găsită</h1>
        <p className="mb-6">Ne pare rău, rețeta pe care o căutați nu există sau a fost mutată.</p>
        <Button onClick={() => setLocation('/retete-de-post')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la Rețete de Post
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Buton de navigare înapoi */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation('/retete-de-post')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la Rețete de Post
        </Button>
      </div>

      {/* Header-ul rețetei */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="secondary">{getRecipeTypeLabel(recipe.recipeType)}</Badge>
          <Badge variant="outline">{getCategoryLabel(recipe.category)}</Badge>
          <Badge variant="outline">{getDifficultyLabel(recipe.difficulty)}</Badge>
          {recipe.isFeatured && (
            <Badge className="bg-yellow-500 text-white">Recomandată</Badge>
          )}
        </div>
        <p className="text-gray-700 mb-6">{recipe.description}</p>
        
        {/* Acțiuni */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareRecipe}>
            <Share2 className="h-4 w-4 mr-2" />
            Distribuie
          </Button>
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Salvează
          </Button>
        </div>
      </div>

      {/* Imaginea rețetei */}
      <div className="mb-8">
        {recipe.imageUrl ? (
          <div className="overflow-hidden rounded-lg shadow-md">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full object-cover h-[400px]" 
            />
          </div>
        ) : (
          <div className="bg-gray-200 rounded-lg flex items-center justify-center h-[400px]">
            <p className="text-gray-500">Imagine indisponibilă</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coloana principală cu ingrediente și pași */}
        <div className="md:col-span-2">
          {/* Carduri info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-center">Timp Total</p>
                <p className="font-bold">{recipe.preparationMinutes + recipe.cookingMinutes} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <ChefHat className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-center">Preparare</p>
                <p className="font-bold">{recipe.preparationMinutes} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Flame className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-center">Gătire</p>
                <p className="font-bold">{recipe.cookingMinutes} min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Users className="h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-center">Porții</p>
                <p className="font-bold">{recipe.servings}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ingrediente */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Ingrediente</h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-2">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Pași de preparare */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Mod de preparare</h2>
            <Card>
              <CardContent className="p-6">
                <ol className="space-y-4">
                  {recipe.steps?.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Comentarii */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Comentarii 
              {comments?.length > 0 && <span className="text-gray-500 text-lg ml-2">({comments.length})</span>}
            </h2>
            
            {/* Adaugă comentariu */}
            <div className="mb-6">
              <Textarea
                placeholder="Adaugă un comentariu..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="mr-2">Evaluare:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-xl ${
                          star <= rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={addComment}>Adaugă comentariu</Button>
              </div>
            </div>

            {/* Lista de comentarii */}
            {isCommentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : comments?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nu există comentarii pentru această rețetă. Fii primul care comentează!
              </p>
            ) : (
              <div className="space-y-4">
                {comments?.map((comment: RecipeComment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{comment.user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{comment.user?.firstName} {comment.user?.lastName}</p>
                            <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-500">
                          {Array(5).fill(0).map((_, i) => (
                            <span key={i} className={i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p>{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar cu informații adiționale */}
        <div>
          {/* Informații generale */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Informații generale</h3>
              
              <div className="space-y-4">
                {recipe.calories && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calorii:</span>
                    <span className="font-medium">{recipe.calories} kcal</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Timp de preparare:</span>
                  <span className="font-medium">{getTimeLabel(recipe.preparationTime)}</span>
                </div>
                
                {recipe.monasteryId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">De la mănăstirea:</span>
                    <Link href={`/manastiri/${recipe.monastery?.slug || recipe.monasteryId}`}>
                      <span className="font-medium text-primary hover:underline">
                        {recipe.monastery?.name || `Mănăstirea #${recipe.monasteryId}`}
                      </span>
                    </Link>
                  </div>
                )}
                
                {recipe.recommendedForDays?.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Recomandat pentru:</span>
                    <div className="flex flex-wrap gap-1">
                      {recipe.recommendedForDays.map((day) => (
                        <Badge key={day} variant="outline">{getDayLabel(day)}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recipe.occasionTags?.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Ocazii:</span>
                    <div className="flex flex-wrap gap-1">
                      {recipe.occasionTags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recipe.feastDay && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sărbătoare recomandată:</span>
                    <span className="font-medium">{recipe.feastDay}</span>
                  </div>
                )}
                
                {recipe.source && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sursă:</span>
                    <span className="font-medium">{recipe.source}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Data adăugării:</span>
                  <span className="font-medium">{formatDate(recipe.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sfaturi pentru post */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Sfaturi pentru post</h3>
              <p className="text-sm mb-4">
                Postul ortodox presupune abstinența de la anumite alimente de origine animală. 
                Perioada și regulile depind de tipul de post.
              </p>
              
              <h4 className="font-semibold text-sm mb-2">Această rețetă respectă:</h4>
              <div className="space-y-2 mb-4">
                <div className="flex items-start">
                  <div className={`w-4 h-4 rounded-full mt-1 mr-2 ${recipe.recipeType === 'de_post' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  <p className="text-sm">Post complet (fără produse animale)</p>
                </div>
                
                <div className="flex items-start">
                  <div className={`w-4 h-4 rounded-full mt-1 mr-2 ${
                    ['cu_dezlegare_la_ulei', 'cu_dezlegare_la_vin', 'cu_dezlegare_la_peste', 'cu_dezlegare_completa'].includes(recipe.recipeType) 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}></div>
                  <p className="text-sm">Zile cu dezlegare specifică</p>
                </div>
              </div>
              
              <Link href="/calendar-ortodox">
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Vezi calendarul ortodox
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Alte rețete recomandate - ar putea fi implementat ulterior */}
        </div>
      </div>
    </div>
  );
}