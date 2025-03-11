
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [selectedColor, setSelectedColor] = useState(color);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 p-0 border-2"
          style={{ backgroundColor: selectedColor }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="color"
            value={selectedColor}
            onChange={handleChange}
            className="w-32 h-32"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => {
                setSelectedColor(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
