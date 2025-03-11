import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { BuilderPage } from '@shared/schema';

/**
 * Hook pentru a încărca o pagină builder după tipul său
 * @param pageType - Tipul paginii (ex: 'home', 'about', 'contact', 'pilgrimages')
 * @returns - Query result care conține datele paginii builder
 */
export function useBuilderPage(pageType: string) {
  return useQuery<BuilderPage>({
    queryKey: [`/api/builder-pages/type/${pageType}`],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 1000 * 60 * 5, // 5 minute
  });
}

/**
 * Funcție utilă pentru a analiza și randeriza componente din obiectul BuilderPage
 * @param content - Conținutul paginii builder în format JSON string
 * @returns - Array de secțiuni și componente procesate
 */
export function parseBuilderContent(content: string) {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Eroare la parsarea conținutului paginii builder:', error);
    return [];
  }
}