import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, PaintBucket, Layers } from 'lucide-react';

interface CssControlsProps {
  content: Record<string, any>;
  onChange: (updatedContent: Record<string, any>) => void;
}

export function CssControls({ content, onChange }: CssControlsProps) {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center mb-3">
        <Code size={18} className="mr-2 text-primary" />
        <h3 className="font-medium">Personalizare CSS</h3>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm font-medium text-gray-600">
            <div className="flex items-center">
              <PaintBucket size={14} className="mr-2" />
              Clase CSS și ID
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <Label htmlFor="css-classes" className="text-xs">
                  Clasă CSS (ex: my-custom-class)
                </Label>
                <Input
                  id="css-classes"
                  placeholder="class1 class2 class3"
                  value={content.className || ''}
                  onChange={e => onChange({ ...content, className: e.target.value })}
                  className="mt-1 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separați mai multe clase cu spațiu.
                </p>
              </div>
              
              <div>
                <Label htmlFor="css-id" className="text-xs">
                  ID CSS (ex: section-hero)
                </Label>
                <Input
                  id="css-id"
                  placeholder="my-unique-id"
                  value={content.id_css || ''}
                  onChange={e => onChange({ ...content, id_css: e.target.value })}
                  className="mt-1 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID-ul trebuie să fie unic pe pagină.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-sm font-medium text-gray-600">
            <div className="flex items-center">
              <Layers size={14} className="mr-2" />
              CSS Inline
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Tabs defaultValue="desktop" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="desktop">Desktop</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
              </TabsList>
              
              <TabsContent value="desktop">
                <ScrollArea className="h-[150px] w-full rounded border p-2">
                  <Label htmlFor="custom-css" className="text-xs">CSS personalizat</Label>
                  <textarea
                    id="custom-css"
                    placeholder="color: red;\nbackground-color: #f5f5f5;\nfont-weight: bold;"
                    value={content.customCss || ''}
                    onChange={e => onChange({ ...content, customCss: e.target.value })}
                    className="w-full h-[100px] mt-1 text-xs font-mono p-2 border rounded-md resize-none"
                  />
                </ScrollArea>
                <p className="text-xs text-gray-500 mt-1">
                  Scrieți proprietăți CSS fără acolade. Ex: color: red;
                </p>
              </TabsContent>
              
              <TabsContent value="mobile">
                <ScrollArea className="h-[150px] w-full rounded border p-2">
                  <Label htmlFor="custom-css-mobile" className="text-xs">CSS personalizat pentru mobil</Label>
                  <textarea
                    id="custom-css-mobile"
                    placeholder="font-size: 14px;\npadding: 10px;"
                    value={content.customCssMobile || ''}
                    onChange={e => onChange({ ...content, customCssMobile: e.target.value })}
                    className="w-full h-[100px] mt-1 text-xs font-mono p-2 border rounded-md resize-none"
                  />
                </ScrollArea>
                <p className="text-xs text-gray-500 mt-1">
                  Aceste stiluri se vor aplica doar pe dispozitive mobile.
                </p>
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}