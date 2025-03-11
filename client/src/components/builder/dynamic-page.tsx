import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBuilderPage } from '@/hooks/use-builder-page';
import { Skeleton } from '@/components/ui/skeleton';
import { BuilderRenderer } from './builder-renderer';

interface DynamicPageProps {
  pageType: string;
  className?: string;
  fallbackComponent?: React.ReactNode;
}

/**
 * Componenta DynamicPage încarcă și redă o pagină din builder bazată pe tipul acesteia
 * @param pageType - Tipul paginii (ex: 'home', 'about', 'contact', etc.)
 * @param className - Clase CSS opționale
 * @param fallbackComponent - Componentă afișată dacă nu există pagină construită
 */
export const DynamicPage: React.FC<DynamicPageProps> = ({
  pageType,
  className = '',
  fallbackComponent
}) => {
  const { data: page, isLoading, error } = useBuilderPage(pageType);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-64 w-full rounded-lg mt-6" />
      </div>
    );
  }

  if (error || !page) {
    console.log(`Nu există pagină de tip "${pageType}" sau a apărut o eroare:`, error);
    return fallbackComponent ? <>{fallbackComponent}</> : null;
  }

  return <BuilderRenderer content={page.content} className={className} />;
};