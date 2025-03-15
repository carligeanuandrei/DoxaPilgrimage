import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Review, insertReviewSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ReviewsSectionProps {
  pilgrimageId: number;
  reviews: Review[];
  isLoading: boolean;
}

const reviewFormSchema = insertReviewSchema.pick({
  rating: true,
  comment: true,
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function ReviewsSection({ pilgrimageId, reviews, isLoading }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: ""
    }
  });
  
  const addReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormValues) => {
      const res = await apiRequest("POST", `/api/pilgrimages/${pilgrimageId}/reviews`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pilgrimages/${pilgrimageId}/reviews`] });
      toast({
        title: "Recenzie adăugată",
        description: "Mulțumim pentru recenzia ta!",
      });
      setShowReviewForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ReviewFormValues) => {
    addReviewMutation.mutate(data);
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recenzii ({reviews.length})</h2>
        {user && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>Adaugă o recenzie</Button>
        )}
      </div>
      
      {showReviewForm && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Evaluează experiența ta</label>
                <div className="flex space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => form.setValue("rating", star)}
                      className="focus:outline-none"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-8 w-8 ${form.watch("rating") >= star ? 'text-yellow-400' : 'text-gray-300'}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium mb-2">Comentariul tău</label>
                <Textarea
                  id="comment"
                  rows={4}
                  placeholder="Împărtășește-ți experiența cu alți pelerini..."
                  {...form.register("comment")}
                />
                {form.formState.errors.comment && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.comment.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                >
                  Anulează
                </Button>
                <Button 
                  type="submit"
                  disabled={addReviewMutation.isPending}
                >
                  {addReviewMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    "Trimite recenzia"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div>
          <div className="mb-6 flex items-center">
            <div className="text-4xl font-bold mr-4">{calculateAverageRating().toFixed(1)}</div>
            <div>
              {renderStars(Math.round(calculateAverageRating()))}
              <p className="text-sm text-gray-500 mt-1">Bazat pe {reviews.length} recenzii</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback>U{review.userId}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Utilizator #{review.userId}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      {review.comment && (
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nu există încă recenzii pentru acest pelerinaj.</p>
          {user && !showReviewForm && (
            <Button variant="outline" className="mt-4" onClick={() => setShowReviewForm(true)}>
              Fii primul care adaugă o recenzie
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
