import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Settings, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditableSection, SectionType } from './EditableSection';
import { InlineEditControls } from './InlineEditControls';

export type Section = {
  id: string;
  type: SectionType;
  content: Record<string, any>;
  styles?: Record<string, any>;
};

export interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  initialEditMode?: boolean;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({ sections = [], onChange, initialEditMode = false }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [currentSections, setCurrentSections] = useState<Section[]>(sections);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  
  const isAdmin = user?.role === 'admin';
  
  // Update local state when sections prop changes
  useEffect(() => {
    setCurrentSections(sections);
  }, [sections]);
  
  // Handle toggling edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  // Update a section at the specified index
  const handleUpdateSection = (id: string, updatedContent: any) => {
    const updatedSections = currentSections.map(section => 
      section.id === id ? { ...section, content: updatedContent } : section
    );
    setCurrentSections(updatedSections);
    onChange(updatedSections);
  };
  
  // Delete a section
  const handleDeleteSection = (id: string) => {
    if (window.confirm('Ești sigur că vrei să ștergi această secțiune?')) {
      const updatedSections = currentSections.filter(section => section.id !== id);
      setCurrentSections(updatedSections);
      onChange(updatedSections);
    }
  };
  
  // Move a section up or down
  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const index = currentSections.findIndex(section => section.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentSections.length) return;
    
    const updatedSections = [...currentSections];
    const [movedSection] = updatedSections.splice(index, 1);
    updatedSections.splice(newIndex, 0, movedSection);
    
    setCurrentSections(updatedSections);
    onChange(updatedSections);
  };
  
  // Prepare to add a new section
  const handleAddSection = (position: 'before' | 'after', index: number) => {
    setInsertPosition(position === 'before' ? index : index + 1);
    setShowAddSectionDialog(true);
  };
  
  // Create and add a new section
  const createNewSection = (type: SectionType) => {
    const newSection: Section = {
      id: `section-${uuidv4()}`,
      type,
      content: getDefaultContentForType(type),
      styles: {}
    };
    
    const updatedSections = [...currentSections];
    
    if (insertPosition !== null) {
      updatedSections.splice(insertPosition, 0, newSection);
    } else {
      updatedSections.push(newSection);
    }
    
    setCurrentSections(updatedSections);
    onChange(updatedSections);
    setShowAddSectionDialog(false);
    setInsertPosition(null);
  };
  
  // Duplicate a section
  const handleDuplicateSection = (id: string) => {
    const sectionToDuplicate = currentSections.find(section => section.id === id);
    if (!sectionToDuplicate) return;
    
    const newSection: Section = {
      ...sectionToDuplicate,
      id: `section-${uuidv4()}`
    };
    
    const sectionIndex = currentSections.findIndex(section => section.id === id);
    const updatedSections = [...currentSections];
    updatedSections.splice(sectionIndex + 1, 0, newSection);
    
    setCurrentSections(updatedSections);
    onChange(updatedSections);
  };
  
  // Update section styles
  const handleStyleChange = (id: string, styles: Record<string, any>) => {
    const updatedSections = currentSections.map(section => 
      section.id === id ? { ...section, styles: { ...section.styles, ...styles } } : section
    );
    setCurrentSections(updatedSections);
    onChange(updatedSections);
  };
  
  // Helper to get default content for each section type
  const getDefaultContentForType = (type: SectionType): Record<string, any> => {
    switch (type) {
      case 'heading':
        return { text: 'Titlu Nou', size: 32, color: '#000000', alignment: 'left' };
      case 'text':
        return { text: 'Introduceți textul dumneavoastră aici...', size: 16, color: '#333333', alignment: 'left', lineHeight: '1.5' };
      case 'image':
        return { url: '/placeholder-image.jpg', alt: 'Imagine', width: 100, alignment: 'center' };
      case 'hero':
        return { 
          title: 'Titlu Hero', 
          subtitle: 'Subtitlu Hero', 
          backgroundImage: '/placeholder-hero.jpg',
          height: 400
        };
      case 'cards':
        return { 
          title: 'Secțiune Carduri',
          cards: [
            { title: 'Card 1', text: 'Descriere card 1', image: '/placeholder-card.jpg' },
            { title: 'Card 2', text: 'Descriere card 2', image: '/placeholder-card.jpg' },
            { title: 'Card 3', text: 'Descriere card 3', image: '/placeholder-card.jpg' }
          ]
        };
      case 'features':
        return {
          title: 'Caracteristici',
          features: [
            { title: 'Caracteristică 1', text: 'Descriere caracteristică 1', icon: '✅' },
            { title: 'Caracteristică 2', text: 'Descriere caracteristică 2', icon: '✅' },
            { title: 'Caracteristică 3', text: 'Descriere caracteristică 3', icon: '✅' }
          ]
        };
      case 'banners':
        return {
          title: 'Bannere Promoționale',
          subtitle: 'Descoperiți ofertele speciale',
          banners: [
            { image: '/placeholder-banner.jpg', title: 'Banner 1', description: 'Descriere banner 1', linkUrl: '/link1' },
            { image: '/placeholder-banner.jpg', title: 'Banner 2', description: 'Descriere banner 2', linkUrl: '/link2' }
          ],
          displayType: 'carousel'
        };
      case 'cta':
        return {
          title: 'Acționează Acum',
          subtitle: 'Nu rata această oportunitate unică',
          buttonText: 'Află Mai Multe',
          buttonUrl: '/contact',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b'
        };
      case 'pilgrimages':
        return {
          title: 'Pelerinaje disponibile',
          subtitle: 'Descoperă destinațiile spirituale și alege călătoria perfectă pentru tine',
          count: 6,
          featured: false,
          showPromoted: false
        };
      default:
        return {};
    }
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="section-editor-container relative min-h-[300px]">
        {/* Inline Edit Controls - fixed position */}
        {isAdmin && (
          <InlineEditControls 
            isAdmin={isAdmin}
            isEditing={isEditing}
            onEditToggle={handleEditToggle}
            onAddSection={() => {
              setInsertPosition(currentSections.length);
              setShowAddSectionDialog(true);
            }}
            onRemoveSection={() => {}} // Placeholder - we'll use per-section delete
            onMoveSection={() => {}} // Placeholder - we'll use per-section move
            onDuplicateSection={() => {}} // Placeholder - we'll use per-section duplicate
            onStyleChange={() => {}} // Placeholder - we'll use per-section style
            currentStyles={{}}
          />
        )}
        
        {/* Sections */}
        <div className="sections-container pt-12">
          {currentSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-600 mb-4">Nu există secțiuni în această pagină.</p>
              {isAdmin && isEditing && (
                <Button 
                  onClick={() => {
                    setInsertPosition(0);
                    setShowAddSectionDialog(true);
                  }}
                  variant="outline"
                >
                  <Plus size={16} className="mr-2" /> 
                  Adaugă prima secțiune
                </Button>
              )}
            </div>
          ) : (
            currentSections.map((section, index) => (
              <EditableSection
                key={section.id}
                id={section.id}
                type={section.type}
                content={section.content}
                isEditing={isEditing}
                onUpdate={(id, content) => handleUpdateSection(id, content)}
                onDelete={(id) => handleDeleteSection(id)}
                onMove={(id, direction) => handleMoveSection(id, direction)}
                index={index}
                isFirst={index === 0}
                isLast={index === currentSections.length - 1}
                onAddNew={(position, idx) => handleAddSection(position, idx)}
              />
            ))
          )}
        </div>
        
        {/* Add Section Dialog */}
        <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adaugă o secțiune nouă</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="basic">Secțiuni simple</TabsTrigger>
                <TabsTrigger value="complex">Secțiuni complexe</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="py-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('heading')}
                >
                  <span className="text-lg font-bold">H</span>
                  <span className="text-xs">Titlu</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('text')}
                >
                  <span className="text-lg">T</span>
                  <span className="text-xs">Text</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('image')}
                >
                  <span className="text-lg">🖼️</span>
                  <span className="text-xs">Imagine</span>
                </Button>
              </TabsContent>
              
              <TabsContent value="complex" className="py-4 grid grid-cols-2 gap-3">
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('hero')}
                >
                  <span className="text-lg">🏞️</span>
                  <span className="text-xs">Hero</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('cards')}
                >
                  <span className="text-lg">🃏</span>
                  <span className="text-xs">Carduri</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('features')}
                >
                  <span className="text-lg">✅</span>
                  <span className="text-xs">Caracteristici</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('banners')}
                >
                  <span className="text-lg">🎯</span>
                  <span className="text-xs">Bannere</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('cta')}
                >
                  <span className="text-lg">🔔</span>
                  <span className="text-xs">CTA</span>
                </Button>
                
                <Button
                  variant="outline" 
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={() => createNewSection('pilgrimages')}
                >
                  <span className="text-lg">⛪</span>
                  <span className="text-xs">Pelerinaje</span>
                </Button>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddSectionDialog(false)}>
                Anulează
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};