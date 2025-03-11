import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SpacingControlsProps {
  content: Record<string, any>;
  onChange: (updatedContent: Record<string, any>) => void;
}

export function SpacingControls({ content, onChange }: SpacingControlsProps) {
  // Extragem valorile numerice din proprietățile CSS (ex: '20px' -> 20)
  const extractNumericValue = (value: string | undefined) => {
    if (!value) return '';
    return value.replace('px', '');
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-medium mb-3">Spațiere și margini</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="paddingTop">Padding Sus (px)</Label>
          <Input
            id="paddingTop"
            type="number"
            value={extractNumericValue(content.paddingTop)}
            onChange={e => onChange({
              ...content, 
              paddingTop: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="paddingBottom">Padding Jos (px)</Label>
          <Input
            id="paddingBottom"
            type="number"
            value={extractNumericValue(content.paddingBottom)}
            onChange={e => onChange({
              ...content, 
              paddingBottom: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="paddingLeft">Padding Stânga (px)</Label>
          <Input
            id="paddingLeft"
            type="number"
            value={extractNumericValue(content.paddingLeft)}
            onChange={e => onChange({
              ...content, 
              paddingLeft: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="paddingRight">Padding Dreapta (px)</Label>
          <Input
            id="paddingRight"
            type="number"
            value={extractNumericValue(content.paddingRight)}
            onChange={e => onChange({
              ...content, 
              paddingRight: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <Label htmlFor="marginTop">Margin Sus (px)</Label>
          <Input
            id="marginTop"
            type="number"
            value={extractNumericValue(content.marginTop)}
            onChange={e => onChange({
              ...content, 
              marginTop: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="marginBottom">Margin Jos (px)</Label>
          <Input
            id="marginBottom"
            type="number"
            value={extractNumericValue(content.marginBottom)}
            onChange={e => onChange({
              ...content, 
              marginBottom: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="marginLeft">Margin Stânga (px)</Label>
          <Input
            id="marginLeft"
            type="number"
            value={extractNumericValue(content.marginLeft)}
            onChange={e => onChange({
              ...content, 
              marginLeft: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="marginRight">Margin Dreapta (px)</Label>
          <Input
            id="marginRight"
            type="number"
            value={extractNumericValue(content.marginRight)}
            onChange={e => onChange({
              ...content, 
              marginRight: e.target.value ? `${e.target.value}px` : undefined
            })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}