import { Monastery } from '@shared/schema';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { formatRegionName } from '@/lib/format-utils';

interface MonasteryCardProps {
  monastery: Monastery;
}

export function MonasteryCard({ monastery }: MonasteryCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={monastery.coverImage || (monastery.images && monastery.images.length > 0 ? monastery.images[0] : '/images/default-monastery.jpg')} 
          alt={monastery.name}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary/80 hover:bg-primary">{formatRegionName(monastery.region)}</Badge>
        </div>
        {monastery.type !== 'monastery' && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="capitalize">
              {monastery.type === 'hermitage' ? 'Schit' : monastery.type === 'church' ? 'Biserică' : monastery.type}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <h3 className="text-lg font-semibold line-clamp-2">{monastery.name}</h3>
        <p className="text-sm text-muted-foreground">{monastery.city}, {monastery.county}</p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm line-clamp-3">
          {monastery.shortDescription || (monastery.description ? monastery.description.substring(0, 120) + '...' : 'Informații despre această mănăstire în curând...')}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <p className="text-sm">
          <span className="font-semibold">Hram:</span> {monastery.patronSaint}
        </p>
        <Link href={`/monasteries/${monastery.slug}`}>
          <a className="text-sm text-primary hover:underline">Detalii →</a>
        </Link>
      </CardFooter>
    </Card>
  );
}