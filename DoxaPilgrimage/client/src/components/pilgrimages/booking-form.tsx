import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pilgrimage, insertBookingSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";

interface BookingFormProps {
  pilgrimage: Pilgrimage;
  onCancel: () => void;
}

const bookingFormSchema = insertBookingSchema.pick({
  persons: true,
  pilgrimageId: true,
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm({ pilgrimage, onCancel }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pilgrimageId: pilgrimage.id,
      persons: 1
    }
  });
  
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsSubmitted(true);
      toast({
        title: "Rezervare reușită",
        description: "Rezervarea ta a fost înregistrată cu succes.",
      });
    },
    onError: (error) => {
      toast({
        title: "Eroare la rezervare",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: BookingFormValues) => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a face o rezervare.",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    bookingMutation.mutate(data);
  };
  
  const calculateTotalPrice = () => {
    const persons = form.watch("persons") || 1;
    return persons * pilgrimage.price;
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Rezervare Confirmată</h2>
            <p className="text-gray-600">Mulțumim pentru rezervare! Un email de confirmare a fost trimis la adresa ta.</p>
            <Button className="w-full" asChild>
              <a href="/profile">Vezi Rezervările Tale</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="persons">Număr de persoane</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const currentValue = form.watch("persons");
                    if (currentValue > 1) {
                      form.setValue("persons", currentValue - 1);
                    }
                  }}
                  disabled={form.watch("persons") <= 1}
                >
                  -
                </Button>
                <Input
                  id="persons"
                  type="number"
                  min="1"
                  max={pilgrimage.availableSpots}
                  className="text-center"
                  {...form.register("persons", { valueAsNumber: true })}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const currentValue = form.watch("persons");
                    if (currentValue < pilgrimage.availableSpots) {
                      form.setValue("persons", currentValue + 1);
                    }
                  }}
                  disabled={form.watch("persons") >= pilgrimage.availableSpots}
                >
                  +
                </Button>
              </div>
              {form.formState.errors.persons && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.persons.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {pilgrimage.availableSpots} locuri disponibile
              </p>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Preț per persoană:</span>
                <span>{pilgrimage.price} {pilgrimage.currency}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Număr persoane:</span>
                <span>{form.watch("persons") || 1}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{calculateTotalPrice()} {pilgrimage.currency}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              <p>Prin apăsarea butonului "Rezervă acum", ești de acord cu <a href="/terms" className="text-primary hover:underline">Termenii și Condițiile</a> noastre.</p>
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onCancel} className="w-1/2">
                Înapoi
              </Button>
              <Button 
                type="submit" 
                className="w-1/2"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se procesează...
                  </>
                ) : (
                  "Rezervă acum"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
