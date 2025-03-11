import React, { useState } from 'react';
import { X, Edit, Settings, PlusCircle, Trash2, MoveUp, MoveDown, Copy, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface InlineEditControlsProps {
  isAdmin: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onAddSection: (position: 'before' | 'after') => void;
  onRemoveSection: () => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onDuplicateSection: () => void;
  onStyleChange: (styles: Record<string, any>) => void;
  currentStyles: Record<string, any>;
}

export function InlineEditControls({
  isAdmin,
  isEditing,
  onEditToggle,
  onAddSection,
  onRemoveSection,
  onMoveSection,
  onDuplicateSection,
  onStyleChange,
  currentStyles
}: InlineEditControlsProps) {
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  
  if (!isAdmin) return null;

  return (
    <div className="inline-edit-controls fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2">
      <Button 
        variant={isEditing ? "default" : "outline"} 
        size="sm" 
        onClick={onEditToggle}
        className="flex items-center gap-1"
      >
        {isEditing ? <X size={16} /> : <Edit size={16} />}
        {isEditing ? 'Închide editarea' : 'Editează pagina'}
      </Button>
      
      {isEditing && (
        <>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onAddSection('before')}>
              <PlusCircle size={16} className="mr-1" /> Adaugă sus
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddSection('after')}>
              <PlusCircle size={16} className="mr-1" /> Adaugă jos
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onMoveSection('up')}>
              <MoveUp size={16} className="mr-1" /> Sus
            </Button>
            <Button variant="outline" size="sm" onClick={() => onMoveSection('down')}>
              <MoveDown size={16} className="mr-1" /> Jos
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={onDuplicateSection}>
              <Copy size={16} className="mr-1" /> Duplică
            </Button>
            <Button variant="destructive" size="sm" onClick={onRemoveSection}>
              <Trash2 size={16} className="mr-1" /> Șterge
            </Button>
          </div>
          
          <Popover open={showStyleEditor} onOpenChange={setShowStyleEditor}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette size={16} className="mr-1" /> Stiluri
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Tabs defaultValue="spacing">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="spacing">Spațiere</TabsTrigger>
                  <TabsTrigger value="colors">Culori</TabsTrigger>
                  <TabsTrigger value="typography">Text</TabsTrigger>
                </TabsList>
                
                <TabsContent value="spacing" className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Padding (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Sus</label>
                        <Input 
                          type="number" 
                          value={currentStyles.paddingTop || 0}
                          onChange={(e) => onStyleChange({ paddingTop: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Jos</label>
                        <Input 
                          type="number" 
                          value={currentStyles.paddingBottom || 0}
                          onChange={(e) => onStyleChange({ paddingBottom: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Stânga</label>
                        <Input 
                          type="number" 
                          value={currentStyles.paddingLeft || 0}
                          onChange={(e) => onStyleChange({ paddingLeft: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Dreapta</label>
                        <Input 
                          type="number" 
                          value={currentStyles.paddingRight || 0}
                          onChange={(e) => onStyleChange({ paddingRight: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Margin (px)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs">Sus</label>
                        <Input 
                          type="number" 
                          value={currentStyles.marginTop || 0}
                          onChange={(e) => onStyleChange({ marginTop: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Jos</label>
                        <Input 
                          type="number" 
                          value={currentStyles.marginBottom || 0}
                          onChange={(e) => onStyleChange({ marginBottom: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Stânga</label>
                        <Input 
                          type="number" 
                          value={currentStyles.marginLeft || 0}
                          onChange={(e) => onStyleChange({ marginLeft: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-xs">Dreapta</label>
                        <Input 
                          type="number" 
                          value={currentStyles.marginRight || 0}
                          onChange={(e) => onStyleChange({ marginRight: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Culoare text</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={currentStyles.color || '#000000'}
                        onChange={(e) => onStyleChange({ color: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={currentStyles.color || '#000000'}
                        onChange={(e) => onStyleChange({ color: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Culoare fundal</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        value={currentStyles.backgroundColor || '#ffffff'}
                        onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <Input 
                        type="text" 
                        value={currentStyles.backgroundColor || '#ffffff'}
                        onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="typography" className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mărime font (px)</label>
                    <Input 
                      type="number" 
                      value={currentStyles.fontSize || 16}
                      onChange={(e) => onStyleChange({ fontSize: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font weight</label>
                    <Slider 
                      min={100} 
                      max={900} 
                      step={100} 
                      value={[currentStyles.fontWeight || 400]}
                      onValueChange={(value) => onStyleChange({ fontWeight: value[0] })}
                    />
                    <div className="flex justify-between text-xs">
                      <span>Light</span>
                      <span>Normal</span>
                      <span>Bold</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aliniere text</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['left', 'center', 'right', 'justify'].map((align) => (
                        <Button 
                          key={align}
                          variant={currentStyles.textAlign === align ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => onStyleChange({ textAlign: align })}
                        >
                          {align.charAt(0).toUpperCase() + align.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}