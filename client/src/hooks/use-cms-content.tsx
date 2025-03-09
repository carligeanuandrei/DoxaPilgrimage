import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CmsContent } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export interface CmsFormValues {
  key: string;
  contentType: 'text' | 'html' | 'image';
  value: string;
  description?: string;
}

export function useCmsContent() {
  const { toast } = useToast();

  // Fetch all CMS content
  const { 
    data: cmsContents, 
    isLoading, 
    isError,
    refetch
  } = useQuery<CmsContent[]>({
    queryKey: ['/api/cms'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/cms');
      return await res.json();
    },
    // Configurare pentru reîmprospătare mai frecventă
    staleTime: 1000, // 1 secundă
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CmsFormValues) => apiRequest('POST', '/api/cms', data),
    onSuccess: () => {
      // Invalidează toate interogările pentru a re-încărca datele
      queryClient.invalidateQueries();
      // Reîmprospătează specific conținutul CMS
      refetch();
      
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost adăugat cu succes.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut adăuga conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CmsFormValues) => apiRequest('PATCH', `/api/cms/${data.key}`, data),
    onSuccess: () => {
      // Invalidează toate interogările pentru a re-încărca datele
      queryClient.invalidateQueries();
      // Reîmprospătează specific conținutul CMS
      refetch();
      
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost actualizat cu succes.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut actualiza conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (key: string) => apiRequest('DELETE', `/api/cms/${key}`),
    onSuccess: () => {
      // Invalidează toate interogările pentru a re-încărca datele
      queryClient.invalidateQueries();
      // Reîmprospătează specific conținutul CMS
      refetch();
      
      toast({
        title: 'Succes!',
        description: 'Conținutul a fost șters cu succes.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare!',
        description: `Nu s-a putut șterge conținutul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Funcție pentru a obține o valoare CMS după cheie
  const getCmsValueByKey = (key: string): string => {
    if (!cmsContents) return '';
    const content = cmsContents.find(content => content.key === key);
    return content ? content.value : '';
  };

  return {
    cmsContents,
    isLoading,
    isError,
    createContent: createMutation.mutate,
    updateContent: updateMutation.mutate,
    deleteContent: deleteMutation.mutate,
    getCmsValueByKey,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    refetch
  };
}