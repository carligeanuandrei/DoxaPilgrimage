import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, SendHorizonal, Bot, User } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type UserType = 'user' | 'organizer' | 'admin';

// Mesaje de bun venit în funcție de tipul utilizatorului
function getWelcomeMessage(userType: UserType): string {
  switch (userType) {
    case 'organizer':
      return 'Bun venit în asistentul DOXA AI pentru organizatori de pelerinaje. Cum te pot ajuta cu gestionarea pelerinajelor tale?';
    case 'admin':
      return 'Bun venit în consola de administrare DOXA AI. Cum te pot ajuta astăzi cu gestionarea platformei?';
    default:
      return 'Bun venit la DOXA AI, asistentul tău personal pentru pelerinaje ortodoxe. Cum te pot ajuta astăzi?';
  }
}

export function DoxaAI({ userType = 'user' }: { userType?: UserType }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scorulare automată la mesajele noi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Adăugăm un mesaj de bun venit la început
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(userType);
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [userType, messages.length]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    try {
      // Adăugăm mesajul utilizatorului în lista de mesaje
      const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        role: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      console.log("Trimit mesaj către API:", input);

      // Folosim un răspuns static pentru a testa funcționalitatea
      const staticResponse = "Acesta este un răspuns de test pentru a verifica funcționalitatea componentei DoxaAI. API-ul real va fi folosit după ce rezolvăm problemele de conectare.";

      // Simulăm un răspuns de la server după o scurtă întârziere
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: staticResponse,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Eroare la trimiterea mesajului:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'assistant' ? 'DOXA AI' : 'Tu'}
                </span>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-muted">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">DOXA AI</span>
              </div>
              <div className="flex items-center mt-2">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                <span>Se procesează răspunsul...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Scrie un mesaj..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            <span className="sr-only">Trimite</span>
          </Button>
        </form>
      </div>
    </div>
  );
}