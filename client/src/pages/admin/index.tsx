
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Paintbrush, Users, Church, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panou de Administrare</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
          <TabsTrigger value="content">Conținut</TabsTrigger>
          <TabsTrigger value="users">Utilizatori</TabsTrigger>
          <TabsTrigger value="pilgrimages">Pelerinaje</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Design și Layout</CardTitle>
                <CardDescription>Personalizează aspectul aplicației</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/builder">
                  <Button className="w-full">
                    <Paintbrush className="mr-2 h-4 w-4" /> Builder Design
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gestiune Utilizatori</CardTitle>
                <CardDescription>Administrează conturile utilizatorilor</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/users">
                  <Button className="w-full">
                    <Users className="mr-2 h-4 w-4" /> Utilizatori
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gestiune Pelerinaje</CardTitle>
                <CardDescription>Administrează pelerinajele</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/pilgrimages">
                  <Button className="w-full">
                    <Church className="mr-2 h-4 w-4" /> Pelerinaje
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Statistici Organizatori</CardTitle>
                <CardDescription>Vizualizează date despre organizatori</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/organizer-stats">
                  <Button className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" /> Statistici
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gestiune CMS</CardTitle>
                <CardDescription>Administrează conținutul site-ului</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/cms">
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> CMS
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>Design Builder</CardTitle>
              <CardDescription>Personalizează aspectul și tema aplicației</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizează Builder Design pentru a personaliza aspectul aplicației, inclusiv culorile, fonturile, spațierile și alte elemente de design.</p>
              <Link to="/admin/builder">
                <Button size="lg">
                  <Paintbrush className="mr-2 h-5 w-5" /> Deschide Builder Design
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alte taburi pentru secțiunile de administrare */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Administrare Conținut</CardTitle>
              <CardDescription>Gestionează conținutul site-ului</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/cms">
                <Button size="lg">
                  <FileText className="mr-2 h-5 w-5" /> Gestiune CMS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Administrare Utilizatori</CardTitle>
              <CardDescription>Gestionează conturile utilizatorilor</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/users">
                <Button size="lg">
                  <Users className="mr-2 h-5 w-5" /> Gestiune Utilizatori
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pilgrimages">
          <Card>
            <CardHeader>
              <CardTitle>Administrare Pelerinaje</CardTitle>
              <CardDescription>Gestionează pelerinajele disponibile</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/pilgrimages">
                <Button size="lg">
                  <Church className="mr-2 h-5 w-5" /> Gestiune Pelerinaje
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
