// Funcții utilitare pentru formatarea datelor

/**
 * Transformă numele regiunii în format pentru afișare
 * @param region Codul regiunii din enum
 * @returns Numele formatat al regiunii
 */
export function formatRegionName(region: string): string {
  if (!region) return 'Regiune necunoscută';
  
  const regionMap: Record<string, string> = {
    'moldova': 'Moldova',
    'bucovina': 'Bucovina',
    'maramures': 'Maramureș',
    'transilvania': 'Transilvania',
    'banat': 'Banat',
    'crisana': 'Crișana',
    'oltenia': 'Oltenia',
    'muntenia': 'Muntenia',
    'dobrogea': 'Dobrogea',
  };
  
  return regionMap[region.toLowerCase()] || region;
}

/**
 * Formatează data unui hram pentru afișare
 * @param date Data hramului
 * @returns Data formatată pentru afișare
 */
export function formatPatronSaintDate(date?: Date | string | null): string {
  if (!date) return 'Data necunoscută';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Data necunoscută';
  
  // Formatăm data în stilul românesc
  return dateObj.toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Grupează mănăstirile după regiune
 * @param monasteries Lista de mănăstiri
 * @returns Un obiect cu mănăstirile grupate după regiune
 */
export function groupMonasteriesByRegion<T extends { region: string }>(monasteries: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};
  
  monasteries.forEach(monastery => {
    const region = monastery.region || 'nedefinit';
    if (!grouped[region]) {
      grouped[region] = [];
    }
    grouped[region].push(monastery);
  });
  
  return grouped;
}