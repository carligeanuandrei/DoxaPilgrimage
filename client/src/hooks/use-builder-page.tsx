import { useQuery } from "@tanstack/react-query";
import { BuilderPage } from "@shared/schema";

/**
 * Hook pentru a încărca o pagină builder după tipul său
 * @param pageType - Tipul paginii (ex: 'home', 'about', 'contact', 'pilgrimages')
 * @returns - Query result care conține datele paginii builder
 */
export function useBuilderPage(pageType: string) {
  return useQuery<BuilderPage>({
    queryKey: ['/api/builder-pages/type', pageType],
    queryFn: async () => {
      const res = await fetch(`/api/builder-pages/type/${pageType}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Nu aruncăm eroare pentru 404, doar returnăm null
          return null;
        }
        throw new Error(`Eroare la încărcarea paginii de tip ${pageType}: ${res.statusText}`);
      }
      return await res.json();
    },
    refetchOnWindowFocus: false,
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
    console.error("Eroare la parsarea conținutului builder:", error);
    return [];
  }
}