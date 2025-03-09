import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

export function DirectCmsText({ contentKey, fallback = '', className = '', refreshInterval = 2000 }: DirectCmsTextProps) {
  const [content, setContent] = useState<string>(fallback);
  const [error, setError] = useState<boolean>(false);
  const { toast } = useToast();
  
  const fetchContent = useCallback(async () => {
    if (!contentKey) return;
    
    try {
      // Folosim apiRequest pentru o gestionare mai bună a erorilor
      const response = await apiRequest('GET', `/api/cms/${contentKey}`);
      
      if (!response.ok) {
        // Silently fail and use fallback
        setError(true);
        return;
      }
      
      const data = await response.json();
      if (data && data.value) {
        setContent(data.value);
        setError(false);
      }
    } catch (err) {
      setError(true);
      // Nu arătăm erorile în consolă pentru reducerea zgomotului
    }
  }, [contentKey]);
  
  useEffect(() => {
    // Initial fetch
    let isMounted = true;
    
    const doFetch = async () => {
      if (isMounted) {
        await fetchContent();
      }
    };
    
    doFetch();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(doFetch, refreshInterval);
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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

export function DirectCmsHtml({ contentKey, fallback = '', className = '', refreshInterval = 2000 }: DirectCmsHtmlProps) {
  const [content, setContent] = useState<string>(fallback);
  const [error, setError] = useState<boolean>(false);
  
  const fetchContent = useCallback(async () => {
    if (!contentKey) return;
    
    try {
      // Folosim apiRequest pentru o gestionare mai bună a erorilor
      const response = await apiRequest('GET', `/api/cms/${contentKey}`);
      
      if (!response.ok) {
        // Silently fail and use fallback
        setError(true);
        return;
      }
      
      const data = await response.json();
      if (data && data.value) {
        setContent(data.value);
        setError(false);
      }
    } catch (err) {
      setError(true);
      // Nu arătăm erorile în consolă pentru reducerea zgomotului
    }
  }, [contentKey]);
  
  useEffect(() => {
    // Initial fetch
    let isMounted = true;
    
    const doFetch = async () => {
      if (isMounted) {
        await fetchContent();
      }
    };
    
    doFetch();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(doFetch, refreshInterval);
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
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

export function DirectCmsImage({ contentKey, fallbackSrc = '', alt = '', className = '', refreshInterval = 2000 }: DirectCmsImageProps) {
  const [src, setSrc] = useState<string>(fallbackSrc);
  const [error, setError] = useState<boolean>(false);
  
  const fetchContent = useCallback(async () => {
    if (!contentKey) return;
    
    try {
      // Folosim apiRequest pentru o gestionare mai bună a erorilor
      const response = await apiRequest('GET', `/api/cms/${contentKey}`);
      
      if (!response.ok) {
        // Silently fail and use fallback
        setError(true);
        return;
      }
      
      const data = await response.json();
      if (data && data.value) {
        setSrc(data.value);
        setError(false);
      }
    } catch (err) {
      setError(true);
      // Nu arătăm erorile în consolă pentru reducerea zgomotului
    }
  }, [contentKey]);
  
  useEffect(() => {
    // Initial fetch
    let isMounted = true;
    
    const doFetch = async () => {
      if (isMounted) {
        await fetchContent();
      }
    };
    
    doFetch();
    
    // Set up interval for periodic refresh
    const intervalId = setInterval(doFetch, refreshInterval);
    
    // Clean up on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchContent, refreshInterval]);
  
  if (!src && !fallbackSrc) {
    return null;
  }
  
  return <img src={src || fallbackSrc} alt={alt} className={className} data-cms-key={contentKey} />;
}