import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Component for direct CMS content fetch without caching
 * Perfect for content that should be updated instantly when edited in admin
 */
interface DirectCmsTextProps {
  contentKey: string;
  fallback?: string;
  className?: string;
  refreshInterval?: number; // in ms, default is 1000ms (1s)
}

export function DirectCmsText({ contentKey, fallback = '', className = '', refreshInterval = 1000 }: DirectCmsTextProps) {
  const [content, setContent] = useState<string>(fallback);
  const { toast } = useToast();
  
  const fetchContent = useCallback(async () => {
    try {
      // Folosim apiRequest pentru a gestiona mai bine erorile și headerele
      const response = await apiRequest("GET", `/api/cms/${contentKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.value);
      }
    } catch (error) {
      console.log(`Error fetching CMS content for ${contentKey}:`, error);
      // Silently fail and use fallback
    }
  }, [contentKey, fallback]);
  
  useEffect(() => {
    // Initial fetch
    fetchContent();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(fetchContent, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchContent, refreshInterval]);
  
  return (
    <span className={className} data-cms-key={contentKey}>
      {content || fallback}
    </span>
  );
}

/**
 * Component for direct CMS HTML content fetch without caching
 */
interface DirectCmsHtmlProps {
  contentKey: string;
  fallback?: string;
  className?: string;
  refreshInterval?: number;
}

export function DirectCmsHtml({ contentKey, fallback = '', className = '', refreshInterval = 1000 }: DirectCmsHtmlProps) {
  const [content, setContent] = useState<string>(fallback);
  
  const fetchContent = useCallback(async () => {
    try {
      // Folosim apiRequest pentru a gestiona mai bine erorile și headerele
      const response = await apiRequest("GET", `/api/cms/${contentKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(data.value);
      }
    } catch (error) {
      console.log(`Error fetching CMS content for ${contentKey}:`, error);
      // Silently fail and use fallback
    }
  }, [contentKey, fallback]);
  
  useEffect(() => {
    fetchContent();
    const intervalId = setInterval(fetchContent, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchContent, refreshInterval]);
  
  return (
    <div 
      className={className} 
      data-cms-key={contentKey}
      dangerouslySetInnerHTML={{ __html: content || fallback }} 
    />
  );
}

/**
 * Component for direct CMS image content fetch without caching
 */
interface DirectCmsImageProps {
  contentKey: string;
  fallbackSrc?: string;
  alt?: string;
  className?: string;
  refreshInterval?: number;
}

export function DirectCmsImage({ contentKey, fallbackSrc = '', alt = '', className = '', refreshInterval = 1000 }: DirectCmsImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  
  const fetchContent = useCallback(async () => {
    try {
      // Folosim apiRequest pentru a gestiona mai bine erorile și headerele
      const response = await apiRequest("GET", `/api/cms/${contentKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setSrc(data.value);
      }
    } catch (error) {
      console.log(`Error fetching CMS content for ${contentKey}:`, error);
      // Silently fail and use fallback
    }
  }, [contentKey, fallbackSrc]);
  
  useEffect(() => {
    fetchContent();
    const intervalId = setInterval(fetchContent, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchContent, refreshInterval]);
  
  if (!src && !fallbackSrc) {
    return null;
  }
  
  return <img src={src || fallbackSrc} alt={alt} className={className} data-cms-key={contentKey} />;
}