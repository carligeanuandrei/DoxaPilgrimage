import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FilePlus, 
  Settings, 
  Save, 
  X, 
  Edit,
  Eye, 
  EyeOff,
  Trash
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface PageControllerProps {
  pageId?: number;
  pageType?: string;
  pageTitle?: string;
  pageSlug?: string;
  pageContent?: string;
  isEditable?: boolean;
}

export const PageController: React.FC<PageControllerProps> = ({
  pageId,
  pageType = '',
  pageTitle = '',
  pageSlug = '',
  pageContent = '{}',
  isEditable = false
}) => {
  const [, navigate] = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editModeActive, setEditModeActive] = useState(false);
  
  // State for page settings
  const [title, setTitle] = useState(pageTitle);
  const [slug, setSlug] = useState(pageSlug);
  const [type, setType] = useState(pageType);
  const [html, setHtml] = useState('');
  const [meta, setMeta] = useState('');

  // State for new page
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newType, setNewType] = useState('custom');

  const isAdmin = user?.role === 'admin';

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: { 
      id: number, 
      title: string, 
      slug: string, 
      pageType: string, 
      content?: string, 
      meta?: string 
    }) => {
      return apiRequest('PUT', `/api/pages/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Pagină actualizată',
        description: 'Pagina a fost actualizată cu succes.',
      });
      setIsPageSettingsOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${pageId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare la actualizare',
        description: error.message || 'A apărut o eroare la actualizarea paginii.',
        variant: 'destructive',
      });
    },
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: { 
      title: string, 
      slug: string, 
      pageType: string,
      content?: string,
      meta?: string
    }) => {
      return apiRequest('POST', '/api/pages', data);
    },
    onSuccess: (response) => {
      toast({
        title: 'Pagină creată',
        description: 'Pagina a fost creată cu succes.',
      });
      setIsCreatePageOpen(false);
      
      // Reset form
      setNewTitle('');
      setNewSlug('');
      setNewType('custom');
      
      // Navigate to the new page
      response.json().then(data => {
        navigate(`/${data.slug}`);
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare la creare',
        description: error.message || 'A apărut o eroare la crearea paginii.',
        variant: 'destructive',
      });
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/pages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Pagină ștearsă',
        description: 'Pagina a fost ștearsă cu succes.',
      });
      setIsDeleteConfirmOpen(false);
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Eroare la ștergere',
        description: error.message || 'A apărut o eroare la ștergerea paginii.',
        variant: 'destructive',
      });
    },
  });

  const handleSavePageSettings = () => {
    if (!pageId) return;
    
    updatePageMutation.mutate({
      id: pageId,
      title,
      slug,
      pageType: type,
      meta
    });
  };

  const handleCreatePage = () => {
    createPageMutation.mutate({
      title: newTitle,
      slug: newSlug || newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      pageType: newType,
      content: '{}',
      meta: '{}'
    });
  };

  const handleDeletePage = () => {
    if (!pageId) return;
    deletePageMutation.mutate(pageId);
  };

  // Toggle edit mode on/off
  const toggleEditMode = () => {
    setEditModeActive(!editModeActive);
    // Dispatch custom event to notify editable components
    window.dispatchEvent(
      new CustomEvent('toggleEditMode', { detail: { active: !editModeActive } })
    );
  };

  if (!isAdmin) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        <Button
          variant={editModeActive ? "default" : "outline"}
          size="sm"
          className={`rounded-full w-10 h-10 p-0 shadow-lg ${editModeActive ? 'bg-primary text-primary-foreground' : 'bg-white'}`}
          onClick={toggleEditMode}
          title={editModeActive ? "Dezactivează modul de editare" : "Activează modul de editare"}
        >
          {editModeActive ? <EyeOff size={18} /> : <Edit size={18} />}
        </Button>

        {isEditable && pageId && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 p-0 shadow-lg bg-white"
            onClick={() => setIsPageSettingsOpen(true)}
            title="Setări pagină"
          >
            <Settings size={18} />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-full w-10 h-10 p-0 shadow-lg bg-white"
          onClick={() => setIsCreatePageOpen(true)}
          title="Pagină nouă"
        >
          <FilePlus size={18} />
        </Button>
      </div>

      {/* Page Settings Dialog */}
      <Dialog open={isPageSettingsOpen} onOpenChange={setIsPageSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setări pagină</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Avansat</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlu</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titlul paginii"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-pagina"
                />
                <p className="text-xs text-gray-500">Pagina va fi accesibilă la: {window.location.origin}/{slug}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tip pagină</Label>
                <Input
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Tipul paginii"
                />
                <p className="text-xs text-gray-500">Exemple: home, about, contact, etc.</p>
              </div>
              <div className="pt-2 flex justify-between">
                <Button 
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash size={16} className="mr-1" /> Șterge
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsPageSettingsOpen(false)}>
                    Anulează
                  </Button>
                  <Button onClick={handleSavePageSettings} disabled={updatePageMutation.isPending}>
                    {updatePageMutation.isPending ? 'Salvare...' : 'Salvează'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="meta">Meta date (JSON)</Label>
                <Textarea
                  id="meta"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                  placeholder="{}"
                  className="font-mono min-h-[150px]"
                />
                <p className="text-xs text-gray-500">Metadate pentru pagină (SEO, taguri, etc)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="html">HTML custom</Label>
                <Textarea
                  id="html"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<div>HTML custom pentru această pagină</div>"
                  className="font-mono min-h-[150px]"
                />
                <p className="text-xs text-gray-500">HTML custom (utilizat doar pentru cazuri speciale)</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create New Page Dialog */}
      <Dialog open={isCreatePageOpen} onOpenChange={setIsCreatePageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creare pagină nouă</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newTitle">Titlu</Label>
              <Input
                id="newTitle"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  // Auto-generate slug if empty
                  if (!newSlug) {
                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }
                }}
                placeholder="Titlul paginii"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newSlug">URL (slug)</Label>
              <Input
                id="newSlug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="url-pagina"
              />
              <p className="text-xs text-gray-500">Pagina va fi accesibilă la: {window.location.origin}/{newSlug}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newType">Tip pagină</Label>
              <Input
                id="newType"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Tipul paginii"
              />
              <p className="text-xs text-gray-500">Exemple: custom, article, product, etc.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatePageOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleCreatePage} disabled={createPageMutation.isPending}>
              {createPageMutation.isPending ? 'Creare...' : 'Creează pagină'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmare ștergere</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Ești sigur că vrei să ștergi această pagină? Această acțiune nu poate fi anulată.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Anulează
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePage}
              disabled={deletePageMutation.isPending}
            >
              {deletePageMutation.isPending ? 'Ștergere...' : 'Șterge definitiv'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};