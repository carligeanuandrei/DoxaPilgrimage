import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  MoveUp, 
  MoveDown, 
  Trash, 
  Settings, 
  PlusCircle,
  MousePointer,
  GripVertical
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { InlineEditable } from './InlineEditable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SectionProps {
  id: string;
  children: React.ReactNode;
  title?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onAddElement?: (type: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  canDrag?: boolean;
  bgColor?: string;
  padding?: string;
  margin?: string;
  index?: number;
  moveSection?: (dragIndex: number, hoverIndex: number) => void;
}

interface ElementProps {
  id: string;
  type: string;
  contentKey: string;
  defaultValue: string;
  children?: React.ReactNode;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  index?: number;
  moveElement?: (dragIndex: number, hoverIndex: number) => void;
}

// Draggable Section Component
const DraggableSection: React.FC<SectionProps> = ({
  id,
  children,
  title,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSettings,
  onAddElement,
  isFirst,
  isLast,
  bgColor = 'transparent',
  padding = '1rem',
  margin = '1rem 0',
  index,
  moveSection
}) => {
  const { user } = useAuth();
  const [showControls, setShowControls] = useState(false);
  const [isAddElementDialogOpen, setIsAddElementDialogOpen] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    const handleToggleEditMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsEditModeActive(customEvent.detail.active);
    };
    
    window.addEventListener('toggleEditMode', handleToggleEditMode);
    return () => {
      window.removeEventListener('toggleEditMode', handleToggleEditMode);
    };
  }, []);

  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, dragRef] = useDrag({
    type: 'SECTION',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditModeActive && !!index !== undefined && !!moveSection,
  });
  
  const [, dropRef] = useDrop({
    accept: 'SECTION',
    hover(item: { id: string, index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index as number;
      
      if (dragIndex === hoverIndex) return;
      if (!moveSection) return;
      
      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  // Connect drag and drop refs
  dragRef(dropRef(ref));

  const handleAddElement = (type: string) => {
    if (onAddElement) {
      onAddElement(type);
      setIsAddElementDialogOpen(false);
    }
  };

  // If not in admin mode or not in edit mode, just render children
  if (!isAdmin || !isEditModeActive) {
    return (
      <section 
        id={id} 
        style={{ 
          backgroundColor: bgColor, 
          padding, 
          margin
        }}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id={id}
      style={{
        backgroundColor: bgColor,
        padding,
        margin,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        border: '1px dashed #ddd'
      }}
      className="section-editor group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {showControls && (
        <div className="section-controls absolute top-0 right-0 bg-white p-1 border rounded shadow-sm z-40 flex items-center space-x-1">
          <div className="px-2 text-xs text-gray-500">{title || id}</div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onSettings}
            title="Setări secțiune"
          >
            <Settings size={15} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsAddElementDialogOpen(true)}
            title="Adaugă element"
          >
            <PlusCircle size={15} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Mută în sus"
          >
            <MoveUp size={15} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onMoveDown}
            disabled={isLast}
            title="Mută în jos"
          >
            <MoveDown size={15} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
            title="Șterge secțiune"
          >
            <Trash size={15} />
          </Button>
          
          <div 
            className="h-7 w-7 flex items-center justify-center cursor-move text-gray-400 hover:text-gray-600"
            title="Trage pentru a reordona"
          >
            <GripVertical size={15} />
          </div>
        </div>
      )}
      
      {/* Add element dialog */}
      <Dialog open={isAddElementDialogOpen} onOpenChange={setIsAddElementDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă element în secțiune</DialogTitle>
          </DialogHeader>
          <div className="py-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('text')}
            >
              <span className="text-lg font-semibold">T</span>
              <span className="text-xs">Text</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('heading')}
            >
              <span className="text-lg font-bold">H</span>
              <span className="text-xs">Titlu</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('image')}
            >
              <span className="text-lg">🖼️</span>
              <span className="text-xs">Imagine</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('button')}
            >
              <span className="text-sm border px-2 py-1 rounded">Buton</span>
              <span className="text-xs">Buton</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('spacing')}
            >
              <span className="text-lg">↕️</span>
              <span className="text-xs">Spațiu</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => handleAddElement('html')}
            >
              <span className="text-lg">&lt;/&gt;</span>
              <span className="text-xs">HTML</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {children}
    </section>
  );
};

