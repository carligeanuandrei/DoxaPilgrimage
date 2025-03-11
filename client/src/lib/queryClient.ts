import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Funcție pentru reîncercarea operațiunilor de rețea cu strategie de backoff exponențial
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3, 
  delay = 500
): Promise<Response> {
  let retries = 0;
  let lastError: Error;
  
  while (retries < maxRetries) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries >= maxRetries) break;
      
      // Așteptăm un timp exponențial între reîncercări
      const waitTime = delay * Math.pow(2, retries - 1);
      console.log(`Reîncercare ${retries}/${maxRetries} pentru ${url} în ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Dacă am ajuns aici, toate reîncercările au eșuat
  throw lastError!;
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
