import { Monastery } from '@shared/schema';
import { MonasteryCard } from './MonasteryCard';
import { formatRegionName, groupMonasteriesByRegion } from '@/lib/format-utils';

interface MonasteriesListProps {
  monasteries: Monastery[];
  groupByRegion?: boolean;
}

export function MonasteriesList({ monasteries, groupByRegion = true }: MonasteriesListProps) {
  if (monasteries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold text-center">Nu am găsit mănăstiri</h3>
        <p className="text-muted-foreground text-center mt-2">
          Vă rugăm să încercați alte criterii de căutare sau reveniți mai târziu.
        </p>
      </div>
    );
  }

  if (!groupByRegion) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {monasteries.map((monastery) => (
          <MonasteryCard key={monastery.id} monastery={monastery} />
        ))}
      </div>
    );
  }

  // Grupăm mănăstirile după regiune
  const groupedMonasteries = groupMonasteriesByRegion(monasteries);
  const regions = Object.keys(groupedMonasteries).sort((a, b) => 
    formatRegionName(a).localeCompare(formatRegionName(b))
  );

  return (
    <div className="space-y-12">
      {regions.map((region) => (
        <div key={region} className="space-y-4">
          <h2 className="text-2xl font-bold border-b pb-1">
            {formatRegionName(region)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedMonasteries[region].map((monastery) => (
              <MonasteryCard key={monastery.id} monastery={monastery} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}