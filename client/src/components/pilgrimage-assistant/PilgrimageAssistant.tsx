import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export function PilgrimageAssistant() {
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const aiMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/pilgrimage-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error('Eroare la comunicarea cu asistentul AI');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Recomandare primită',
        description: data.response,
      });
      setMessage('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    aiMutation.mutate(message);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Asistent Pelerinaje AI</CardTitle>
        <CardDescription>
          Descrie preferințele tale și voi recomanda pelerinaje potrivite pentru tine.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Ex: Aș dori să vizitez mănăstiri din Moldova în luna august, sunt interesat de locuri cu tradiție în pictură bisericească..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={aiMutation.isPending || !message.trim()}
            className="w-full"
          >
            {aiMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se procesează...
              </>
            ) : (
              'Obține recomandări'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}