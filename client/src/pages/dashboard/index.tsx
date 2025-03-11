

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Paintbrush } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Panou de control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Personalizare Design</CardTitle>
            <CardDescription>Modifică aspectul și tema aplicației</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/builder">
              <Button className="w-full">
                <Paintbrush className="mr-2 h-4 w-4" /> Builder Design
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        {/* Adaugă alte carduri pentru funcționalități dashboard aici */}
      </div>
    </div>
  );
};

export default DashboardPage;
