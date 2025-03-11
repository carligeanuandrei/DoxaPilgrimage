
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ColorPicker } from './ColorPicker';

// Definim tipurile pentru tema
interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  border: string;
}

interface ThemeSpacing {
  small: number;
  medium: number;
  large: number;
}

interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

interface ThemeSettings {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: number;
}

// Tema implicită
const defaultTheme: ThemeSettings = {
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#6b7280',
    border: '#e5e7eb',
  },
  spacing: {
    small: 4,
    medium: 8,
    large: 16,
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: 14,
      medium: 16,
      large: 18,
      xlarge: 24,
    },
  },
  borderRadius: 8,
};

// Funcție pentru a aplica tema pe document
const applyTheme = (theme: ThemeSettings) => {
  const root = document.documentElement;
  
  // Aplicăm culorile
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Aplicăm spațierile
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, `${value}px`);
  });
  
  // Aplicăm tipografia
  root.style.setProperty(`--font-family`, theme.typography.fontFamily);
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, `${value}px`);
  });
  
  // Aplicăm border radius
  root.style.setProperty(`--border-radius`, `${theme.borderRadius}px`);
};

// Funcție pentru a salva tema în localStorage
const saveTheme = (theme: ThemeSettings) => {
  localStorage.setItem('doxa-theme', JSON.stringify(theme));
};

// Funcție pentru a încărca tema din localStorage
const loadTheme = (): ThemeSettings => {
  const savedTheme = localStorage.getItem('doxa-theme');
  return savedTheme ? JSON.parse(savedTheme) : defaultTheme;
};

export const ThemeBuilder: React.FC = () => {
  const [theme, setTheme] = useState<ThemeSettings>(loadTheme());
  const [previewKey, setPreviewKey] = useState(0);
  
  // Aplicăm tema la încărcare și când se schimbă
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  // Handler pentru schimbarea culorilor
  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      }
    }));
  };
  
  // Handler pentru schimbarea spațierilor
  const handleSpacingChange = (spacingKey: keyof ThemeSpacing, value: number) => {
    setTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [spacingKey]: value,
      }
    }));
  };
  
  // Handler pentru schimbarea fontului
  const handleFontFamilyChange = (value: string) => {
    setTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: value,
      }
    }));
  };
  
  // Handler pentru schimbarea dimensiunii fontului
  const handleFontSizeChange = (sizeKey: keyof ThemeTypography['fontSize'], value: number) => {
    setTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontSize: {
          ...prev.typography.fontSize,
          [sizeKey]: value,
        }
      }
    }));
  };
  
  // Handler pentru schimbarea border radius
  const handleBorderRadiusChange = (value: number) => {
    setTheme(prev => ({
      ...prev,
      borderRadius: value,
    }));
  };
  
  // Salvează tema
  const handleSave = () => {
    saveTheme(theme);
    alert('Tema a fost salvată cu succes!');
  };
  
  // Resetează tema la valorile implicite
  const handleReset = () => {
    if (window.confirm('Sigur doriți să resetați tema la valorile implicite?')) {
      setTheme(defaultTheme);
      saveTheme(defaultTheme);
    }
  };
  
  // Generează previzualizare
  const handlePreview = () => {
    // Incrementăm cheia pentru a forța re-renderarea
    setPreviewKey(prev => prev + 1);
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Builder Tema</CardTitle>
          <CardDescription>Personalizează aspectul aplicației tale</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="colors">
            <TabsList className="mb-4">
              <TabsTrigger value="colors">Culori</TabsTrigger>
              <TabsTrigger value="typography">Tipografie</TabsTrigger>
              <TabsTrigger value="spacing">Spațiere</TabsTrigger>
              <TabsTrigger value="other">Altele</TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <Label htmlFor={`color-${key}`} className="capitalize">{key}</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: value }}
                      />
                      <Input
                        id={`color-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key as keyof ThemeColors, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="typography">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Input
                    id="font-family"
                    value={theme.typography.fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  {Object.entries(theme.typography.fontSize).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{key}</span>
                        <span>{value}px</span>
                      </div>
                      <Slider
                        value={[value]}
                        min={8}
                        max={48}
                        step={1}
                        onValueChange={(vals) => handleFontSizeChange(key as keyof ThemeTypography['fontSize'], vals[0])}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="spacing">
              <div className="space-y-4">
                {Object.entries(theme.spacing).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="capitalize">{key}</Label>
                      <span>{value}px</span>
                    </div>
                    <Slider
                      value={[value]}
                      min={0}
                      max={48}
                      step={1}
                      onValueChange={(vals) => handleSpacingChange(key as keyof ThemeSpacing, vals[0])}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="other">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Border Radius</Label>
                    <span>{theme.borderRadius}px</span>
                  </div>
                  <Slider
                    value={[theme.borderRadius]}
                    min={0}
                    max={24}
                    step={1}
                    onValueChange={(vals) => handleBorderRadiusChange(vals[0])}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Resetare
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePreview}>
              Previzualizare
            </Button>
            <Button onClick={handleSave}>
              Salvare
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card key={previewKey}>
        <CardHeader>
          <CardTitle>Previzualizare</CardTitle>
          <CardDescription>Așa va arăta tema ta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 style={{ fontFamily: theme.typography.fontFamily, fontSize: `${theme.typography.fontSize.xlarge}px` }}>
                Heading 1
              </h1>
              <h2 style={{ fontFamily: theme.typography.fontFamily, fontSize: `${theme.typography.fontSize.large}px` }}>
                Heading 2
              </h2>
              <p style={{ fontFamily: theme.typography.fontFamily, fontSize: `${theme.typography.fontSize.medium}px` }}>
                Acesta este un paragraf cu textul normal. El folosește fontul și dimensiunea de font selectate.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button style={{ backgroundColor: theme.colors.primary, borderRadius: `${theme.borderRadius}px` }}>
                Primary Button
              </Button>
              <Button variant="secondary" style={{ backgroundColor: theme.colors.secondary, borderRadius: `${theme.borderRadius}px` }}>
                Secondary Button
              </Button>
              <Button variant="outline" style={{ borderColor: theme.colors.border, borderRadius: `${theme.borderRadius}px` }}>
                Outline Button
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                style={{ 
                  padding: `${theme.spacing.medium}px`, 
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.background,
                  borderRadius: `${theme.borderRadius}px`
                }}
              >
                Accent Box
              </div>
              <div 
                style={{ 
                  padding: `${theme.spacing.medium}px`, 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderRadius: `${theme.borderRadius}px`,
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                Background Box
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeBuilder;
