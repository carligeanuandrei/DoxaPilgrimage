
import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Grid, List, Rows, Columns, Trash2, Plus, Move, Settings } from 'lucide-react';

// Definim tipurile pentru elementele de layout
interface LayoutElement {
  id: string;
  type: 'section' | 'card' | 'banner' | 'testimonial' | 'footer';
  title: string;
  columns: number;
  visible: boolean;
  height: string;
  backgroundColor: string;
  padding: string;
}

// Componenta pentru un element sortabil
const SortableItem = ({ element, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: element.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <div {...attributes} {...listeners} className="cursor-move p-1 mr-2">
              <Move size={18} />
            </div>
            <CardTitle className="text-sm">{element.title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(element)}>
              <Settings size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(element.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Tip: {element.type}</span>
            <span>Coloane: {element.columns}</span>
            <span>{element.visible ? "Vizibil" : "Ascuns"}</span>
          </div>
          <div 
            className="mt-2 p-2 rounded border"
            style={{ 
              backgroundColor: element.backgroundColor,
              height: element.height === 'auto' ? '20px' : element.height,
              padding: element.padding
            }}
          >
            <div className="flex h-full">
              {Array.from({ length: element.columns }).map((_, i) => (
                <div key={i} className="flex-1 border-r last:border-r-0 h-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Funcție pentru a salva layout-ul în localStorage
const saveLayout = (elements: LayoutElement[]) => {
  localStorage.setItem('doxa-layout', JSON.stringify(elements));
};

// Funcție pentru a încărca layout-ul din localStorage
const loadLayout = (): LayoutElement[] => {
  const savedLayout = localStorage.getItem('doxa-layout');
  return savedLayout ? JSON.parse(savedLayout) : [
    {
      id: '1',
      type: 'banner',
      title: 'Banner Principal',
      columns: 1,
      visible: true,
      height: '200px',
      backgroundColor: '#f3f4f6',
      padding: '16px',
    },
    {
      id: '2',
      type: 'section',
      title: 'Secțiunea Pelerinaje',
      columns: 3,
      visible: true,
      height: 'auto',
      backgroundColor: '#ffffff',
      padding: '24px',
    },
    {
      id: '3',
      type: 'testimonial',
      title: 'Testimoniale',
      columns: 2,
      visible: true,
      height: 'auto',
      backgroundColor: '#f9fafb',
      padding: '32px',
    },
    {
      id: '4',
      type: 'footer',
      title: 'Footer',
      columns: 4,
      visible: true,
      height: 'auto',
      backgroundColor: '#1f2937',
      padding: '48px',
    },
  ];
};

export const LayoutBuilder: React.FC = () => {
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>(loadLayout());
  const [editingElement, setEditingElement] = useState<LayoutElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handler pentru când un element este sortat
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLayoutElements((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Handler pentru editarea unui element
  const handleEditElement = (element: LayoutElement) => {
    setEditingElement({ ...element });
    setIsEditing(true);
  };
  
  // Handler pentru ștergerea unui element
  const handleDeleteElement = (id: string) => {
    if (window.confirm('Sigur doriți să ștergeți acest element?')) {
      setLayoutElements(prev => prev.filter(item => item.id !== id));
    }
  };
  
  // Handler pentru salvarea modificărilor unui element
  const handleSaveEdit = () => {
    if (editingElement) {
      setLayoutElements(prev => 
        prev.map(item => item.id === editingElement.id ? editingElement : item)
      );
      setIsEditing(false);
      setEditingElement(null);
    }
  };
  
  // Handler pentru adăugarea unui element nou
  const handleAddElement = () => {
    const newElement: LayoutElement = {
      id: Date.now().toString(),
      type: 'section',
      title: 'Secțiune Nouă',
      columns: 1,
      visible: true,
      height: 'auto',
      backgroundColor: '#ffffff',
      padding: '16px',
    };
    
    setLayoutElements(prev => [...prev, newElement]);
  };
  
  // Handler pentru salvarea layout-ului
  const handleSaveLayout = () => {
    saveLayout(layoutElements);
    alert('Layout-ul a fost salvat cu succes!');
  };
  
  // Handler pentru resetarea layout-ului
  const handleResetLayout = () => {
    if (window.confirm('Sigur doriți să resetați layout-ul la valorile implicite?')) {
      const defaultLayout = [
        {
          id: '1',
          type: 'banner',
          title: 'Banner Principal',
          columns: 1,
          visible: true,
          height: '200px',
          backgroundColor: '#f3f4f6',
          padding: '16px',
        },
        {
          id: '2',
          type: 'section',
          title: 'Secțiunea Pelerinaje',
          columns: 3,
          visible: true,
          height: 'auto',
          backgroundColor: '#ffffff',
          padding: '24px',
        },
        {
          id: '3',
          type: 'testimonial',
          title: 'Testimoniale',
          columns: 2,
          visible: true,
          height: 'auto',
          backgroundColor: '#f9fafb',
          padding: '32px',
        },
        {
          id: '4',
          type: 'footer',
          title: 'Footer',
          columns: 4,
          visible: true,
          height: 'auto',
          backgroundColor: '#1f2937',
          padding: '48px',
        },
      ];
      setLayoutElements(defaultLayout);
      saveLayout(defaultLayout);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Builder Layout</CardTitle>
          <CardDescription>Personalizează structura paginilor aplicației</CardDescription>
        </CardHeader>
        
        <CardContent>
          {isEditing && editingElement ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="element-title">Titlu</Label>
                <Input
                  id="element-title"
                  value={editingElement.title}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="element-type">Tip</Label>
                <Select
                  value={editingElement.type}
                  onValueChange={(value) => setEditingElement(prev => prev ? { ...prev, type: value as any } : null)}
                >
                  <SelectTrigger id="element-type">
                    <SelectValue placeholder="Selectează tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Secțiune</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="element-columns">Coloane</Label>
                <Select
                  value={editingElement.columns.toString()}
                  onValueChange={(value) => setEditingElement(prev => prev ? { ...prev, columns: parseInt(value) } : null)}
                >
                  <SelectTrigger id="element-columns">
                    <SelectValue placeholder="Selectează numărul de coloane" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 coloană</SelectItem>
                    <SelectItem value="2">2 coloane</SelectItem>
                    <SelectItem value="3">3 coloane</SelectItem>
                    <SelectItem value="4">4 coloane</SelectItem>
                    <SelectItem value="6">6 coloane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="element-height">Înălțime</Label>
                <Select
                  value={editingElement.height === 'auto' ? 'auto' : 'custom'}
                  onValueChange={(value) => setEditingElement(prev => prev ? { 
                    ...prev, 
                    height: value === 'auto' ? 'auto' : (prev.height === 'auto' ? '200px' : prev.height) 
                  } : null)}
                >
                  <SelectTrigger id="element-height">
                    <SelectValue placeholder="Selectează înălțimea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="custom">Personalizată</SelectItem>
                  </SelectContent>
                </Select>
                
                {editingElement.height !== 'auto' && (
                  <Input
                    className="mt-2"
                    value={editingElement.height}
                    onChange={(e) => setEditingElement(prev => prev ? { ...prev, height: e.target.value } : null)}
                    placeholder="ex: 200px, 10rem, 50vh"
                  />
                )}
              </div>
              
              <div>
                <Label htmlFor="element-bg-color">Culoare fundal</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: editingElement.backgroundColor }}
                  />
                  <Input
                    id="element-bg-color"
                    value={editingElement.backgroundColor}
                    onChange={(e) => setEditingElement(prev => prev ? { ...prev, backgroundColor: e.target.value } : null)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="element-padding">Padding</Label>
                <Input
                  id="element-padding"
                  value={editingElement.padding}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, padding: e.target.value } : null)}
                  placeholder="ex: 16px, 1rem 2rem"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingElement.visible}
                  onCheckedChange={(checked) => setEditingElement(prev => prev ? { ...prev, visible: checked } : null)}
                />
                <Label>Vizibil</Label>
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={layoutElements.map(item => item.id)}>
                <div className="space-y-2">
                  {layoutElements.map(element => (
                    <SortableItem 
                      key={element.id} 
                      element={element} 
                      onEdit={handleEditElement}
                      onDelete={handleDeleteElement}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setEditingElement(null);
              }}>
                Anulare
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvare Element
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetLayout}>
                  Resetare
                </Button>
                <Button variant="outline" onClick={handleAddElement}>
                  <Plus className="mr-1 h-4 w-4" /> Adaugă Element
                </Button>
              </div>
              <Button onClick={handleSaveLayout}>
                Salvare Layout
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Previzualizare Layout</CardTitle>
          <CardDescription>Așa va arăta structura paginii</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 border rounded p-4">
            {layoutElements.filter(elem => elem.visible).map(element => (
              <div 
                key={element.id}
                className="rounded"
                style={{ 
                  backgroundColor: element.backgroundColor,
                  padding: element.padding,
                  height: element.height === 'auto' ? 'auto' : element.height,
                  minHeight: '40px'
                }}
              >
                <div className="grid gap-4" style={{ 
                  gridTemplateColumns: `repeat(${element.columns}, minmax(0, 1fr))`
                }}>
                  {Array.from({ length: element.columns }).map((_, i) => (
                    <div key={i} className="border p-2 rounded min-h-[40px] text-center text-xs text-muted-foreground">
                      {element.title} - Col {i+1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LayoutBuilder;
