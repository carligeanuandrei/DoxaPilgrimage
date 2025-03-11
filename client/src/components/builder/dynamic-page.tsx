import React from 'react';
import { useBuilderPage } from '@/hooks/use-builder-page';
import { BuilderRenderer } from './builder-renderer';
import { Skeleton } from '@/components/ui/skeleton';

interface DynamicPageProps {
  pageType: string;
  className?: string;
  fallbackComponent?: React.ReactNode;
}

export const DynamicPage: React.FC<DynamicPageProps> = ({ 
  pageType, 
  className = '',
  fallbackComponent 
}) => {
  const { data: page, isLoading, error } = useBuilderPage(pageType);

  // Dacă încă se încarcă, afișăm un skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    );
  }

  // Dacă avem o eroare sau nu există pagina și avem o componentă de fallback
  if ((error || !page) && fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Dacă avem o eroare sau nu există pagina și NU avem o componentă de fallback
  if (error || !page) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">
          Această pagină nu a fost încă configurată
        </h2>
        <p className="text-neutral-600">
          Administratorul site-ului poate crea o pagină cu conținut personalizat pentru această zonă.
        </p>
      </div>
    );
  }

  // Altfel, afișăm conținutul paginii builder
  return <BuilderRenderer content={page.content} className={className} />;
};