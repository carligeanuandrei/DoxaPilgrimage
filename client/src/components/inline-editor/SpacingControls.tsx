import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface SpacingControlsProps {
  content: Record<string, any>;
  onChange: (updatedContent: Record<string, any>) => void;
}

export function SpacingControls({ content, onChange }: SpacingControlsProps) {
  // Stare pentru a stoca valorile detectate
  const [defaultValues, setDefaultValues] = useState({
    // Desktop
    paddingTop: '',
    paddingBottom: '',
    paddingLeft: '',
    paddingRight: '',
    marginTop: '',
    marginBottom: '',
    marginLeft: '',
    marginRight: '',
    // Mobile
    mobilePaddingTop: '',
    mobilePaddingBottom: '',
    mobilePaddingLeft: '',
    mobilePaddingRight: '',
    mobileMarginTop: '',
    mobileMarginBottom: '',
    mobileMarginLeft: '',
    mobileMarginRight: ''
  });

  // Extragem valorile numerice din proprietățile CSS (ex: '20px' -> 20)
  const extractNumericValue = (value: string | undefined) => {
    if (!value) return '';
    return value.replace('px', '');
  };

  // Extrage valorile din clase Tailwind (py-4, mt-2, etc.) în pixeli
  const extractTailwindValues = (className?: string) => {
    if (!className) return {};
    
    const spacingMap: Record<string, number> = {
      '0': 0,
      '1': 4,
      '2': 8, 
      '3': 12,
      '4': 16,
      '5': 20,
      '6': 24,
      '8': 32,
      '10': 40,
      '12': 48,
      '16': 64
    };
    
    const values: Record<string, string> = {};
    const classes = className.split(' ');
    
    // Padding
    const pyMatch = classes.find(c => /^py-\d+$/.test(c));
    if (pyMatch) {
      const value = pyMatch.replace('py-', '');
      if (spacingMap[value]) {
        values.paddingTop = `${spacingMap[value]}px`;
        values.paddingBottom = `${spacingMap[value]}px`;
      }
    }
    
    const pxMatch = classes.find(c => /^px-\d+$/.test(c));
    if (pxMatch) {
      const value = pxMatch.replace('px-', '');
      if (spacingMap[value]) {
        values.paddingLeft = `${spacingMap[value]}px`;
        values.paddingRight = `${spacingMap[value]}px`;
      }
    }

    const ptMatch = classes.find(c => /^pt-\d+$/.test(c));
    if (ptMatch) {
      const value = ptMatch.replace('pt-', '');
      if (spacingMap[value]) {
        values.paddingTop = `${spacingMap[value]}px`;
      }
    }

    const pbMatch = classes.find(c => /^pb-\d+$/.test(c));
    if (pbMatch) {
      const value = pbMatch.replace('pb-', '');
      if (spacingMap[value]) {
        values.paddingBottom = `${spacingMap[value]}px`;
      }
    }

    const plMatch = classes.find(c => /^pl-\d+$/.test(c));
    if (plMatch) {
      const value = plMatch.replace('pl-', '');
      if (spacingMap[value]) {
        values.paddingLeft = `${spacingMap[value]}px`;
      }
    }

    const prMatch = classes.find(c => /^pr-\d+$/.test(c));
    if (prMatch) {
      const value = prMatch.replace('pr-', '');
      if (spacingMap[value]) {
        values.paddingRight = `${spacingMap[value]}px`;
      }
    }
    
    // Margin
    const myMatch = classes.find(c => /^my-\d+$/.test(c));
    if (myMatch) {
      const value = myMatch.replace('my-', '');
      if (spacingMap[value]) {
        values.marginTop = `${spacingMap[value]}px`;
        values.marginBottom = `${spacingMap[value]}px`;
      }
    }
    
    const mxMatch = classes.find(c => /^mx-\d+$/.test(c));
    if (mxMatch) {
      const value = mxMatch.replace('mx-', '');
      if (spacingMap[value]) {
        values.marginLeft = `${spacingMap[value]}px`;
        values.marginRight = `${spacingMap[value]}px`;
      }
    }

    const mtMatch = classes.find(c => /^mt-\d+$/.test(c));
    if (mtMatch) {
      const value = mtMatch.replace('mt-', '');
      if (spacingMap[value]) {
        values.marginTop = `${spacingMap[value]}px`;
      }
    }

    const mbMatch = classes.find(c => /^mb-\d+$/.test(c));
    if (mbMatch) {
      const value = mbMatch.replace('mb-', '');
      if (spacingMap[value]) {
        values.marginBottom = `${spacingMap[value]}px`;
      }
    }

    const mlMatch = classes.find(c => /^ml-\d+$/.test(c));
    if (mlMatch) {
      const value = mlMatch.replace('ml-', '');
      if (spacingMap[value]) {
        values.marginLeft = `${spacingMap[value]}px`;
      }
    }

    const mrMatch = classes.find(c => /^mr-\d+$/.test(c));
    if (mrMatch) {
      const value = mrMatch.replace('mr-', '');
      if (spacingMap[value]) {
        values.marginRight = `${spacingMap[value]}px`;
      }
    }

    // Mobile-specific classes (sm:px-4, md:py-6)
    const smPxMatch = classes.find(c => /^sm:px-\d+$/.test(c));
    if (smPxMatch) {
      const value = smPxMatch.replace('sm:px-', '');
      if (spacingMap[value]) {
        values.mobilePaddingLeft = `${spacingMap[value]}px`;
        values.mobilePaddingRight = `${spacingMap[value]}px`;
      }
    }

    const smPyMatch = classes.find(c => /^sm:py-\d+$/.test(c));
    if (smPyMatch) {
      const value = smPyMatch.replace('sm:py-', '');
      if (spacingMap[value]) {
        values.mobilePaddingTop = `${spacingMap[value]}px`;
        values.mobilePaddingBottom = `${spacingMap[value]}px`;
      }
    }

    const smPtMatch = classes.find(c => /^sm:pt-\d+$/.test(c));
    if (smPtMatch) {
      const value = smPtMatch.replace('sm:pt-', '');
      if (spacingMap[value]) {
        values.mobilePaddingTop = `${spacingMap[value]}px`;
      }
    }

    const smPbMatch = classes.find(c => /^sm:pb-\d+$/.test(c));
    if (smPbMatch) {
      const value = smPbMatch.replace('sm:pb-', '');
      if (spacingMap[value]) {
        values.mobilePaddingBottom = `${spacingMap[value]}px`;
      }
    }

    const smPlMatch = classes.find(c => /^sm:pl-\d+$/.test(c));
    if (smPlMatch) {
      const value = smPlMatch.replace('sm:pl-', '');
      if (spacingMap[value]) {
        values.mobilePaddingLeft = `${spacingMap[value]}px`;
      }
    }

    const smPrMatch = classes.find(c => /^sm:pr-\d+$/.test(c));
    if (smPrMatch) {
      const value = smPrMatch.replace('sm:pr-', '');
      if (spacingMap[value]) {
        values.mobilePaddingRight = `${spacingMap[value]}px`;
      }
    }

    const smMxMatch = classes.find(c => /^sm:mx-\d+$/.test(c));
    if (smMxMatch) {
      const value = smMxMatch.replace('sm:mx-', '');
      if (spacingMap[value]) {
        values.mobileMarginLeft = `${spacingMap[value]}px`;
        values.mobileMarginRight = `${spacingMap[value]}px`;
      }
    }

    const smMyMatch = classes.find(c => /^sm:my-\d+$/.test(c));
    if (smMyMatch) {
      const value = smMyMatch.replace('sm:my-', '');
      if (spacingMap[value]) {
        values.mobileMarginTop = `${spacingMap[value]}px`;
        values.mobileMarginBottom = `${spacingMap[value]}px`;
      }
    }
    
    return values;
  };
  
  // Detectează valorile existente din proprietăți și clase
  const detectExistingValues = () => {
    // Valori din proprietățile CSS explicit definite
    const explicitValues = {
      // Desktop
      paddingTop: content.paddingTop,
      paddingBottom: content.paddingBottom,
      paddingLeft: content.paddingLeft,
      paddingRight: content.paddingRight,
      marginTop: content.marginTop,
      marginBottom: content.marginBottom,
      marginLeft: content.marginLeft,
      marginRight: content.marginRight,
      // Mobile
      mobilePaddingTop: content.mobilePaddingTop,
      mobilePaddingBottom: content.mobilePaddingBottom,
      mobilePaddingLeft: content.mobilePaddingLeft,
      mobilePaddingRight: content.mobilePaddingRight,
      mobileMarginTop: content.mobileMarginTop,
      mobileMarginBottom: content.mobileMarginBottom,
      mobileMarginLeft: content.mobileMarginLeft,
      mobileMarginRight: content.mobileMarginRight
    };
    
    // Valori din clasele Tailwind
    const tailwindValues = extractTailwindValues(content.className);
    
    // Combinăm valorile, prioritizând cele explicit definite
    const detectedValues = {
      ...tailwindValues,
      ...explicitValues
    };
    
    setDefaultValues(detectedValues);
    
    // Dacă nu avem valori explicite, le actualizăm automat cu cele detectate din clase
    if (!content.paddingTop && !content.paddingBottom && !content.paddingLeft && 
        !content.paddingRight && !content.marginTop && !content.marginBottom && 
        !content.marginLeft && !content.marginRight) {
      onChange({
        ...content,
        ...detectedValues
      });
    }
  };
  
  useEffect(() => {
    detectExistingValues();
  }, [content.className]);
  
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Spațiere și margini</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={detectExistingValues} 
          title="Detectează valorile din clasele CSS"
        >
          <RefreshCw size={14} className="mr-1" /> Detectează
        </Button>
      </div>

      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="desktop" className="flex items-center justify-center">
            <Monitor size={16} className="mr-2" /> Desktop
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center justify-center">
            <Smartphone size={16} className="mr-2" /> Mobil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="desktop">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="paddingTop">Padding Sus (px)</Label>
              <Input
                id="paddingTop"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.paddingTop) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.paddingBottom) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.paddingLeft) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.paddingRight) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.marginTop) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.marginBottom) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.marginLeft) || '0'}`}
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
                placeholder={`${extractNumericValue(defaultValues.marginRight) || '0'}`}
                value={extractNumericValue(content.marginRight)}
                onChange={e => onChange({
                  ...content, 
                  marginRight: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="mobile">
          <div className="p-2 bg-gray-50 rounded-lg mb-3">
            <p className="text-xs text-gray-500">Aceste setări se vor aplica doar pe dispozitive mobile. Dacă nu sunt setate, se vor folosi valorile pentru desktop.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mobilePaddingTop">Padding Sus (px)</Label>
              <Input
                id="mobilePaddingTop"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobilePaddingTop) || extractNumericValue(defaultValues.paddingTop) || '0'}`}
                value={extractNumericValue(content.mobilePaddingTop)}
                onChange={e => onChange({
                  ...content, 
                  mobilePaddingTop: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobilePaddingBottom">Padding Jos (px)</Label>
              <Input
                id="mobilePaddingBottom"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobilePaddingBottom) || extractNumericValue(defaultValues.paddingBottom) || '0'}`}
                value={extractNumericValue(content.mobilePaddingBottom)}
                onChange={e => onChange({
                  ...content, 
                  mobilePaddingBottom: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobilePaddingLeft">Padding Stânga (px)</Label>
              <Input
                id="mobilePaddingLeft"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobilePaddingLeft) || extractNumericValue(defaultValues.paddingLeft) || '0'}`}
                value={extractNumericValue(content.mobilePaddingLeft)}
                onChange={e => onChange({
                  ...content, 
                  mobilePaddingLeft: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobilePaddingRight">Padding Dreapta (px)</Label>
              <Input
                id="mobilePaddingRight"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobilePaddingRight) || extractNumericValue(defaultValues.paddingRight) || '0'}`}
                value={extractNumericValue(content.mobilePaddingRight)}
                onChange={e => onChange({
                  ...content, 
                  mobilePaddingRight: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <Label htmlFor="mobileMarginTop">Margin Sus (px)</Label>
              <Input
                id="mobileMarginTop"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobileMarginTop) || extractNumericValue(defaultValues.marginTop) || '0'}`}
                value={extractNumericValue(content.mobileMarginTop)}
                onChange={e => onChange({
                  ...content, 
                  mobileMarginTop: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobileMarginBottom">Margin Jos (px)</Label>
              <Input
                id="mobileMarginBottom"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobileMarginBottom) || extractNumericValue(defaultValues.marginBottom) || '0'}`}
                value={extractNumericValue(content.mobileMarginBottom)}
                onChange={e => onChange({
                  ...content, 
                  mobileMarginBottom: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobileMarginLeft">Margin Stânga (px)</Label>
              <Input
                id="mobileMarginLeft"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobileMarginLeft) || extractNumericValue(defaultValues.marginLeft) || '0'}`}
                value={extractNumericValue(content.mobileMarginLeft)}
                onChange={e => onChange({
                  ...content, 
                  mobileMarginLeft: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mobileMarginRight">Margin Dreapta (px)</Label>
              <Input
                id="mobileMarginRight"
                type="number"
                placeholder={`${extractNumericValue(defaultValues.mobileMarginRight) || extractNumericValue(defaultValues.marginRight) || '0'}`}
                value={extractNumericValue(content.mobileMarginRight)}
                onChange={e => onChange({
                  ...content, 
                  mobileMarginRight: e.target.value ? `${e.target.value}px` : undefined
                })}
                className="mt-1"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}