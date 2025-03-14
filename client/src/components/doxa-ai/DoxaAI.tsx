
import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from '../ui/spinner';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type UserType = 'user' | 'organizer' | 'admin';

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
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scrollare automată la mesajele noi
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
    if (input.trim() === '' || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      content: input,
      role: 'user' as const,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);
    
    // Adăugăm mesajul utilizatorului la istoricul conversației
    const updatedHistory = [...messageHistory, userMessage];
    setMessageHistory(updatedHistory);
    
    try {
      // Trimitem cererea către backend
      const response = await fetch('/api/doxa-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          userType,
          messageHistory: updatedHistory.slice(-10), // limităm la ultimele 10 mesaje pentru context
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Eroare: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Creăm și adăugăm răspunsul asistentului
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        content: data.reply || data.response || "Ne pare rău, a apărut o eroare în procesarea răspunsului.",
        role: 'assistant' as const,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setMessageHistory((prev) => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('Eroare la trimiterea mesajului:', err);
      setError('A apărut o eroare la comunicarea cu asistentul. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="p-4 bg-blue-600 text-white rounded-t-lg">
        <h2 className="text-xl font-bold">DOXA AI</h2>
        <p className="text-sm opacity-80">Asistentul tău personal pentru pelerinaje ortodoxe</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${
              message.role === 'assistant'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100'
                : 'bg-blue-100 dark:bg-blue-800/40 text-gray-900 dark:text-white ml-auto'
            } p-3 rounded-lg max-w-[80%] ${message.role === 'user' ? 'ml-auto' : ''}`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            <div className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg max-w-[80%]">
            <Spinner size="sm" />
            <p className="text-sm text-gray-600 dark:text-gray-300">DOXA AI se gândește...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-lg text-red-800 dark:text-red-200">
            <p>{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Întreabă ceva despre pelerinaje..."
            className="flex-1 min-h-[60px] p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? <Spinner size="sm" /> : 'Trimite'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Powered by DOXA AI - Asistentul tău pentru pelerinaje ortodoxe
        </p>
      </div>
    </div>
  );
}
