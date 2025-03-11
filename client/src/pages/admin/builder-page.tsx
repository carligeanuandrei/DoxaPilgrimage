import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useCmsContent } from '@/hooks/use-cms-content';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  PlusCircle, 
  Image, 
  FileText, 
  Layout, 
  Type, 
  Save, 
  Trash2, 
  Move, 
  Edit,
  FileUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CmsContent } from '@shared/schema';
import { CmsText, CmsHtml, CmsImage } from '@/components/shared/cms-content';

// Tipuri pentru componentele builder-ului
type BuilderComponent = {
  id: string;
  type: 'heading' | 'text' | 'image' | 'spacer' | 'button' | 'cmsContent';
  content?: string;
  cmsKey?: string;
  properties?: Record<string, any>;
};

type BuilderSection = {
  id: string;
  title: string;
  components: BuilderComponent[];
};

type BuilderPage = {
  id: string;
  title: string;
  slug: string;
  sections: BuilderSection[];
  isPublished: boolean;
};

// Componenta pentru elementele de builder
const BuilderElement = ({ element, onDrop, index, onEdit, onDelete, onMoveUp, onMoveDown }: {
  element: BuilderComponent;
  index: number;
  onDrop: (item: any, targetIndex: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'builder-element',
    item: { id: element.id, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'builder-element',
    drop: (item: any) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return <h2 className="text-2xl font-bold">{element.content || 'Titlu'}</h2>;
      case 'text':
        return <p className="text-base">{element.content || 'Text de conținut'}</p>;
      case 'image':
        return <img src={element.content || '/placeholder-image.jpg'} alt="Imagine" className="w-full h-auto rounded-md" />;
      case 'spacer':
        return <div className="h-8 w-full border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">Spațiu</div>;
      case 'button':
        return <Button>{element.content || 'Buton'}</Button>;
      case 'cmsContent':
        if (!element.cmsKey) return <div className="text-red-500">Selectați o cheie CMS</div>;
        return (
          <div className="border border-gray-200 p-2 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Conținut CMS: {element.cmsKey}</div>
            {element.properties?.type === 'text' && <CmsText contentKey={element.cmsKey} fallback="Conținut text din CMS" />}
            {element.properties?.type === 'html' && <CmsHtml contentKey={element.cmsKey} fallback="<p>Conținut HTML din CMS</p>" />}
            {element.properties?.type === 'image' && <CmsImage contentKey={element.cmsKey} fallbackSrc="/placeholder-image.jpg" alt="Imagine din CMS" />}
          </div>
        );
      default:
        return <div>Element necunoscut</div>;
    }
  };

  return (
    <div 
      ref={(node) => drag(drop(node))}
      className={`relative p-4 mb-2 border rounded-md ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-blue-500' : 'border-gray-200'}`}
    >
      <div className="absolute top-2 right-2 flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onMoveUp(element.id)} title="Mută în sus">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onMoveDown(element.id)} title="Mută în jos">
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(element.id)} title="Editează">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(element.id)} title="Șterge">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" title="Trage pentru a muta">
          <Move className="h-4 w-4" />
        </Button>
      </div>
      <div className="pt-6">
        {renderElement()}
      </div>
    </div>
  );
};

