import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pencil, 
  Check, 
  X, 
  Image as ImageIcon,
  Type, 
  AlignLeft,
  Palette
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface InlineEditableProps {
  type: 'text' | 'html' | 'image' | 'color' | 'spacing';
  contentKey: string;
  defaultValue: string;
  className?: string;
  placeholder?: string;
  description?: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  colorProperty?: string;
  spacingSize?: 'small' | 'medium' | 'large';
}

export const InlineEditable: React.FC<InlineEditableProps> = ({
  type,
  contentKey,
  defaultValue,
  className = '',
  placeholder = 'Editează acest conținut',
  description = '',
  onChange,
  multiline = false,
  colorProperty = 'backgroundColor',
  spacingSize = 'medium'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue || '');
  const [originalValue, setOriginalValue] = useState(defaultValue || '');
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setValue(defaultValue || '');
    setOriginalValue(defaultValue || '');
  }, [defaultValue]);

  const isAdmin = user?.role === 'admin';

  const updateMutation = useMutation({
    mutationFn: async (data: { key: string, value: string, contentType: string, description?: string }) => {
      return apiRequest('PATCH', `/api/cms/${data.key}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Conținut actualizat',
        description: 'Modificările au fost salvate cu succes.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/cms/${contentKey}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/cms'] });
      if (onChange) onChange(value);
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare la actualizare',
        description: error.message || 'A apărut o eroare la salvarea modificărilor.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      key: contentKey,
      value,
      contentType: type,
      description
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing) {
      if (type === 'text') {
        return multiline ? (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px]"
          />
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full"
          />
        );
      } else if (type === 'html') {
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[200px] font-mono text-sm"
          />
        );
      } else if (type === 'image') {
        return (
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="URL Imagine"
              className="w-full"
            />
            {value && (
              <div className="mt-2 border rounded p-2 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Previzualizare:</p>
                <img 
                  src={value} 
                  alt="Previzualizare" 
                  className="max-h-40 max-w-full object-contain"
                />
              </div>
            )}
          </div>
        );
      } else if (type === 'color') {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                type="color" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Cod culoare (ex: #FF5733)"
                className="w-full"
              />
            </div>
            <div 
              className="mt-2 border rounded p-4 text-center" 
              style={{ [colorProperty]: value }}
            >
              Previzualizare {colorProperty}
            </div>
          </div>
        );
      } else if (type === 'spacing') {
        const spacingSizes = {
          small: '0.5rem',
          medium: '1rem',
          large: '2rem'
        };
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                min="0"
                max="10"
                step="0.5"
                className="w-32"
              />
              <span className="text-sm text-gray-500">rem</span>
              <div className="flex-1"></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('0.5')}
                className={value === '0.5' ? 'bg-primary/20' : ''}
              >
                S
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('1')}
                className={value === '1' ? 'bg-primary/20' : ''}
              >
                M
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setValue('2')}
                className={value === '2' ? 'bg-primary/20' : ''}
              >
                L
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center border rounded p-2 bg-gray-50">
              <div>Conținut</div>
              <div 
                className="w-full bg-primary/20" 
                style={{ height: `${value}rem` }}
              ></div>
              <div>Conținut</div>
            </div>
          </div>
        );
      }
    } else {
      if (type === 'text') {
        return (
          <div className={`inline-editable-content ${className}`}>
            {value || placeholder}
          </div>
        );
      } else if (type === 'html') {
        return (
          <div
            className={`inline-editable-content ${className}`}
            dangerouslySetInnerHTML={{ __html: value || placeholder }}
          />
        );
      } else if (type === 'image') {
        return value ? (
          <img 
            src={value} 
            alt={description || 'Imagine'} 
            className={`inline-editable-content ${className}`}
          />
        ) : (
          <div className={`inline-editable-placeholder ${className} bg-gray-100 flex items-center justify-center min-h-[100px] border border-dashed`}>
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        );
      } else if (type === 'color') {
        return (
          <div 
            className={`inline-editable-content ${className} h-8 w-8 rounded`}
            style={{ backgroundColor: value || '#CCCCCC' }}
          />
        );
      } else if (type === 'spacing') {
        return (
          <div 
            className={`inline-editable-content ${className}`}
            style={{ height: `${value || '1'}rem` }}
          />
        );
      }
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'text': return <Type size={16} />;
      case 'html': return <AlignLeft size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'color': return <Palette size={16} />;
      case 'spacing': return <div className="h-4 border-t border-b border-current w-4"></div>;
      default: return <Pencil size={16} />;
    }
  };

  if (!isAdmin) {
    // Render just the content for non-admin users
    if (type === 'text') return <span className={className}>{value}</span>;
    if (type === 'html') return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    if (type === 'image') return value ? <img src={value} alt={description || 'Imagine'} className={className} /> : null;
    if (type === 'color') return <div className={className} style={{ [colorProperty]: value }} />;
    if (type === 'spacing') return <div className={className} style={{ height: `${value || '1'}rem` }} />;
    return null;
  }

  return (
    <div 
      className={`inline-editable relative group ${isEditing ? 'editing' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {renderContent()}
      
      {!isEditing && showControls && (
        <div className="absolute -top-8 right-0 z-50 flex items-center space-x-1 bg-white shadow-md rounded-md px-2 py-1 text-xs border">
          <span className="text-gray-500 mr-1 flex items-center">
            {getTypeIcon()}
            <span className="ml-1">{contentKey}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Pencil size={12} />
          </Button>
        </div>
      )}
      
      {isEditing && (
        <div className="mt-2 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            <X size={16} className="mr-1" /> Anulează
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <span>Salvare...</span>
            ) : (
              <>
                <Check size={16} className="mr-1" /> Salvează
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};