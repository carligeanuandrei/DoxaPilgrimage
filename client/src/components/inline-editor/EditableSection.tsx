import React, { useState, useRef, useEffect } from 'react';
import { Edit, Save, Trash2, Plus, Move, GripVertical, Check, Star, Heart } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SelectColor } from './SelectColor';
import { useAuth } from '@/hooks/use-auth';
import { PilgrimagesRenderer } from './PilgrimagesRenderer';

export type SectionType = 'text' | 'heading' | 'image' | 'hero' | 'cards' | 'features' | 'banners' | 'cta' | 'pilgrimages';

interface EditableSectionProps {
  id: string;
  type: SectionType;
  content: any;
  isEditing: boolean;
  onUpdate: (id: string, content: any) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onAddNew: (position: 'before' | 'after', index: number) => void;
}

export function EditableSection({
  id,
  type,
  content,
  isEditing,
  onUpdate,
  onDelete,
  onMove,
  index,
  isFirst,
  isLast,
  onAddNew
}: EditableSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleStartEdit = () => {
    setIsEditable(true);
  };

  const handleSave = () => {
    onUpdate(id, localContent);
    setIsEditable(false);
  };

  const handleCancel = () => {
    setLocalContent(content);
    setIsEditable(false);
  };
  
  // Drag-and-drop functionality for reordering
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SECTION',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: isEditing && isAdmin
  }));
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SECTION',
    hover(item: { id: string, index: number }, monitor) {
      if (!sectionRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determine rectangle on screen
      const hoverBoundingRect = sectionRef.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      
      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Move upward
      if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        onMove(item.id, 'up');
        item.index = hoverIndex;
      }
      
      // Move downward
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        onMove(item.id, 'down');
        item.index = hoverIndex;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [index, onMove]);
  
  // Combine drag and drop refs
  const dragDropRef = (el: HTMLDivElement) => {
    drag(el);
    drop(el);
    sectionRef.current = el;
  };
  
  // Custom styles based on state
  const sectionStyles = {
    opacity: isDragging ? 0.5 : 1,
    border: isOver ? '2px dashed #3182ce' : isHovered && isEditing ? '2px dashed #e2e8f0' : '2px solid transparent',
    position: 'relative' as const,
    transition: 'all 0.2s ease',
    ...content.styles
  };
  
  // Generate actual section content based on type
  const renderSectionContent = () => {
    switch (type) {
      case 'heading':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="headingText">Text titlu</Label>
              <Input 
                id="headingText"
                value={localContent.text || ''}
                onChange={e => setLocalContent({...localContent, text: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headingSize">Mărime (px)</Label>
                <Input 
                  id="headingSize"
                  type="number"
                  value={localContent.size || 24}
                  onChange={e => setLocalContent({...localContent, size: parseInt(e.target.value)})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="headingColor">Culoare</Label>
                <SelectColor 
                  id="headingColor"
                  value={localContent.color || '#000000'}
                  onChange={(color) => setLocalContent({...localContent, color})}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <h2 
            style={{
              fontSize: `${localContent.size || 24}px`,
              color: localContent.color || '#000000',
              textAlign: localContent.alignment || 'left',
              marginBottom: `${localContent.marginBottom || 0}px`,
              marginTop: `${localContent.marginTop || 0}px`,
            }}
          >
            {localContent.text || 'Titlu secțiune'}
          </h2>
        );
        
      case 'text':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="textContent">Conținut text</Label>
              <Textarea 
                id="textContent"
                value={localContent.text || ''}
                onChange={e => setLocalContent({...localContent, text: e.target.value})}
                className="mt-1 min-h-[200px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textSize">Mărime (px)</Label>
                <Input 
                  id="textSize"
                  type="number"
                  value={localContent.size || 16}
                  onChange={e => setLocalContent({...localContent, size: parseInt(e.target.value)})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="textColor">Culoare</Label>
                <SelectColor 
                  id="textColor"
                  value={localContent.color || '#000000'}
                  onChange={(color) => setLocalContent({...localContent, color})}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <p 
            style={{
              fontSize: `${localContent.size || 16}px`,
              color: localContent.color || '#000000',
              textAlign: localContent.alignment || 'left',
              lineHeight: localContent.lineHeight || '1.5',
            }}
          >
            {localContent.text || 'Text secțiune'}
          </p>
        );
        
      case 'image':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="imageUrl">URL Imagine</Label>
              <Input 
                id="imageUrl"
                value={localContent.url || ''}
                onChange={e => setLocalContent({...localContent, url: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="imageAlt">Text alternativ</Label>
              <Input 
                id="imageAlt"
                value={localContent.alt || ''}
                onChange={e => setLocalContent({...localContent, alt: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageWidth">Lățime (%)</Label>
                <Input 
                  id="imageWidth"
                  type="number"
                  min="10"
                  max="100"
                  value={localContent.width || 100}
                  onChange={e => setLocalContent({...localContent, width: parseInt(e.target.value)})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageAlignment">Aliniere</Label>
                <select
                  id="imageAlignment"
                  value={localContent.alignment || 'center'}
                  onChange={e => setLocalContent({...localContent, alignment: e.target.value})}
                  className="w-full h-10 px-3 mt-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Stânga</option>
                  <option value="center">Centru</option>
                  <option value="right">Dreapta</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div 
            style={{
              textAlign: localContent.alignment || 'center',
              width: '100%',
            }}
          >
            <img 
              src={localContent.url || '/placeholder-image.jpg'} 
              alt={localContent.alt || 'Imagine secțiune'} 
              style={{
                width: `${localContent.width || 100}%`,
                maxWidth: '100%',
                display: 'inline-block',
              }}
            />
          </div>
        );
        
      case 'hero':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="heroTitle">Titlu hero</Label>
              <Input 
                id="heroTitle"
                value={localContent.title || ''}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Subtitlu</Label>
              <Input 
                id="heroSubtitle"
                value={localContent.subtitle || ''}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroBackground">Imagine fundal URL</Label>
              <Input 
                id="heroBackground"
                value={localContent.backgroundImage || ''}
                onChange={e => setLocalContent({...localContent, backgroundImage: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroHeight">Înălțime (px)</Label>
              <Input 
                id="heroHeight"
                type="number"
                value={localContent.height || 400}
                onChange={e => setLocalContent({...localContent, height: parseInt(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div 
            style={{
              height: `${localContent.height || 400}px`,
              backgroundImage: `url(${localContent.backgroundImage || '/placeholder-hero.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#fff',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {localContent.title || 'Titlu secțiune Hero'}
              </h1>
              <p style={{ fontSize: '1.25rem' }}>
                {localContent.subtitle || 'Subtitlu secțiune Hero'}
              </p>
            </div>
          </div>
        );
        
      case 'cards':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="cardsTitle">Titlu secțiune</Label>
              <Input 
                id="cardsTitle"
                value={localContent.title || ''}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="cardsSubtitle">Subtitlu</Label>
              <Input 
                id="cardsSubtitle"
                value={localContent.subtitle || ''}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Carduri</Label>
              <div className="space-y-4 mt-2">
                {(localContent.cards || []).map((card: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Card {idx + 1}</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const updatedCards = [...(localContent.cards || [])];
                          updatedCards.splice(idx, 1);
                          setLocalContent({...localContent, cards: updatedCards});
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`cardTitle-${idx}`}>Titlu</Label>
                        <Input 
                          id={`cardTitle-${idx}`}
                          value={card.title || ''}
                          onChange={e => {
                            const updatedCards = [...(localContent.cards || [])];
                            updatedCards[idx] = {...card, title: e.target.value};
                            setLocalContent({...localContent, cards: updatedCards});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cardDesc-${idx}`}>Descriere</Label>
                        <Textarea 
                          id={`cardDesc-${idx}`}
                          value={card.description || ''}
                          onChange={e => {
                            const updatedCards = [...(localContent.cards || [])];
                            updatedCards[idx] = {...card, description: e.target.value};
                            setLocalContent({...localContent, cards: updatedCards});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cardImage-${idx}`}>URL Imagine</Label>
                        <Input 
                          id={`cardImage-${idx}`}
                          value={card.imageUrl || ''}
                          onChange={e => {
                            const updatedCards = [...(localContent.cards || [])];
                            updatedCards[idx] = {...card, imageUrl: e.target.value};
                            setLocalContent({...localContent, cards: updatedCards});
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newCard = { title: '', description: '', imageUrl: '' };
                    setLocalContent({
                      ...localContent, 
                      cards: [...(localContent.cards || []), newCard]
                    });
                  }}
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" /> Adaugă card
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{localContent.title || 'Titlu Secțiune Carduri'}</h2>
              {localContent.subtitle && <p className="text-gray-600">{localContent.subtitle}</p>}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(localContent.cards || []).map((card: any, idx: number) => (
                <Card key={idx} className="overflow-hidden">
                  {card.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={card.imageUrl} 
                        alt={card.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h3 className="text-xl font-semibold mb-2">{card.title || `Card ${idx + 1}`}</h3>
                    <p className="text-gray-600">{card.description || 'Descriere card'}</p>
                  </CardContent>
                </Card>
              ))}
              {(!localContent.cards || localContent.cards.length === 0) && (
                <Card className="col-span-3 p-8 text-center">
                  <p className="text-gray-500">Niciun card adăugat. Editați secțiunea pentru a adăuga carduri.</p>
                </Card>
              )}
            </div>
          </div>
        );

      case 'features':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="featuresTitle">Titlu secțiune</Label>
              <Input 
                id="featuresTitle"
                value={localContent.title || ''}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="featuresSubtitle">Subtitlu</Label>
              <Input 
                id="featuresSubtitle"
                value={localContent.subtitle || ''}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Funcționalități</Label>
              <div className="space-y-4 mt-2">
                {(localContent.features || []).map((feature: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Funcționalitate {idx + 1}</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const updatedFeatures = [...(localContent.features || [])];
                          updatedFeatures.splice(idx, 1);
                          setLocalContent({...localContent, features: updatedFeatures});
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`featureTitle-${idx}`}>Titlu</Label>
                        <Input 
                          id={`featureTitle-${idx}`}
                          value={feature.title || ''}
                          onChange={e => {
                            const updatedFeatures = [...(localContent.features || [])];
                            updatedFeatures[idx] = {...feature, title: e.target.value};
                            setLocalContent({...localContent, features: updatedFeatures});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`featureDesc-${idx}`}>Descriere</Label>
                        <Textarea 
                          id={`featureDesc-${idx}`}
                          value={feature.description || ''}
                          onChange={e => {
                            const updatedFeatures = [...(localContent.features || [])];
                            updatedFeatures[idx] = {...feature, description: e.target.value};
                            setLocalContent({...localContent, features: updatedFeatures});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`featureIcon-${idx}`}>Icon (ex: check, star, heart, etc)</Label>
                        <Input 
                          id={`featureIcon-${idx}`}
                          value={feature.icon || ''}
                          onChange={e => {
                            const updatedFeatures = [...(localContent.features || [])];
                            updatedFeatures[idx] = {...feature, icon: e.target.value};
                            setLocalContent({...localContent, features: updatedFeatures});
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newFeature = { title: '', description: '', icon: 'check' };
                    setLocalContent({
                      ...localContent, 
                      features: [...(localContent.features || []), newFeature]
                    });
                  }}
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" /> Adaugă funcționalitate
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{localContent.title || 'Titlu Secțiune Funcționalități'}</h2>
              {localContent.subtitle && <p className="text-gray-600 mb-4">{localContent.subtitle}</p>}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(localContent.features || []).map((feature: any, idx: number) => (
                <Card key={idx} className="p-6">
                  <div className="mb-4 text-primary">
                    {feature.icon === 'check' && <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Check className="h-6 w-6" /></div>}
                    {feature.icon === 'star' && <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Star className="h-6 w-6" /></div>}
                    {feature.icon === 'heart' && <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Heart className="h-6 w-6" /></div>}
                    {!['check', 'star', 'heart'].includes(feature.icon) && <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Check className="h-6 w-6" /></div>}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title || `Funcționalitate ${idx + 1}`}</h3>
                  <p className="text-gray-600">{feature.description || 'Descriere funcționalitate'}</p>
                </Card>
              ))}
              {(!localContent.features || localContent.features.length === 0) && (
                <Card className="col-span-3 p-8 text-center">
                  <p className="text-gray-500">Nicio funcționalitate adăugată. Editați secțiunea pentru a adăuga funcționalități.</p>
                </Card>
              )}
            </div>
          </div>
        );
        
      case 'banners':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="bannersTitle">Titlu secțiune</Label>
              <Input 
                id="bannersTitle"
                value={localContent.title || ''}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bannersSubtitle">Subtitlu</Label>
              <Input 
                id="bannersSubtitle"
                value={localContent.subtitle || ''}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bannersDisplayType">Tip afișare</Label>
              <select
                id="bannersDisplayType"
                value={localContent.displayType || 'carousel'}
                onChange={e => setLocalContent({...localContent, displayType: e.target.value})}
                className="w-full h-10 px-3 mt-1 text-sm border rounded-md"
              >
                <option value="carousel">Carusel</option>
                <option value="grid">Grid</option>
              </select>
            </div>
            <div>
              <Label>Bannere</Label>
              <div className="space-y-4 mt-2">
                {(localContent.banners || []).map((banner: any, idx: number) => (
                  <Card key={idx} className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Banner {idx + 1}</h4>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const updatedBanners = [...(localContent.banners || [])];
                          updatedBanners.splice(idx, 1);
                          setLocalContent({...localContent, banners: updatedBanners});
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`bannerImage-${idx}`}>Imagine URL</Label>
                        <Input 
                          id={`bannerImage-${idx}`}
                          value={banner.image || ''}
                          onChange={e => {
                            const updatedBanners = [...(localContent.banners || [])];
                            updatedBanners[idx] = {...banner, image: e.target.value};
                            setLocalContent({...localContent, banners: updatedBanners});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`bannerTitle-${idx}`}>Titlu</Label>
                        <Input 
                          id={`bannerTitle-${idx}`}
                          value={banner.title || ''}
                          onChange={e => {
                            const updatedBanners = [...(localContent.banners || [])];
                            updatedBanners[idx] = {...banner, title: e.target.value};
                            setLocalContent({...localContent, banners: updatedBanners});
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`bannerDescription-${idx}`}>Descriere</Label>
                        <Textarea 
                          id={`bannerDescription-${idx}`}
                          value={banner.description || ''}
                          onChange={e => {
                            const updatedBanners = [...(localContent.banners || [])];
                            updatedBanners[idx] = {...banner, description: e.target.value};
                            setLocalContent({...localContent, banners: updatedBanners});
                          }}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`bannerLinkUrl-${idx}`}>URL Link</Label>
                        <Input 
                          id={`bannerLinkUrl-${idx}`}
                          value={banner.linkUrl || ''}
                          onChange={e => {
                            const updatedBanners = [...(localContent.banners || [])];
                            updatedBanners[idx] = {...banner, linkUrl: e.target.value};
                            setLocalContent({...localContent, banners: updatedBanners});
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const updatedBanners = [...(localContent.banners || [])];
                    updatedBanners.push({ 
                      image: '/placeholder-banner.jpg', 
                      title: 'Titlu Banner', 
                      description: 'Descriere banner', 
                      linkUrl: '/link' 
                    });
                    setLocalContent({...localContent, banners: updatedBanners});
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Adaugă banner
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div className="my-8">
            <h3 className="text-2xl font-semibold mb-1 text-center">{localContent.title || 'Bannere Promoționale'}</h3>
            <p className="text-gray-600 mb-6 text-center">{localContent.subtitle || 'Descoperiți ofertele speciale'}</p>
            
            <div className={localContent.displayType === 'grid' ? 
              "grid grid-cols-1 md:grid-cols-2 gap-6" : 
              "flex overflow-x-auto gap-4 pb-4"
            }>
              {(localContent.banners || []).map((banner: any, idx: number) => (
                <a key={idx} 
                  href={banner.linkUrl || '#'} 
                  className={`block ${localContent.displayType === 'carousel' ? 'min-w-[280px] md:min-w-[320px]' : ''}`}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-[200px]">
                      <img 
                        src={banner.image || '/placeholder-banner.jpg'} 
                        alt={banner.title || 'Banner'} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h4 className="text-white font-medium text-lg">{banner.title || 'Titlu Banner'}</h4>
                        <p className="text-white/90 text-sm">{banner.description || 'Descriere banner'}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="ctaTitle">Titlu secțiune</Label>
              <Input 
                id="ctaTitle"
                value={localContent.title || ''}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ctaSubtitle">Subtitlu</Label>
              <Input 
                id="ctaSubtitle"
                value={localContent.subtitle || ''}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ctaButtonText">Text buton</Label>
              <Input 
                id="ctaButtonText"
                value={localContent.buttonText || ''}
                onChange={e => setLocalContent({...localContent, buttonText: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ctaButtonUrl">URL buton</Label>
              <Input 
                id="ctaButtonUrl"
                value={localContent.buttonUrl || ''}
                onChange={e => setLocalContent({...localContent, buttonUrl: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaBackgroundColor">Culoare fundal</Label>
                <SelectColor 
                  id="ctaBackgroundColor"
                  value={localContent.backgroundColor || '#f8fafc'}
                  onChange={(color) => setLocalContent({...localContent, backgroundColor: color})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ctaTextColor">Culoare text</Label>
                <SelectColor 
                  id="ctaTextColor"
                  value={localContent.textColor || '#1e293b'}
                  onChange={(color) => setLocalContent({...localContent, textColor: color})}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div 
            className="my-12 py-16 px-4 rounded-xl text-center" 
            style={{ backgroundColor: localContent.backgroundColor || '#f8fafc' }}
          >
            <h3 
              className="text-3xl font-bold mb-3" 
              style={{ color: localContent.textColor || '#1e293b' }}
            >
              {localContent.title || 'Acționează Acum'}
            </h3>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto" 
              style={{ color: localContent.textColor || '#1e293b' }}
            >
              {localContent.subtitle || 'Nu rata această oportunitate unică'}
            </p>
            <a 
              href={localContent.buttonUrl || '/contact'} 
              className="inline-block py-3 px-8 rounded-lg font-medium transition-colors duration-200 bg-primary text-white hover:bg-primary/90"
            >
              {localContent.buttonText || 'Află Mai Multe'}
            </a>
          </div>
        );
        
      case 'pilgrimages':
        return isEditable ? (
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="pilgrimagesTitle">Titlu secțiune</Label>
              <Input 
                id="pilgrimagesTitle"
                value={localContent.title || 'Pelerinaje disponibile'}
                onChange={e => setLocalContent({...localContent, title: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pilgrimagesSubtitle">Subtitlu</Label>
              <Input 
                id="pilgrimagesSubtitle"
                value={localContent.subtitle || 'Descoperă destinațiile spirituale și alege călătoria perfectă pentru tine'}
                onChange={e => setLocalContent({...localContent, subtitle: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pilgrimagesCount">Număr pelerinaje afișate</Label>
              <Input 
                id="pilgrimagesCount"
                type="number"
                min="1"
                max="12"
                value={localContent.count || 6}
                onChange={e => setLocalContent({...localContent, count: parseInt(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="pilgrimagesFeatured"
                checked={localContent.featured || false}
                onChange={e => setLocalContent({...localContent, featured: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="pilgrimagesFeatured">Afișează doar pelerinaje promovate</Label>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <input
                type="checkbox"
                id="pilgrimagesShowPromoted"
                checked={localContent.showPromoted || false}
                onChange={e => setLocalContent({...localContent, showPromoted: e.target.checked})}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="pilgrimagesShowPromoted">Afișează doar pelerinaje în promoție</Label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancel}>Anulează</Button>
              <Button onClick={handleSave}>Salvează</Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <PilgrimagesRenderer
              title={localContent.title}
              subtitle={localContent.subtitle}
              count={localContent.count || 6}
              featured={localContent.featured}
              showPromoted={localContent.showPromoted}
            />
          </div>
        );
        
      default:
        return (
          <div className="p-4 bg-gray-100">
            <p>Tip secțiune necunoscut: {type}</p>
          </div>
        );
    }
  };
  
  // Render section controls if editing is enabled
  const renderControls = () => {
    if (!isEditing || !isAdmin) return null;
    
    return (
      <div 
        className="absolute -top-10 right-0 flex items-center gap-1 bg-white shadow-md rounded-md px-2 py-1 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAddNew('before', index)}
          title="Adaugă secțiune înainte"
        >
          <Plus size={16} className="mr-1" />
          Adaugă înainte
        </Button>
        
        {!isFirst && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMove(id, 'up')}
            title="Mută în sus"
          >
            <Move size={16} className="rotate-180" />
          </Button>
        )}
        
        {!isLast && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMove(id, 'down')}
            title="Mută în jos"
          >
            <Move size={16} />
          </Button>
        )}
        
        {isEditable ? (
          <>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              title="Salvează"
            >
              <Save size={16} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              title="Anulează"
            >
              Anulează
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartEdit}
            title="Editează"
          >
            <Edit size={16} />
          </Button>
        )}
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(id)}
          title="Șterge"
        >
          <Trash2 size={16} />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAddNew('after', index)}
          title="Adaugă secțiune după"
        >
          <Plus size={16} className="mr-1" />
          Adaugă după
        </Button>
        
        {isEditing && (
          <div 
            className="cursor-move" 
            title="Drag pentru reordonare"
          >
            <GripVertical size={16} />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      ref={dragDropRef}
      className="relative mb-8 pt-10"
      style={sectionStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderControls()}
      <div className="p-4">
        {renderSectionContent()}
      </div>
    </div>
  );
}