// Componenta pentru secțiunile de builder
const BuilderSection = ({ section, onUpdateSection }: {
  section: BuilderSection;
  onUpdateSection: (sectionId: string, updatedSection: BuilderSection) => void;
}) => {
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [components, setComponents] = useState<BuilderComponent[]>(section.components);
  const [editingComponent, setEditingComponent] = useState<BuilderComponent | null>(null);
  const cmsContent = useCmsContent();
  
  // Convertim contenturile CMS într-un obiect cmsData pentru ușurință în utilizare
  const cmsData: Record<string, string> = {};
  if (cmsContent.cmsContents) {
    cmsContent.cmsContents.forEach(item => {
      cmsData[item.key] = item.value;
    });
  }

  // Funcție pentru a gestiona editarea unei componente
  const handleEditComponent = (id: string) => {
    const component = components.find(c => c.id === id);
    if (component) {
      setEditingComponent({ ...component });
    }
  };

  // Funcție pentru a gestiona ștergerea unei componente
  const handleDeleteComponent = (id: string) => {
    const newComponents = components.filter(c => c.id !== id);
    setComponents(newComponents);
    onUpdateSection(section.id, {
      ...section,
      components: newComponents
    });
  };

  // Funcție pentru a gestiona mutarea unei componente în sus
  const handleMoveComponentUp = (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index > 0) {
      const newComponents = [...components];
      const temp = newComponents[index];
      newComponents[index] = newComponents[index - 1];
      newComponents[index - 1] = temp;
      setComponents(newComponents);
      onUpdateSection(section.id, {
        ...section,
        components: newComponents
      });
    }
  };

  // Funcție pentru a gestiona mutarea unei componente în jos
  const handleMoveComponentDown = (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index < components.length - 1) {
      const newComponents = [...components];
      const temp = newComponents[index];
      newComponents[index] = newComponents[index + 1];
      newComponents[index + 1] = temp;
      setComponents(newComponents);
      onUpdateSection(section.id, {
        ...section,
        components: newComponents
      });
    }
  };

  // Funcție pentru a gestiona drop-ul unei componente
  const handleDrop = (item: any, targetIndex: number) => {
    const sourceIndex = components.findIndex(c => c.id === item.id);
    if (sourceIndex === targetIndex) return;

    const newComponents = [...components];
    const [removed] = newComponents.splice(sourceIndex, 1);
    newComponents.splice(targetIndex, 0, removed);
    
    setComponents(newComponents);
    onUpdateSection(section.id, {
      ...section,
      components: newComponents
    });
  };

  // Funcție pentru a adăuga o nouă componentă
  const addComponent = (type: BuilderComponent['type']) => {
    const newComponent: BuilderComponent = {
      id: `component-${Date.now()}`,
      type,
      content: type === 'heading' ? 'Titlu nou' : 
               type === 'text' ? 'Text de conținut nou' : 
               type === 'button' ? 'Buton nou' : '',
      properties: {}
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    onUpdateSection(section.id, {
      ...section,
      components: newComponents
    });
  };

  // Funcție pentru a salva modificările unei componente
  const saveComponentChanges = () => {
    if (!editingComponent) return;
    
    const newComponents = components.map(c => 
      c.id === editingComponent.id ? editingComponent : c
    );
    
    setComponents(newComponents);
    onUpdateSection(section.id, {
      ...section,
      components: newComponents
    });
    
    setEditingComponent(null);
  };

  // Funcție pentru a salva modificările la titlul secțiunii
  const saveTitleChanges = () => {
    onUpdateSection(section.id, {
      ...section,
      title: editedTitle,
      components: components
    });
    setIsEditingTitle(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input 
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="font-bold"
            />
            <Button onClick={saveTitleChanges} size="sm">Salvează</Button>
          </div>
        ) : (
          <CardTitle className="flex items-center justify-between">
            {section.title}
            <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Editează titlul
            </Button>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {components.map((component, index) => (
          <BuilderElement 
            key={component.id}
            element={component}
            index={index}
            onDrop={handleDrop}
            onEdit={handleEditComponent}
            onDelete={handleDeleteComponent}
            onMoveUp={handleMoveComponentUp}
            onMoveDown={handleMoveComponentDown}
          />
        ))}
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button onClick={() => addComponent('heading')} variant="outline" className="flex items-center">
            <Type className="h-4 w-4 mr-2" />
            Adaugă titlu
          </Button>
          <Button onClick={() => addComponent('text')} variant="outline" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Adaugă text
          </Button>
          <Button onClick={() => addComponent('image')} variant="outline" className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Adaugă imagine
          </Button>
          <Button onClick={() => addComponent('spacer')} variant="outline" className="flex items-center">
            <Layout className="h-4 w-4 mr-2" />
            Adaugă spațiu
          </Button>
          <Button onClick={() => addComponent('button')} variant="outline" className="flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Adaugă buton
          </Button>
          <Button onClick={() => addComponent('cmsContent')} variant="outline" className="flex items-center">
            <FileUp className="h-4 w-4 mr-2" />
            Adaugă CMS
          </Button>
        </div>
      </CardContent>

      {/* Modal pentru editarea componentei */}
      {editingComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Editează componenta</CardTitle>
              <CardDescription>Modifică proprietățile componentei</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingComponent.type === 'heading' && (
                <div className="space-y-2">
                  <Label htmlFor="heading-content">Conținut titlu</Label>
                  <Input 
                    id="heading-content" 
                    value={editingComponent.content || ''} 
                    onChange={(e) => setEditingComponent({
                      ...editingComponent,
                      content: e.target.value
                    })}
                  />
                </div>
              )}
              
              {editingComponent.type === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="text-content">Conținut text</Label>
                  <textarea 
                    id="text-content" 
                    className="w-full min-h-[100px] p-2 border rounded-md"
                    value={editingComponent.content || ''} 
                    onChange={(e) => setEditingComponent({
                      ...editingComponent,
                      content: e.target.value
                    })}
                  />
                </div>
              )}
              
              {editingComponent.type === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL imagine</Label>
                  <Input 
                    id="image-url" 
                    value={editingComponent.content || ''} 
                    onChange={(e) => setEditingComponent({
                      ...editingComponent,
                      content: e.target.value
                    })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
              
              {editingComponent.type === 'button' && (
                <div className="space-y-2">
                  <Label htmlFor="button-text">Text buton</Label>
                  <Input 
                    id="button-text" 
                    value={editingComponent.content || ''} 
                    onChange={(e) => setEditingComponent({
                      ...editingComponent,
                      content: e.target.value
                    })}
                  />
                  
                  <Label htmlFor="button-url">URL acțiune</Label>
                  <Input 
                    id="button-url" 
                    value={editingComponent.properties?.url || ''} 
                    onChange={(e) => setEditingComponent({
                      ...editingComponent,
                      properties: {
                        ...editingComponent.properties,
                        url: e.target.value
                      }
                    })}
                    placeholder="https://example.com or /page"
                  />
                </div>
              )}
              
              {editingComponent.type === 'cmsContent' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cms-key">Cheie CMS</Label>
                    <select 
                      id="cms-key"
                      className="w-full p-2 border rounded-md"
                      value={editingComponent.cmsKey || ''}
                      onChange={(e) => setEditingComponent({
                        ...editingComponent,
                        cmsKey: e.target.value
                      })}
                    >
                      <option value="">Selectează o cheie CMS</option>
                      {Object.keys(cmsData).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cms-type">Tip conținut</Label>
                    <select 
                      id="cms-type"
                      className="w-full p-2 border rounded-md"
                      value={editingComponent.properties?.type || 'text'}
                      onChange={(e) => setEditingComponent({
                        ...editingComponent,
                        properties: {
                          ...editingComponent.properties,
                          type: e.target.value
                        }
                      })}
                    >
                      <option value="text">Text</option>
                      <option value="html">HTML</option>
                      <option value="image">Imagine</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setEditingComponent(null)}>Anulează</Button>
              <Button onClick={saveComponentChanges}>Salvează</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
};

// Componenta principală pentru builder-ul de pagini
export default function BuilderPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<BuilderPage>({
    id: `page-${Date.now()}`,
    title: 'Pagină nouă',
    slug: 'pagina-noua',
    sections: [
      {
        id: `section-${Date.now()}`,
        title: 'Secțiune nouă',
        components: []
      }
    ],
    isPublished: false
  });
  
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [isEditingPageDetails, setIsEditingPageDetails] = useState(false);
  
  useEffect(() => {
    // Aici s-ar încărca paginile salvate din baza de date
    // Pentru demo, folosim localStorage
    const savedPages = localStorage.getItem('builderPages');
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        console.error('Error loading saved pages:', e);
      }
    }
  }, []);
  
  // Funcție pentru a actualiza o secțiune
  const handleUpdateSection = (sectionId: string, updatedSection: BuilderSection) => {
    const newSections = currentPage.sections.map(section => 
      section.id === sectionId ? updatedSection : section
    );
    
    setCurrentPage({
      ...currentPage,
      sections: newSections
    });
  };
  
  // Funcție pentru a adăuga o nouă secțiune
  const addSection = () => {
    const newSection: BuilderSection = {
      id: `section-${Date.now()}`,
      title: `Secțiune ${currentPage.sections.length + 1}`,
      components: []
    };
    
    setCurrentPage({
      ...currentPage,
      sections: [...currentPage.sections, newSection]
    });
  };
  
  // Funcție pentru a șterge o secțiune
  const deleteSection = (sectionId: string) => {
    if (currentPage.sections.length === 1) {
      toast({
        title: "Nu se poate șterge",
        description: "Pagina trebuie să aibă cel puțin o secțiune.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentPage({
      ...currentPage,
      sections: currentPage.sections.filter(section => section.id !== sectionId)
    });
  };
  
  // Funcție pentru a salva pagina curentă
  const savePage = () => {
    const pageExists = pages.some(page => page.id === currentPage.id);
    let updatedPages;
    
    if (pageExists) {
      updatedPages = pages.map(page => 
        page.id === currentPage.id ? currentPage : page
      );
    } else {
      updatedPages = [...pages, currentPage];
    }
    
    setPages(updatedPages);
    localStorage.setItem('builderPages', JSON.stringify(updatedPages));
    
    toast({
      title: "Pagină salvată",
      description: "Pagina a fost salvată cu succes."
    });
  };
  
  // Funcție pentru a încărca o pagină existentă
  const loadPage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page) {
      setCurrentPage(page);
    }
  };
  
  // Funcție pentru a crea o pagină nouă
  const createNewPage = () => {
    setCurrentPage({
      id: `page-${Date.now()}`,
      title: 'Pagină nouă',
      slug: 'pagina-noua',
      sections: [
        {
          id: `section-${Date.now()}`,
          title: 'Secțiune nouă',
          components: []
        }
      ],
      isPublished: false
    });
  };
  
  // Funcție pentru a publica/anula publicarea paginii
  const togglePublish = () => {
    setCurrentPage({
      ...currentPage,
      isPublished: !currentPage.isPublished
    });
    
    toast({
      title: currentPage.isPublished ? "Pagină retrasă" : "Pagină publicată",
      description: currentPage.isPublished 
        ? "Pagina a fost retrasă de la publicare." 
        : "Pagina a fost publicată și este vizibilă pentru utilizatori."
    });
  };

  // Verificăm dacă utilizatorul are permisiune de admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acces interzis</CardTitle>
            <CardDescription>
              Trebuie să fiți administrator pentru a accesa această pagină.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Builder de pagini</h1>
          <div className="flex gap-2">
            <Button onClick={savePage} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Salvează
            </Button>
            <Button onClick={togglePublish} variant={currentPage.isPublished ? "destructive" : "default"}>
              {currentPage.isPublished ? "Anulează publicarea" : "Publică"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="pages">Pagini salvate</TabsTrigger>
            <TabsTrigger value="settings">Setări pagină</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle>{currentPage.title}</CardTitle>
                <CardDescription>Slug: /{currentPage.slug}</CardDescription>
              </CardHeader>
            </Card>

            {currentPage.sections.map(section => (
              <div key={section.id} className="relative">
                <BuilderSection 
                  section={section} 
                  onUpdateSection={handleUpdateSection} 
                />
                
                {currentPage.sections.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2" 
                    onClick={() => deleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button onClick={addSection} variant="outline" className="w-full flex items-center justify-center">
              <PlusCircle className="h-4 w-4 mr-2" />
              Adaugă secțiune
            </Button>
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle>Pagini salvate</CardTitle>
                <CardDescription>Pagini create în builder</CardDescription>
              </CardHeader>
              <CardContent>
                {pages.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Nu există pagini salvate încă.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pages.map(page => (
                      <Card key={page.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{page.title}</h3>
                            <p className="text-sm text-muted-foreground">/{page.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => loadPage(page.id)}>
                              Editează
                            </Button>
                            <Button variant={page.isPublished ? "default" : "secondary"} size="sm">
                              {page.isPublished ? "Publicată" : "Nepublicată"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={createNewPage}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Creează pagină nouă
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Setările paginii</CardTitle>
                <CardDescription>Editează detaliile paginii curente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="page-title">Titlu pagină</Label>
                  <Input 
                    id="page-title" 
                    value={currentPage.title} 
                    onChange={(e) => setCurrentPage({
                      ...currentPage,
                      title: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="page-slug">Slug pagină</Label>
                  <div className="flex items-center">
                    <span className="mr-2">/</span>
                    <Input 
                      id="page-slug" 
                      value={currentPage.slug} 
                      onChange={(e) => setCurrentPage({
                        ...currentPage,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL-ul paginii va fi: yourdomain.com/{currentPage.slug}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  );
}