
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Funcție îmbunătățită pentru reîncercarea operațiunilor de rețea cu strategie de backoff exponențial
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3, 
  initialDelay = 500
): Promise<Response> {
  let retries = 0;
  let lastError: Error;

  // Funcția pentru a normaliza URL-ul (adaugă baza dacă lipsește)
  const normalizedUrl = url.startsWith('/') 
    ? `${window.location.origin}${url}` 
    : url;

  while (retries <= maxRetries) {
    try {
      // Creare controller nou pentru fiecare încercare
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(new DOMException('Timeout depășit', 'TimeoutError')), 
        15000
      );
      
      const response = await fetch(normalizedUrl, {
        ...options,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      lastError = error as Error;
      
      // Curăță timeout-ul în caz de eroare
      
      // Nu reîncerca în caz de eroare de abort intenționată
      if (error.name === 'AbortError' && error.message !== 'Timeout depășit') {
        throw error;
      }
      
      retries++;
      
      if (retries > maxRetries) break;
      
      // Așteptăm un timp exponențial între reîncercări
      const waitTime = initialDelay * Math.pow(2, retries - 1);
      console.log(`Reîncercare ${retries}/${maxRetries} pentru ${url} în ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Dacă am ajuns aici, toate reîncercările au eșuat
  console.error(`Toate încercările de fetch au eșuat pentru ${url}`, lastError);
  throw lastError;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }

    const options = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include" as RequestCredentials,
    };

    // Folosim fetchWithRetry pentru a reîncerca automat dacă apar erori de rețea
    const res = await fetchWithRetry(url, options);

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Error in apiRequest ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const options = {
        credentials: "include" as RequestCredentials,
      };

      // Folosim fetchWithRetry pentru a reîncerca automat dacă apar erori de rețea
      const res = await fetchWithRetry(queryKey[0] as string, options);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Error in getQueryFn ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Reîmprospătare la focus pe fereastră
      staleTime: 1000, // Marcăm datele ca vechi după doar 1 secundă
      retry: false,
      refetchOnMount: true, // Reîmprospătare la montarea componentelor
      refetchOnReconnect: true, // Reîmprospătare la reconectare
    },
    mutations: {
      retry: false,
    },
  },
});
