
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThemeBuilder from '@/components/admin/ThemeBuilder';
import LayoutBuilder from '@/components/admin/LayoutBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SaveAll, Undo, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BuilderPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('theme');
  
  const handleExportSettings = () => {
    try {
      const themeSettings = localStorage.getItem('doxa-theme');
      const layoutSettings = localStorage.getItem('doxa-layout');
      
      const exportData = {
        theme: themeSettings ? JSON.parse(themeSettings) : null,
        layout: layoutSettings ? JSON.parse(layoutSettings) : null,
        exportDate: new Date().toISOString()
      };
      
      // Creează un blob cu datele exportate
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Creează un element de link pentru descărcare
      const a = document.createElement('a');
      a.href = url;
      a.download = `doxa-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Curăță
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Export reușit',
        description: 'Setările au fost exportate cu succes.',
      });
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast({
        title: 'Eroare la export',
        description: 'A apărut o eroare la exportarea setărilor.',
        variant: 'destructive'
      });
    }
  };
  
  const handleImportSettings = () => {
    // Creează un input de fișier invizibil
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string);
          
          // Verifică structura datelor importate
          if (importedData.theme) {
            localStorage.setItem('doxa-theme', JSON.stringify(importedData.theme));
          }
          
          if (importedData.layout) {
            localStorage.setItem('doxa-layout', JSON.stringify(importedData.layout));
          }
          
          toast({
            title: 'Import reușit',
            description: 'Setările au fost importate cu succes. Reîmprospătează pagina pentru a vedea schimbările.',
          });
          
          // Reîncarcă pagina pentru a aplica setările
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Error importing settings:', error);
          toast({
            title: 'Eroare la import',
            description: 'Fișierul selectat nu conține date valide.',
            variant: 'destructive'
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  const handleResetAll = () => {
    if (window.confirm('Sigur doriți să resetați toate setările? Această acțiune nu poate fi anulată.')) {
      localStorage.removeItem('doxa-theme');
      localStorage.removeItem('doxa-layout');
      
      toast({
        title: 'Resetare completă',
        description: 'Toate setările au fost resetate la valorile implicite.',
      });
      
      // Reîncarcă pagina pentru a aplica resetarea
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Builder Design</CardTitle>
              <CardDescription>Personalizează aspectul și structura aplicației</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleImportSettings}>
                Import
              </Button>
              <Button variant="outline" onClick={handleExportSettings}>
                <SaveAll className="mr-1 h-4 w-4" /> Export
              </Button>
              <Button variant="outline" onClick={handleResetAll}>
                <Undo className="mr-1 h-4 w-4" /> Resetare totală
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="theme">Temă</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="code">Cod CSS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="theme">
              <ThemeBuilder />
            </TabsContent>
            
            <TabsContent value="layout">
              <LayoutBuilder />
            </TabsContent>
            
            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle>Editor CSS personalizat</CardTitle>
                  <CardDescription>Adaugă cod CSS personalizat pentru aplicație</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <textarea
                      className="w-full h-64 font-mono text-sm p-4 border rounded"
                      placeholder="/* Adaugă codul CSS personalizat aici */
:root {
  --custom-color: #3b82f6;
}

.custom-header {
  background-color: var(--custom-color);
  padding: 1rem;
}"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>
                      <Code className="mr-1 h-4 w-4" /> Aplică CSS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuilderPage;
