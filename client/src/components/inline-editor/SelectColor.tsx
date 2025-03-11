import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SelectColorProps {
  id?: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function SelectColor({ id, value, onChange, className }: SelectColorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [tempColor, setTempColor] = useState(value);
  
  const presetColors = [
    '#000000', // black
    '#ffffff', // white
    '#f44336', // red
    '#e91e63', // pink
    '#9c27b0', // purple
    '#673ab7', // deep purple
    '#3f51b5', // indigo
    '#2196f3', // blue
    '#03a9f4', // light blue
    '#00bcd4', // cyan
    '#009688', // teal
    '#4caf50', // green
    '#8bc34a', // light green
    '#cddc39', // lime
    '#ffeb3b', // yellow
    '#ffc107', // amber
    '#ff9800', // orange
    '#ff5722', // deep orange
    '#795548', // brown
    '#607d8b', // blue grey
  ];
  
  const handlePresetSelect = (color: string) => {
    setTempColor(color);
    onChange(color);
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTempColor(color);
  };
  
  const handleColorInputBlur = () => {
    onChange(tempColor);
  };
  
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div 
          className={cn(
            "flex items-center border rounded-md cursor-pointer h-10 overflow-hidden", 
            className
          )}
        >
          <div 
            style={{ backgroundColor: value }} 
            className="w-10 h-full"
          />
          <div className="flex-1 px-3 truncate">{value}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: tempColor }}
              className="w-8 h-8 rounded-md"
            />
            <Input
              id={id}
              type="text"
              value={tempColor}
              onChange={handleColorChange}
              onBlur={handleColorInputBlur}
              className="flex-1"
            />
            <Input
              type="color"
              value={tempColor}
              onChange={handleColorChange}
              onBlur={handleColorInputBlur}
              className="w-10 h-10 p-1 cursor-pointer"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Culori predefinite</label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  style={{ backgroundColor: color }}
                  className="w-full aspect-square rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handlePresetSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}