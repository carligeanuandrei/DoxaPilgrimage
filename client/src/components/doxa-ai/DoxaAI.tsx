
import React, { useState, useEffect, useRef } from 'react';

type UserType = 'user' | 'organizer' | 'admin';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      console.log("Trimit mesaj către API:", input);

      try {
        // Încercăm să trimitem mesajul către API real
        const response = await fetch('/api/doxa-ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            userType: userType,
            history: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }),
        });

        if (!response.ok) {
          throw new Error(`Eroare server: ${response.status}`);
        }

        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.reply || "Nu am putut obține un răspuns. Te rog încearcă din nou.",
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (apiError) {
        console.error('Eroare la comunicarea cu API-ul:', apiError);
        
        // Răspuns de fallback în caz de eroare
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "În acest moment nu pot procesa cererea ta. Contactează administratorul platformei pentru asistență.",
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, fallbackMessage]);
        setError("Eroare de comunicare cu serverul. Încercați din nou mai târziu.");
      }

    } catch (error) {
      console.error('Eroare la trimiterea mesajului:', error);
      setError("A apărut o eroare. Te rugăm să încerci din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-lg shadow-md overflow-hidden">
      <div className="bg-primary p-4 text-white">
        <h2 className="text-xl font-bold">DOXA AI - Asistent Ortodox</h2>
        <p className="text-sm">Întreabă orice despre pelerinaje, mănăstiri, tradiții sau sfinți</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'assistant'
                ? 'bg-white border border-gray-200'
                : 'bg-primary-50 ml-auto'
            } max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <p>{message.content}</p>
            <span className="text-xs text-gray-500 mt-1 block">
              {message.timestamp.toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="bg-white p-3 rounded-lg max-w-[80%] animate-pulse">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="h-2 bg-slate-200 rounded mt-2 w-3/4"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-600 max-w-[80%]">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Întreabă ceva despre pelerinaje, mănăstiri sau tradiții ortodoxe..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
          >
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}
