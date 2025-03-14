import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { CmsText, CmsHtml, CmsImage } from '@/components/shared/cms-display';

// Definim toate tipurile necesare pentru componenta
type BuilderComponentProperties = {
  // Proprietăți pentru stilizare CSS
  className?: string;
  id?: string;
  
  // Proprietăți pentru conținut
  isHtml?: boolean;
  imageClassName?: string;
  alt?: string;
  height?: string | number;
  
  // Proprietăți pentru butoane
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  url?: string;
  
  // Proprietăți pentru conținut CMS
  contentType?: 'text' | 'html' | 'image';
  type?: 'text' | 'html' | 'image';  // Pentru compatibilitate
};

type BuilderComponent = {
  id: string;
  type: 'heading' | 'text' | 'image' | 'spacer' | 'button' | 'cmsContent';
  content?: string;
  cmsKey?: string;
  properties?: BuilderComponentProperties;
};

type BuilderSection = {
  id: string;
  title: string;
  components: BuilderComponent[];
  className?: string;  // Clase CSS pentru secțiune
  id_css?: string;     // ID CSS pentru secțiune
  styles?: Record<string, string>; // Stiluri CSS inline
};

interface BuilderRendererProps {
  content: string;
  className?: string;
}

export const BuilderRenderer: React.FC<BuilderRendererProps> = ({ content, className = '' }) => {
  const [, navigate] = useLocation();
  let sections: BuilderSection[] = [];

  try {
    sections = JSON.parse(content);
  } catch (error) {
    console.error('Eroare la parsarea conținutului paginii builder:', error);
    return <div className="p-4 text-red-500">Eroare la încărcarea conținutului paginii</div>;
  }

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return <div className="p-4 text-gray-500">Nu există conținut pentru această pagină</div>;
  }

  return (
    <div className={`builder-content ${className}`}>
      {sections.map((section) => (
        <div 
          key={section.id} 
          className={`builder-section mb-10 ${section.className || ''}`}
          id={section.id_css || undefined}
          style={section.styles || {}}
        >
          {/* Aici putem adăuga antetul secțiunii dacă dorim să-l afișăm */}
          <div className="builder-section-content">
            {section.components.map((component) => (
              <div key={component.id} className="builder-component mb-4">
                {component.type === 'heading' && (
                  <h2 
                    className={`text-3xl font-bold ${component.properties?.className || ''}`}
                    id={component.properties?.id || undefined}
                  >
                    {component.content}
                  </h2>
                )}
                
                {component.type === 'text' && (
                  <div 
                    className={`text-base ${component.properties?.className || ''}`}
                    id={component.properties?.id || undefined}
                  >
                    {component.properties?.isHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: component.content || '' }} />
                    ) : (
                      <p>{component.content}</p>
                    )}
                  </div>
                )}
                
                {component.type === 'image' && (
                  <div 
                    className={`${component.properties?.className || ''}`}
                    id={component.properties?.id || undefined}
                  >
                    <img 
                      src={component.content} 
                      alt={component.properties?.alt || ''} 
                      className={`max-w-full ${component.properties?.imageClassName || ''}`}
                    />
                  </div>
                )}
                
                {component.type === 'spacer' && (
                  <div 
                    style={{ height: component.properties?.height || '2rem' }} 
                    className={component.properties?.className || ''}
                    id={component.properties?.id || undefined}
                  />
                )}
                
                {component.type === 'button' && (
                  <Button
                    variant={component.properties?.variant || 'default'}
                    size={component.properties?.size || 'default'}
                    className={component.properties?.className || ''}
                    id={component.properties?.id || undefined}
                    onClick={() => component.properties?.url && navigate(component.properties.url)}
                  >
                    {component.content}
                  </Button>
                )}
                
                {component.type === 'cmsContent' && component.cmsKey && (
                  <div 
                    className={component.properties?.className || ''}
                    id={component.properties?.id || undefined}
                  >
                    {component.properties?.type === 'html' ? (
                      <CmsHtml contentKey={component.cmsKey} fallback="" className="" />
                    ) : component.properties?.type === 'image' ? (
                      <CmsImage
                        contentKey={component.cmsKey}
                        fallbackSrc=""
                        alt={component.properties?.alt || ''}
                        className={component.properties?.imageClassName || ''}
                      />
                    ) : (
                      <CmsText contentKey={component.cmsKey} fallback="" className="" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};