// Draggable Element Component
const DraggableElement: React.FC<ElementProps> = ({
  id,
  type,
  contentKey,
  defaultValue,
  children,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
  moveElement
}) => {
  const { user } = useAuth();
  const [showControls, setShowControls] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    const handleToggleEditMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsEditModeActive(customEvent.detail.active);
    };
    
    window.addEventListener('toggleEditMode', handleToggleEditMode);
    return () => {
      window.removeEventListener('toggleEditMode', handleToggleEditMode);
    };
  }, []);

  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, dragRef] = useDrag({
    type: 'ELEMENT',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isEditModeActive && !!index !== undefined && !!moveElement,
  });
  
  const [, dropRef] = useDrop({
    accept: 'ELEMENT',
    hover(item: { id: string, index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index as number;
      
      if (dragIndex === hoverIndex) return;
      if (!moveElement) return;
      
      moveElement(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  // Connect drag and drop refs
  dragRef(dropRef(ref));

  // If not admin or edit mode not active, just render the editable content
  if (!isAdmin || !isEditModeActive) {
    return children || (
      <InlineEditable 
        type={type as any}
        contentKey={contentKey}
        defaultValue={defaultValue}
      />
    );
  }

  return (
    <div
      ref={ref}
      className="element-editor group relative border border-dashed border-gray-200 p-2 my-2"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {showControls && (
        <div className="element-controls absolute top-2 right-2 bg-white p-1 border rounded shadow-sm z-40 flex items-center space-x-1">
          <div className="px-2 text-xs text-gray-500">{type}</div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Mută în sus"
          >
            <MoveUp size={12} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onMoveDown}
            disabled={isLast}
            title="Mută în jos"
          >
            <MoveDown size={12} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
            title="Șterge element"
          >
            <Trash size={12} />
          </Button>
          
          <div 
            className="h-6 w-6 flex items-center justify-center cursor-move text-gray-400 hover:text-gray-600"
            title="Trage pentru a reordona"
          >
            <GripVertical size={12} />
          </div>
        </div>
      )}
      
      {children || (
        <InlineEditable 
          type={type as any}
          contentKey={contentKey}
          defaultValue={defaultValue}
        />
      )}
    </div>
  );
};

export interface SectionEditorProps {
  sections: Array<{
    id: string;
    title: string;
    elements: Array<{
      id: string;
      type: string;
      contentKey: string;
      defaultValue: string;
    }>;
    bgColor?: string;
    padding?: string;
    margin?: string;
  }>;
  onChange: (sections: any[]) => void;
}

// Main Section Editor Component
export const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onChange }) => {
  const { user } = useAuth();
  const [editSections, setEditSections] = useState(sections);
  const [sectionToEdit, setSectionToEdit] = useState<any>(null);
  const [isSectionSettingsOpen, setIsSectionSettingsOpen] = useState(false);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    setEditSections(sections);
  }, [sections]);
  
  useEffect(() => {
    const handleToggleEditMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsEditModeActive(customEvent.detail.active);
    };
    
    window.addEventListener('toggleEditMode', handleToggleEditMode);
    return () => {
      window.removeEventListener('toggleEditMode', handleToggleEditMode);
    };
  }, []);

  const addNewSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'Secțiune nouă',
      elements: [],
      bgColor: 'transparent',
      padding: '1rem',
      margin: '1rem 0'
    };
    const updatedSections = [...editSections, newSection];
    setEditSections(updatedSections);
    onChange(updatedSections);
  };

  const moveSection = (dragIndex: number, hoverIndex: number) => {
    const dragSection = editSections[dragIndex];
    const newSections = [...editSections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, dragSection);
    setEditSections(newSections);
    onChange(newSections);
  };

  const updateSection = (index: number, updates: any) => {
    const newSections = [...editSections];
    newSections[index] = { ...newSections[index], ...updates };
    setEditSections(newSections);
    onChange(newSections);
  };

  const deleteSection = (index: number) => {
    if (window.confirm('Ești sigur că vrei să ștergi această secțiune?')) {
      const newSections = [...editSections];
      newSections.splice(index, 1);
      setEditSections(newSections);
      onChange(newSections);
    }
  };

  const moveElement = (sectionIndex: number, dragIndex: number, hoverIndex: number) => {
    const newSections = [...editSections];
    const section = newSections[sectionIndex];
    const dragElement = section.elements[dragIndex];
    
    section.elements.splice(dragIndex, 1);
    section.elements.splice(hoverIndex, 0, dragElement);
    
    setEditSections(newSections);
    onChange(newSections);
  };

  const addElement = (sectionIndex: number, type: string) => {
    const newSections = [...editSections];
    const section = newSections[sectionIndex];
    const elementId = `${type}-${Date.now()}`;
    const contentKey = `page_${type}_${Date.now()}`;
    
    let defaultValue = '';
    if (type === 'heading') defaultValue = 'Titlu nou';
    if (type === 'text') defaultValue = 'Introduceți text aici...';
    if (type === 'button') defaultValue = 'Buton';
    if (type === 'spacing') defaultValue = '1';
    
    const newElement = {
      id: elementId,
      type,
      contentKey,
      defaultValue
    };
    
    section.elements.push(newElement);
    setEditSections(newSections);
    onChange(newSections);
  };

  const updateElement = (sectionIndex: number, elementIndex: number, updates: any) => {
    const newSections = [...editSections];
    const section = newSections[sectionIndex];
    section.elements[elementIndex] = { ...section.elements[elementIndex], ...updates };
    setEditSections(newSections);
    onChange(newSections);
  };

  const deleteElement = (sectionIndex: number, elementIndex: number) => {
    const newSections = [...editSections];
    const section = newSections[sectionIndex];
    section.elements.splice(elementIndex, 1);
    setEditSections(newSections);
    onChange(newSections);
  };

  const handleSectionSettings = (section: any, index: number) => {
    setSectionToEdit({ ...section, index });
    setIsSectionSettingsOpen(true);
  };

  const saveSectionSettings = () => {
    if (sectionToEdit) {
      const { index, ...rest } = sectionToEdit;
      updateSection(index, rest);
      setIsSectionSettingsOpen(false);
      setSectionToEdit(null);
    }
  };

  // If not admin, just render regular sections
  if (!isAdmin) {
    return (
      <>
        {editSections.map(section => (
          <section 
            key={section.id} 
            id={section.id} 
            style={{ 
              backgroundColor: section.bgColor || 'transparent',
              padding: section.padding || '1rem',
              margin: section.margin || '1rem 0'
            }}
          >
            {section.elements.map(element => (
              <div key={element.id}>
                <InlineEditable
                  type={element.type as any}
                  contentKey={element.contentKey}
                  defaultValue={element.defaultValue}
                />
              </div>
            ))}
          </section>
        ))}
      </>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Render editable sections */}
      {editSections.map((section, sectionIndex) => (
        <DraggableSection
          key={section.id}
          id={section.id}
          title={section.title}
          bgColor={section.bgColor}
          padding={section.padding}
          margin={section.margin}
          onMoveUp={sectionIndex > 0 ? () => {
            const newSections = [...editSections];
            [newSections[sectionIndex], newSections[sectionIndex - 1]] = 
              [newSections[sectionIndex - 1], newSections[sectionIndex]];
            setEditSections(newSections);
            onChange(newSections);
          } : undefined}
          onMoveDown={sectionIndex < editSections.length - 1 ? () => {
            const newSections = [...editSections];
            [newSections[sectionIndex], newSections[sectionIndex + 1]] = 
              [newSections[sectionIndex + 1], newSections[sectionIndex]];
            setEditSections(newSections);
            onChange(newSections);
          } : undefined}
          onDelete={() => deleteSection(sectionIndex)}
          onSettings={() => handleSectionSettings(section, sectionIndex)}
          onAddElement={(type) => addElement(sectionIndex, type)}
          isFirst={sectionIndex === 0}
          isLast={sectionIndex === editSections.length - 1}
          index={sectionIndex}
          moveSection={moveSection}
        >
          {section.elements.map((element, elementIndex) => (
            <DraggableElement
              key={element.id}
              id={element.id}
              type={element.type}
              contentKey={element.contentKey}
              defaultValue={element.defaultValue}
              onMoveUp={elementIndex > 0 ? () => {
                const newSections = [...editSections];
                const elements = newSections[sectionIndex].elements;
                [elements[elementIndex], elements[elementIndex - 1]] = 
                  [elements[elementIndex - 1], elements[elementIndex]];
                setEditSections(newSections);
                onChange(newSections);
              } : undefined}
              onMoveDown={elementIndex < section.elements.length - 1 ? () => {
                const newSections = [...editSections];
                const elements = newSections[sectionIndex].elements;
                [elements[elementIndex], elements[elementIndex + 1]] = 
                  [elements[elementIndex + 1], elements[elementIndex]];
                setEditSections(newSections);
                onChange(newSections);
              } : undefined}
              onDelete={() => deleteElement(sectionIndex, elementIndex)}
              isFirst={elementIndex === 0}
              isLast={elementIndex === section.elements.length - 1}
              index={elementIndex}
              moveElement={(dragIndex, hoverIndex) => moveElement(sectionIndex, dragIndex, hoverIndex)}
            />
          ))}
        </DraggableSection>
      ))}
      
      {/* Add new section button (only visible in edit mode) */}
      {isEditModeActive && (
        <div className="flex justify-center my-8">
          <Button
            variant="outline"
            onClick={addNewSection}
            className="border-dashed"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Adaugă secțiune nouă
          </Button>
        </div>
      )}
      
      {/* Section settings dialog */}
      <Dialog open={isSectionSettingsOpen} onOpenChange={setIsSectionSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setări secțiune</DialogTitle>
          </DialogHeader>
          {sectionToEdit && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-title">Titlu secțiune</Label>
                <Input
                  id="section-title"
                  value={sectionToEdit.title}
                  onChange={(e) => setSectionToEdit({ ...sectionToEdit, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section-bgcolor">Culoare fundal</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={sectionToEdit.bgColor || '#ffffff'}
                    onChange={(e) => setSectionToEdit({ ...sectionToEdit, bgColor: e.target.value })}
                    className="w-10 h-10"
                  />
                  <Input
                    id="section-bgcolor"
                    value={sectionToEdit.bgColor || 'transparent'}
                    onChange={(e) => setSectionToEdit({ ...sectionToEdit, bgColor: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section-padding">Padding (spațiu interior)</Label>
                <Input
                  id="section-padding"
                  value={sectionToEdit.padding || '1rem'}
                  onChange={(e) => setSectionToEdit({ ...sectionToEdit, padding: e.target.value })}
                />
                <p className="text-xs text-gray-500">Exemplu: 1rem, 20px, 2em, etc.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section-margin">Margin (spațiu exterior)</Label>
                <Input
                  id="section-margin"
                  value={sectionToEdit.margin || '1rem 0'}
                  onChange={(e) => setSectionToEdit({ ...sectionToEdit, margin: e.target.value })}
                />
                <p className="text-xs text-gray-500">Exemplu: 1rem 0, 20px 0, 2em 0, etc.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSectionSettingsOpen(false)}>
              Anulează
            </Button>
            <Button onClick={saveSectionSettings}>
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
};