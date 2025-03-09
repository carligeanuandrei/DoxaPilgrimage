import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const adminLoginSchema = z.object({
  username: z.string().min(3, 'Numele de utilizator trebuie să aibă minim 3 caractere'),
  password: z.string().min(3, 'Parola trebuie să aibă minim 3 caractere')
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLoginFormData) => {
      const res = await apiRequest('POST', '/api/admin/login', data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Autentificare eșuată');
      }
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Autentificare reușită',
        description: 'Bine ai venit în panoul de administrare Doxa!',
      });
      navigate('/admin/cms');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: 'Autentificare eșuată',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  function onSubmit(data: AdminLoginFormData) {
    setError(null);
    adminLoginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Administrator Doxa</CardTitle>
          <CardDescription className="text-center">
            Autentificați-vă pentru a accesa panoul de administrare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nume utilizator</Label>
              <Input
                id="username"
                type="text"
                placeholder="Introduceți numele de utilizator"
                {...form.register('username')}
                className={form.formState.errors.username ? 'border-red-500' : ''}
              />
              {form.formState.errors.username && (
                <p className="text-red-500 text-sm">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Parolă</Label>
              <Input
                id="password"
                type="password"
                placeholder="Introduceți parola"
                {...form.register('password')}
                className={form.formState.errors.password ? 'border-red-500' : ''}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={adminLoginMutation.isPending}
            >
              {adminLoginMutation.isPending ? 'Autentificare...' : 'Autentificare'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm w-full">
            Doar administratorii autorizați au acces la această zonă.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}